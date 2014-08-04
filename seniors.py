
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask.ext.script import Manager
from flask.ext.moment import Moment
from werkzeug.security import generate_password_hash, check_password_hash
from secret import SECRET_KEY
from mailgun import send_access_token_email
from tools.bing_search import bing_search_and_return_urls
import mongo
import json, urllib, urllib2
import datetime
import random

app = Flask(__name__)
app.config.from_object('config')
app.secret_key = SECRET_KEY
manager = Manager(app)
moment = Moment(app)

#MONGO
db = mongo.start_up_mongo()
Users = db.users
Posts = db.posts
Tokens = db.tokens

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
base_url = "http://localhost:5000/invite/"

@app.route('/temp')
def temp():
	return render_template('temp.html')

@app.route('/')
def home():
	"""
	If logged in, user sees main feed, if not, they see the main 'about' page
	"""
	#if session.get('name') and session.get('network'):
	if True:
		return render_template('posts.html')
	else:
		return render_template('info.html')

@app.route('/enter', methods=['GET', 'POST'])
def enter():
	"""
	This is where you enter group name, then choose your group member name, then type your password
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
	session.clear()
	return redirect(url_for('home'))

@app.route('/signup', methods=['GET', 'POST'])
def signup():
	"""
	This is where one person creates the group, he/she is then the admin(?)
	"""
	return render_template('signup.html')

@app.route('/add_users', methods=['GET', 'POST'])
def add_users():
	"""
	This is where an admin can add other group members
	"""
	network = session.get('network')
	admin_name = session.get('name')
	admin_role = Users.find_one({'network':network, 'name':admin_name})['role']
	if admin_name and network and admin_role==1:
		return render_template('add_users.html')
	else:
		return redirect(url_for('home'))

@app.route('/invite/<token>', methods=['GET', 'POST'])
def accept_invite(token):
	"""
	Screen on which a user can join a group (only would reach this through secret access token)
	"""
	token = long(token)
	result = Tokens.find_one({'token':token})
	# return str(result)
	if result:
		if result.get('token_not_used'):
			# Token not yet used
			print 'Token not yet used:', result.get('token_not_used')
			print 'Days left:', token_expiry_days - ((datetime.datetime.now() - result.get('token_sent')).days )

			if (datetime.datetime.now() - result.get('token_sent')).days < token_expiry_days:
				# We have an unused token, and it is not yet expired.
				# This page lets the user register into this network, and then marks token as used (see create_account_join_network)
				session.clear()
				session['network']=result.get('network')
				session['email']=result.get('recipient_email')
				session['token']=token
				return render_template('valid_token.html',
					name=result.get('recipient_name'), network=session['network'])
			else:
				# We have a token, but it has expired
				return render_template('expired_token.html')
		else:
			# Token has been used already
			return render_template('used_token.html')
	else:
		# The link was invalid
		return render_template('invalid_token.html')


@app.route('/help')
def help():
	"""
	This is a static help page with simple instructions
	"""
	return render_template('help.html')

@app.route('/add_image')
def add_image():
	"""
	Temporary - this will probably be within main page?
	"""
	return render_template('add_image.html')

###################### AJAX REPONDERS ######################

@app.route('/_network_users_list')
def network_users_list():
	"""
	Given a network, this function returns a JSON string of users to display on the screen
	Using method from http://runnable.com/UiPhLHanceFYAAAP/how-to-perform-ajax-in-flask-for-python
	"""
	network = request.args.get('network')
	users = list(Users.find({'network':network}, { 'name': 1, 'picture': 1, '_id':0 }))  # Return certain fields only
	return json.dumps(users)

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
	response = check_password_hash(known_password_hash, password)
	
	if response==True:
		session['name'] = username
		session['network'] = network
		session['picture'] = user.get('picture')
		session['email'] = user.get('email')
	else:
		session.clear()

	if app.debug:
		print "Information received:",network, username, password
		print "Password submit", password
		print "Generated from submit", generate_password_hash(password)
		print "Stored in database", known_password_hash
		print "Try check_password_hash(known_password_hash, password)..."
		print "Response is", response

	return json.dumps(int(response))

@app.route('/_submit_post_entry', methods=['GET', 'POST'])
def submit_feed_entry():
	"""
	Given a feed entry, this will check user is signed in, then add to database and return success or fail statement
	On the client side the entry is added to the top of the page
	"""
	content = request.json['content']
	if session.get('name') and session.get('network'):
		to_add ={ 	
					'name':session.get('name'),
					'posted' : datetime.datetime.now(), #.strftime('%Y-%m-%dT%H:%M:%S'),
					'body' : content,
					'network' : session.get('network')
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
	limit = int(request.args.get('limit', 10))
	skip = int(request.args.get('skip', 0))
	if session.get('name') and session.get('network'):
		posts = mongo.return_last_X_posts(Posts, network=session.get('network'), limit=limit, skip=skip)
		return json.dumps(list(posts), cls=Encoder)
	else:
		return "Error: no user logged in"
		

@app.route('/_network_exists')
def network_exists():
	"""
	Determines whether network already exists
	"""
	network = request.args.get('network')
	print network
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
	"""
	name = request.json['name']
	password = request.json['password']
	token = long(session['token'])

	object_id = Users.find_one({'token':token}).get('_id')

	if object_id:
		# Update user data with login data
		Users.update(
			{'_id':object_id}, {"$set": {
													'name':name,
													'password_hash':generate_password_hash(password),
													'register' : datetime.datetime.now(),
													}
										}, upsert=False
					)

		# Add session name as we didn't add it when they clicked on link (we didn't know name yet)
		session['name'] = name
		
		# Update token to 'used'
		Tokens.update({'token':token}, {"$set": {'token_not_used':False} })
		return json.dumps('[1]')
		
	else:
		print "Can't find user - though should be able to as they were created when token was."


@app.route('/_create_account_create_network', methods=['GET', 'POST'])
def create_account_create_network():
	"""
	Creates a new user (with admin status) and group
	"""
	name = request.json['name']
	email = request.json['email']
	network = request.json['network']
	password = request.json['password']

	# Could run server checks here to ensure all info OK
	u1 = Users.find_one({'network':network})

	if not u1:
		to_add = { 	
						'name':name,
						'email':email,
						'password_hash': generate_password_hash(password),
						'register' : datetime.datetime.now(), #.strftime('%Y-%m-%dT%H:%M:%S'),
						'picture' : random.choice(['anteater', 'bat', 'cat', 'dog', 'elephant', 'fish']), #TODO
						'online' : False, #TODO
						'network' : network,
						'role' : 1 # i.e. admin
				}
		# Add user to DB		
		Users.insert(to_add)

		# Sign user in
		session['name'] = name
		session['network'] = network
		session['email'] = email

		if app.debug:
			print "Added user (%s, %s) to database." %(name, network)
			print to_add

		return json.dumps(1)

	else:
		return json.dumps("Email or network already in use.")

@app.route('/_add_user_on_behalf', methods=['GET', 'POST'])
def add_user_on_behalf():
	"""
	Creates a new user 
	(needs to check that current session is by user who is able to do this, and they're adding to correct network)
	"""
	name = request.json['name']
	password = request.json['password']
	network = session.get('network')
	admin_name = session.get('name')
	admin_role = Users.find_one({'network':network, 'name':admin_name}).get('role')

	# Check someone is logged in and is an admin for that group
	if admin_name and network and admin_role==1:
		# Check that username does not exist already within this network
		existing = Users.find_one({'network':network, 'name':name})
		if not existing:
			# No user exists with this username, we can add them
			to_add = { 	
						'name':name,
						'email':"",
						'password_hash': generate_password_hash(password),
						'register' : datetime.datetime.now(),
						'picture' : random.choice(['anteater', 'bat', 'cat', 'dog', 'elephant', 'fish']), #TODO
						'online' : False, #TODO
						'network' : network,
						'role' : 0, # i.e. admin
					}	
			Users.insert(to_add)
			return json.dumps(1)
		else:
			message =  "Error: Name already exists in group. Please pick another name."
			if app.debug:
				print message
			return json.dumps(message)
	else:
		message = "Authentication error: you are not logged in to your group."
		return json.dumps(message)




	return None

@app.route('/_add_user_via_access_token', methods=['GET', 'POST'])
def add_user_via_access_token():
	"""
	Creates a new user (needs to check that current session is by user who is able to do this, and they're adding to correct network)
	This user then needs to accept by email via some access token to be taken to a page to decide on their username and password
	"""
	email = request.json['email']
	firstname = request.json['firstname']
	admin = request.json['admin']
	# Check if allowed to add people
	if session.get('name') and session.get('network'):
		network = session.get('network')

		# Check that username does not exist already within this network
		existing = Users.find_one({'network':network, 'name':firstname})
		if not existing:
			# Generate access token and add to token dictionary
			token = random.getrandbits(32)
			to_add = {
						'token' : token,
						'recipient_name' : firstname,
						'recipient_email' : email,
						'token_sent' : datetime.datetime.now(),
						'network' : network,
						'token_not_used':True
					}
			Tokens.insert(to_add)

			# Create user account and add to DB
			to_add = { 	
							'name':firstname,
							'email':email,
							'password_hash': "",
							'register' : "",
							'picture' : random.choice(['anteater', 'bat', 'cat', 'dog', 'elephant', 'fish']), #TODO
							'online' : False, #TODO
							'network' : network,
							'role' : admin, # i.e. admin
							'token' : token
						}	
			Users.insert(to_add)

			# Send user an access token type of link
			access_url = base_url+str(token)
			send_access_token_email(
					sender=session['name'],
					sender_email=session['email'],
					network=session['network'],
					recipient=firstname,
					recipient_email=email,
					url=access_url
				)
			# All OK, return status 1
			return json.dumps(1)
		
		else:
			message = "Error: Name already exists in group. Please pick another name."
			return json.dumps(message)
			
	else:
		message = "Authentication error: you are not logged in to your group."
		return json.dumps(message)


@app.route('/_get_bing_image_urls', methods=['GET', 'POST'])
def get_bing_image_urls():
	"""
	Given a query string and extra parameters (e.g. cartoon, funny), requests results from Bing and returns top X URLs
	"""
	user = Users.find_one({'network':session.get('network')})
	if user:

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
											maxsize=250,
											testing=True)

		return json.dumps({"status":1, "data":urls[0:max_results]})
	else: 
		return json.dumps({"status":0, "data":"Authorization error"})



###################### ERRORS ######################
@app.errorhandler(404)
def page_not_found(e):
	return render_template('error.html'), 404

@app.errorhandler(500)
def page_not_found(e):
	return render_template('error.html'), 500

###################### START ######################
if __name__ == '__main__':
	manager.secret_key = SECRET_KEY
	manager.run()
	