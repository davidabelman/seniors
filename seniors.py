import os
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask.ext.script import Manager
from flask.ext.moment import Moment
from werkzeug.security import generate_password_hash, check_password_hash
#from secret import SECRET_KEY
from mailgun import send_access_token_email
from tools.bing_search import bing_search_and_return_urls
from tools.icons import animals
from model import User, load_user
import dropbox_upload
import mongo
import json, urllib, urllib2
import datetime
import random
import time

app = Flask(__name__)
SECRET_KEY = os.environ['SENIORS_SECRET_KEY']
app.secret_key = SECRET_KEY
manager = Manager(app)
moment = Moment(app)

#MONGO
db = mongo.start_up_mongo()
Users = db.users
Posts = db.posts

# JSON ENCODING
from bson.objectid import ObjectId
class Encoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        elif isinstance(obj, datetime.datetime):
        	return obj.isoformat()
        else:
            return obj

# TOKENS
token_expiry_days = 30
base_url = "http://salt-and-pepper.herokuapp.com/invite/"

@app.before_request
def before_request():
	# If we have a user in our session variable, create a user object
    global USER 
    if session.get('user')==None:
    	USER = User( {} )
    else:
    	USER = User( session.get('user') )
    	USER.to_console()

@app.route('/')
def home():
	"""
	If logged in, user sees main feed, if not, they see the main 'about' page
	"""
	# USER = User( session.get( 'user', {} ) )
	print "DEBUG: This is session['user'] variable -->", session.get('user')
	print "DEBUG: This is session -->", session.keys()
	print "DEBUG: This is USER variable -->", USER
	print "DEBUG: This is USER.is_a_user() -->", USER.is_a_user()
	print "\n headers:"
	print request.headers


	if USER.is_a_user() and session['logged_in']:
		return render_template('posts.html')
	else:
		return render_template('info.html')

@app.route('/enter', methods=['GET', 'POST'])
def enter():
	"""
	This is where you enter group name (to login), then choose your group member name, then type your password
	"""
	return render_template('login.html', network='')

@app.route('/enter/<network>', methods=['GET', 'POST'])
def enter_with_network_name(network):
	"""
	Same as enter, but network name already filled in and different instructions
	"""
	return render_template('login.html', network=network)

@app.route('/logout')
def logout():
	"""
	Resets the cookies etc. so the user is logged out
	"""
	session['logged_in'] = 0
	# print "DEBUG LOGOUT PRE CLEAR: This is session['user'] variable -->", session.get('user')
	# print "DEBUG LOGOUT PRE CLEAR: This is session -->", session.keys()
	session['user']=None
	# print "DEBUG LOGOUT POST CLEAR: This is session['user'] variable -->", session.get('user')
	# print "DEBUG LOGOUT POST CLEAR: This is session -->", session.keys()
	time.sleep(0.1)
	return redirect(url_for('home'))

@app.route('/signup', methods=['GET', 'POST'])
def signup():
	"""
	This is where one person creates the group, he/she is then the admin
	Other functions are called within this (via AJAX)
	"""
	return render_template('signup.html')

@app.route('/add_users', methods=['GET', 'POST'])
def add_users():
	"""
	This is where an admin can add other group members
	"""
	if USER.is_admin():
		return render_template('add_users.html')
	return redirect(url_for('home'))

@app.route('/invite/<token>', methods=['GET', 'POST'])
def accept_invite(token):
	"""
	Screen on which a user can join a group (only would reach this through secret access token)
	"""
	token = long(token)
	user = load_user(Users, {'token':token} )
	if user:	
		session['user'] = user
		USER = User( user )
		if USER._('token_not_used'):
			# Token not yet used
			if app.debug:
				print 'Days left on token:', token_expiry_days - ((datetime.datetime.utcnow() - USER._('token_sent')).days )

			if (datetime.datetime.utcnow() - USER._('token_sent')).days < token_expiry_days:
				# We have an unused token, and it is not yet expired.
				# This page lets the user register into this network, and then marks token as used (see create_account_join_network)
				return render_template('valid_token.html', name=USER._('name'), network=USER._('network'))
			else:
				# We have a token, but it has expired
				#session.clear()
				session['user']=None
				return render_template('expired_token.html', sender=USER._('admin_email'))
		else:
			# Token has been used already
			#session.clear()
			session['user']=None
			return render_template('used_token.html', sender=USER._('admin_email'))
	else:
		# The link was invalid
		#session.clear()
		session['user']=None
		return render_template('invalid_token.html')


@app.route('/help')
def help():
	"""
	This is a static help page with simple instructions
	"""
	return render_template('help.html')

@app.route('/settings')
def settings():
	"""
	For user to change settings (extra options for admin)
	"""
	# name = session.get('name')
	# email = session.get('email')
	# network = session.get('network')
	if USER.is_a_user():
		return render_template('settings.html', admin = USER._('role'), name=USER._('name'), email=USER._('email'), animals=animals)
	else:
		return redirect(url_for('home'))

@app.route('/add_image')
def add_image():
	"""
	Temporary - this will probably be within main page?
	"""
	return render_template('add_image.html')

@app.route('/finished')
def finished():
	"""
	Page when user has logged out
	"""
	session['logged_in'] = 0
	return render_template('finished.html')

###################### AJAX REPONDERS ######################

@app.route('/_network_users_list')
def network_users_list():
	"""
	Given a network, this function returns a JSON string of users to display on the screen
	Using method from http://runnable.com/UiPhLHanceFYAAAP/how-to-perform-ajax-in-flask-for-python
	"""
	# User has tried to log in so clear any session data
	session.clear()

	# See if network exists already
	network = request.args.get('network')
	users = list(Users.find({'network':network}, { 'name': 1, 'picture': 1, '_id':0 }))  # Return certain fields only
	if not users:
		message = "I'm sorry, it appears this group does not exist. Please try again."
		return json.dumps({'status':0, 'data':message})
	# If it does exist, we return the list of users (names, pics)
	return json.dumps({'status':1, 'data':users})

@app.route('/_check_network_username_password', methods=['GET', 'POST'])
def check_network_username_password():
	"""
	Given a network, username and password, this function will check the password and allow a login or not (True, False)
	"""

	network = request.json['network']
	username = request.json['username']
	password = request.json['password']	
	user = Users.find_one({'name':username, 'network':network})
	known_password_hash = user['password_hash']
	valid_password = check_password_hash(str(known_password_hash), str(password))
	
	if valid_password:
		# Get user object to store as session variable
		session['user'] = load_user(Users, {'name':username, 'network':network} )
		# session['user']['log_in_binary'] = 1
		session['logged_in']=1
		USER = session['user']

	else:
		session.clear()
		return json.dumps({'status':0, 'data':'This is not the correct password.'})

	return json.dumps({'status':int(valid_password)})

@app.route('/_submit_post_entry', methods=['GET', 'POST'])
def submit_feed_entry():
	"""
	Given a feed entry, this will check user is signed in, then add to database and return success or fail statement
	On the client side the entry is added to the top of the page
	"""
	content = request.json['content']
	if USER.is_a_user():
		to_add ={ 	
					'name': USER._('name'),
					'posted' : datetime.datetime.utcnow(), #.strftime('%Y-%m-%dT%H:%M:%S'),
					'body' : content,
					'network' : USER._('network'),
					'picture' : USER._('picture')
				}
		Posts.insert(to_add)
		response = 1
	else:
		response = 0
	
	if app.debug:
		print "Information received:", content
		print "Response:", response
	
	return json.dumps(int(response))


@app.route('/_get_posts')
def get_posts():
	"""
	Pulls posts from the server
	"""
	# USER = User( session.get( 'user', {} ) )
	limit = int(request.args.get('limit', 10))
	skip = int(request.args.get('skip', 0))
	if USER.is_a_user():
		posts = mongo.return_last_X_posts(Posts, network=USER._('network'), limit=limit, skip=skip)
		return json.dumps(list(posts), cls=Encoder)
	else:
		return "Authentication error: you are not logged in to your group."
		
@app.route('/_network_exists')
def network_exists():
	"""
	Determines whether network already exists
	"""
	network = request.args.get('network')
	users = list(Users.find({'network':network}))
	if users:
		response = 1
	else:
		response = 0
	return json.dumps(response)

@app.route('/_name_in_network_exists')
def name_in_network_exists():
	"""
	Determines whether network already exists
	"""
	network = request.args.get('network')
	name = request.args.get('name')
	users = list(Users.find({'network':network, 'name':name}))
	if users:
		response = 1
		print "There were already users with this name"
	else:
		response = 0
		print "No users with this name"
	return json.dumps(response)

@app.route('/_create_account_join_network', methods=['GET', 'POST'])
def create_account_join_network():
	"""
	Creates a new user joining an exiting group (based off an invite)
	This is the user adding their username & password from the email link
	"""
	name = request.json['name']
	password = request.json['password']
	token = long(USER._('token'))

	object_id = Users.find_one({'token':token}).get('_id')

	if object_id:
		# Update user data with login data
		Users.update(
			{'_id':object_id}, {"$set": {
													'name':name,
													'password_hash':generate_password_hash(password),
													'register' : datetime.datetime.utcnow(),
													'completed_registration' : True,
													'token_not_used' : False,
										}
								}, upsert=False
					)

		# Add session name as we didn't add it when they clicked on link (we didn't know name yet)
		session['user'] = load_user(Users, {'_id':object_id} )
		# session['user']['log_in_binary'] = 1
		session['logged_in']=1
		return json.dumps('[1]')
		
	else:
		print "Error: Can't find user. Though should be able to as they were created when token was."


@app.route('/_create_account_create_network', methods=['GET', 'POST'])
def create_account_create_network():
	"""
	Creates a new user (with admin status) and group
	"""
	name = request.json['name']
	email = request.json['email']
	network = request.json['network']
	password = request.json['password']
	picture = random.choice(animals)

	# Final check to make sure network not in use
	u1 = Users.find_one({'network':network})

	if not u1:
		to_add = { 	
						'name':name,
						'email':email,
						'password_hash': generate_password_hash(password),
						'register' : datetime.datetime.utcnow(), #.strftime('%Y-%m-%dT%H:%M:%S'),
						'picture' : picture,
						'online' : False, #TODO
						'network' : network,
						'role' : 1, # i.e. admin
						'completed_registration':True
				}
		# Add user to DB		
		Users.insert(to_add)

		# Sign user in
		session['user'] = load_user(Users, {'name':name, 'network':network} )
		# session['user']['log_in_binary'] = 1
		session['logged_in']=1
		USER = session['user']

		if app.debug:
			print "Added user (%s, %s) to database." %(name, network)
			print to_add

		# Add just one post to get things going
		to_add = { 	
					'name':'The Salt&Pepper Robot',
					'posted' : datetime.datetime.utcnow(), #.strftime('%Y-%m-%dT%H:%M:%S'),
					'body' : 'Ta-daa! Your group is ready to go. Have fun!',
					'network' : network,
					'picture' : 'robo'
				}
		Posts.insert(to_add)
		return json.dumps(1)

	else:
		return json.dumps("I'm sorry, it seems the group name is in use. Please try again.")

@app.route('/_add_user_on_behalf', methods=['GET', 'POST'])
def add_user_on_behalf():
	"""
	Creates a new user 
	(needs to check that current session is by user who is able to do this, and they're adding to correct network)
	"""
	name = request.json['name']
	password = request.json['password']
	# network = session.get('network')
	# admin_name = session.get('name')
	# admin_email = session.get('email')
	# admin_role = Users.find_one({'network':network, 'name':admin_name}).get('role')

	# Check someone is logged in and is an admin for that group
	if USER.is_admin():
		# Check that username does not exist already within this network
		existing = Users.find_one({'network':USER._('network'), 'name':name})
		if not existing:
			# No user exists with this username, we can add them
			to_add = { 	
						'name':name,
						'email':"",
						'admin_name' : USER._('name'),
						'admin_email': USER._('email'),
						'password_hash': generate_password_hash(password),
						'register' : datetime.datetime.utcnow(),
						'picture' : random.choice(animals),
						'online' : False, #TODO
						'network' : USER._('network'),
						'role' : 0, # i.e. admin
						'completed_registration':True
					}	
			Users.insert(to_add)
			return json.dumps(1)
		else:
			message =  "Name already exists in group. Please pick another name."
			return json.dumps(message)
	else:
		message = "Authentication error: you are not logged in to your group. Please contact us if you require assistance."
		return json.dumps(message)


@app.route('/_add_user_via_access_token', methods=['GET', 'POST'])
def add_user_via_access_token():
	"""
	Creates a new user (needs to check that current session is by user who is able to do this, and they're adding to correct network)
	This user then needs to accept by email via some access token to be taken to a page to decide on their username and password
	"""
	email = request.json['email']
	firstname = request.json['firstname']
	
	# Check if allowed to add people
	if USER.is_admin():
		# Check that username does not exist already within this network
		existing = Users.find_one({'network':USER._('network'), 'name':firstname})
		if not existing:
			# Generate access token and add user to database
			token = random.getrandbits(32)
			to_add = { 	
							'name':firstname,
							'email':email,
							'admin_email':USER._('email'),
							'password_hash': "",
							'register' : "",
							'picture' : random.choice(animals),
							'online' : False, #TODO
							'network' : USER._('network'),
							'role' : 0, # i.e. admin TODO
							'token' : token,
							'token_not_used' : True,
							'token_sent' : datetime.datetime.utcnow(),
							'completed_registration' : False
						}	
			Users.insert(to_add)

			# Send user an access token type of link
			access_url = base_url+str(token)
			send_access_token_email(
					sender=USER._('name'),
					sender_email=USER._('email'),
					network=USER._('network'),
					recipient=firstname,
					recipient_email=email,
					url=access_url
				)
			# All OK, return status 1
			return json.dumps(1)
		
		else:
			message = "Name already exists in group. Please pick another name."
			return json.dumps(message)
			
	else:
		message = "Authentication error: you are not logged in to your group. Please contact us if you require assistance."
		return json.dumps(message)


@app.route('/_get_bing_image_urls', methods=['GET', 'POST'])
def get_bing_image_urls():
	"""
	Given a query string and extra parameters (e.g. cartoon, funny), requests results from Bing and returns top X URLs
	"""
	if USER.is_a_user():

		query = request.json['query']
		funny = int(request.json['funny'])
		cartoon = int(request.json['cartoon'])
		animated = int(request.json['animated'])
		max_results = int(request.json['max_results'])

		urls = bing_search_and_return_urls( query=query,
											funny=funny,
											cartoon=cartoon,
											search_type='Image',
											minsize=150,
											maxsize=300,
											size='Small',
											testing=False)

		return json.dumps({"status":1, "data":urls[0:max_results]})
	else: 
		return json.dumps({"status":0, "data":"Authorization error"})


@app.route('/_upload_img_to_dropbox', methods=['GET', 'POST'])
def upload_img_to_dropbox():
	"""
	Decodes base 64 string to image file, then uploads file to dropbox
	"""
	if USER.is_a_user():
		base = request.json['base']
		base_clean = base.replace('data:image/jpeg;base64,','')
		url = dropbox_upload.convert_image_and_upload(base_clean)
		return json.dumps(url)
	else:
		return None


@app.route('/_change_profile_picture', methods=['GET', 'POST'])
def change_profile_picture():
	"""
	Post request to change profile picture
	"""
	picture = request.json['animal']
	
	if USER.is_a_user():
		Users.update({'network':USER._('network'), 'name':USER._('name')}, {"$set": {'picture':picture} })
		session['user']['picture'] = picture
		return json.dumps(1)
	else:
		message = "Authentication error: you are not logged in to your group. Please contact us if you require assistance."
		return json.dumps(message)
	

@app.route('/_change_username', methods=['GET','POST'])
def change_username():
	"""
	Post request to change username
	"""
	new_name = request.json['new_name']
	if USER.is_a_user():
		if not USER._('name_changed_before'):
			# Check to make sure new name doesn't exist already
			existing_user = Users.find_one({'network':USER._('network'), 'name':new_name})
			if not existing_user:
				Users.update({'network':USER._('network'), 'name':USER._('name')},
					{"$set": {'name':new_name, 'name_changed_before':True} })
				session['user']['name']=new_name
				session['user']['name_changed_before']=True
				return json.dumps(1)
			else:
				# This username is already is use
				message =  "This name already exists in group. Please pick another name."
				return json.dumps(message)
		else:
			message =  "You have already changed your name before. For security reasons you cannot change it again. Please contact us if you require assistance."
			return json.dumps(message)
	else:
		message = "Authentication error: you are not logged in to your group. Please contact us if you require assistance."
		return json.dumps(message)


@app.route('/_change_email', methods=['GET','POST'])
def change_email():
	"""
	Post request to change username
	"""
	new_email = request.json['new_email']
	password = request.json['password']
	
	# Check user is logged in
	if USER.is_a_user():
		known_password_hash = Users.find_one({'network':USER._('network'), 'name':USER._('name')})['password_hash']
		response = check_password_hash(str(known_password_hash), str(password))
		# Check password correct
		if response:
			Users.update({'network':USER._('network'), 'name':USER._('name')}, {"$set": {'email':new_email} })
			session['user']['email']=new_email
			return json.dumps(1)
		else:
			# This password didn't match known password
			message =  "This is not the correct password."
			return json.dumps(message)
	else:
		message = "Authentication error: you are not logged in to your group. Please contact us if you require assistance."
		return json.dumps(message)

@app.route('/_change_password', methods=['GET','POST'])
def change_password():
	"""
	Post request to change password
	"""
	old_password = request.json['old_password']
	new_password = request.json['new_password']
	
	# Check user is logged in
	if USER.is_a_user():
		known_password_hash = Users.find_one({'network':USER._('network'), 'name':USER._('name')})['password_hash']
		response = check_password_hash(str(known_password_hash), str(old_password))
		# Check password correct
		if response:
			Users.update({'network':USER._('network'), 'name':USER._('name')}, {"$set": {'password_hash':generate_password_hash(new_password)} })
			return json.dumps(1)
		else:
			# This password didn't match known password
			message =  "The old password you have entered is not correct."
			return json.dumps(message)
	else:
		message = "Authentication error: you are not logged in to your group. Please contact us if you require assistance."
		return json.dumps(message)


###################### ERRORS ######################
@app.errorhandler(404)
def page_not_found(e):
	return render_template('error.html'), 404

@app.errorhandler(500)
def server_error(e):
	return render_template('error.html'), 500

###################### START ######################
if __name__ == '__main__':
	manager.run()
	