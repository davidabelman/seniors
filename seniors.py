import os, random, time, datetime
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask.ext.script import Manager
from flask.ext.moment import Moment
from werkzeug.security import generate_password_hash, check_password_hash
#from secret import SECRET_KEY
from mailgun import send_access_token_email, receive_feedback_via_email
from tools.bing_search import bing_search_and_return_urls
from tools.icons import animals
from model import User, load_user
from tools.general import generate_token, str_clean
from bson.objectid import ObjectId
import dropbox_upload
import mongo
import json, urllib, urllib2

app = Flask(__name__)
SECRET_KEY = os.environ['SENIORS_SECRET_KEY']
EMBEDLY_KEY = os.environ['SENIORS_EMBEDLY_KEY']
app.secret_key = SECRET_KEY
manager = Manager(app)
moment = Moment(app)

#MONGO
db = mongo.start_up_mongo()
Users = db.users
Posts = db.posts

# TOKENS
token_expiry_days = 30
base_url = "http://salt-and-pepper.herokuapp.com"
company_name = "Salt & Pepper"
company_email = "saltandpepperit@gmail.com"


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

@app.before_request
def before_request():
	# If we have a user in our session variable, create a user object
    global USER 
    if session.get('user')==None:
    	USER = User( {} )
    else:
    	USER = User( session.get('user') )
    	USER.to_console()

@app.route('/about', methods=['GET', 'POST'])
def test():
	"""
	Testing
	"""
	return render_template('howitworks.html')

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

@app.route('/enter/<network>/<username>', methods=['GET', 'POST'])
def enter_with_network_name_and_username(network, username):
	"""
	Will try to take user straight to home page, providing they are already logged in on session
	Useful for email linking, when you want to link someone to homepage
	If they are already logged in, this will do so! If not, will still take to network page.
	"""
	#user = Users.find_one({'name':username, 'network':network})
	print "Trying to go enter site through personalised link"
	print USER._('name')==username
	print USER._('network')==network
	# network_clean = str_clean(network)
	# name_clean = str_clean(name)
	if USER._('name')==username and USER._('network')==network:
		# They are already in a session
		print "Logged in already"
		return redirect(url_for('home'))
	else:
		# Will need to log in
		print "Needs to log in"
		return render_template('login.html', network=network)


@app.route('/logout')
def logout():
	"""
	Resets the cookies etc. so the user is logged out
	"""
	session['logged_in'] = 0
	session['user']=None
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
		return render_template('add_users.html', base_url=base_url)
	return redirect(url_for('home'))

@app.route('/invite/<token>', methods=['GET', 'POST'])
def accept_invite(token):
	"""
	Screen on which a user can join a group (only would reach this through secret access token)
	"""
	try:
		token = long(token)
		print "This was a long token"
	except:
		print "This was a new style token"
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
				return render_template('valid_token.html', name=USER._('name'), network=USER._('network'), email=USER._('email'))
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

@app.route('/unsubscribe/<token>')
def unsubscribe(token):
	"""
	Sets user corresponding to the token as unsubscribed, will not get automated emails any more
	"""
	user = Users.find_one({'unsubscribe_token':token})
	
	if user:
		user_id = str(user['_id'])
		print "Unsubscribing user", user_id, "from email."
		Users.update({'unsubscribe_token':token}, {"$set": {'unsubscribed':True} })
		return render_template('unsubscribe.html', user_id=user_id)
	else:
		return redirect(url_for('home'))

@app.route('/finished')
def finished():
	"""
	Page when user has logged out
	"""
	session['logged_in'] = 0
	return render_template('finished.html')

@app.route('/feedback')
def feedback():
	"""
	Feedback box
	"""
	return render_template('feedback.html')

@app.route('/lostpassword')
def lostpassword():
	"""
	Lost password page
	"""
	return render_template('lostpassword.html')

@app.route('/termsandconditions')
def termsandconditions():
	"""
	Terms and conditions
	"""
	return render_template('termsandconditions.html',
		trademark_name='Salt & Pepper',
		company_name='Salt & Pepper',
		company_email = 'saltandpepperit@gmail.com',
		company_address='London',
		registration_number='pending',
		web_address=base_url)


@app.route('/instructions/<userid>', methods=['GET', 'POST'])
def print_instructions(userid):
	"""
	Same as enter, but network name already filled in and different instructions
	"""
	try:
		instructions_user = Users.find_one({'_id': ObjectId(userid)})
	except:
		return redirect(url_for('home'))
		
	return render_template('print_instructions.html',
							network=instructions_user['network'],
							network_clean = instructions_user['network_clean'],
							name=instructions_user['name'],
							inviter_name=instructions_user.get('admin_name', 'you'),
							inviter_email=instructions_user.get('admin_email', 'your email'),
							company_name = company_name,
							company_email = company_email, 
							company_website = base_url,
							method = instructions_user.get('join_method','behalf')
							)

@app.route('/edit_users')
def edit_users():
	"""
	Admin control for editing users
	"""
	if USER.is_admin():
		# Get all users in network and send to template
		network_clean = USER._('network_clean')
		found_users = Users.find({'network_clean':network_clean})
		network_users = []
		for u in found_users:
			email=1 if u['email'] else 0
			network_users.append({'name':u['name'], 'role':u['role'], 'user_id':str(u['_id']), 'email':email})
		return render_template('edit_users.html', network_users = network_users)
	else:
		# Not admin, go back home
		return redirect(url_for('home'))

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
	network_clean = str_clean(request.args.get('network'))
	users = list(Users.find({'network_clean':network_clean}, { 'name': 1, 'picture': 1, '_id':0 }))  # Return certain fields only
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

	network_clean = str_clean(request.json['network'])
	username_clean = str_clean(request.json['username'])
	password = request.json['password']	
	user = Users.find_one({'name_clean':username_clean, 'network_clean':network_clean})
	known_password_hash = user['password_hash']
	valid_password = check_password_hash(str(known_password_hash), str(password))
	
	if valid_password:
		# Get user object to store as session variable
		session['user'] = load_user(Users, {'name_clean':username_clean, 'network_clean':network_clean} )
		# session['user']['log_in_binary'] = 1
		session['logged_in']=1
		USER = session['user']

	else:
		session.clear()
		return json.dumps({'status':0, 'data':'This is not the correct password.'})

	return json.dumps({'status':int(valid_password), 'user_id':session['user']['user_id']})  # Return the user's ID for mixpanel tracking purposes

@app.route('/_submit_post_entry', methods=['GET', 'POST'])
def submit_feed_entry():
	"""
	Given a feed entry, this will check user is signed in, then add to database and return success or fail statement
	On the client side the entry is added to the top of the page
	Also pings database to update 'last_seen' value for user
	"""
	# Insert to posts database
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

	# Update last seen parameter
	mongo.update_last_seen_for_user(Users, USER._('name'), USER._('network'))
	
	return json.dumps(int(response))


@app.route('/_get_posts')
def get_posts():
	"""
	Pulls posts from the server
	"""
	# USER = User( session.get( 'user', {} ) )
	limit = int(request.args.get('limit', 10))
	skip = int(request.args.get('skip', 0))
	skip_to_date = request.args.get('skip_to_date', False)
	if USER.is_a_user():
		print "Retrieving posts from mongo..."
		start_time = time.time()
		posts_and_remaining_count = mongo.return_last_X_posts(Posts, network=USER._('network'), limit=limit, skip=skip, skip_to_date=skip_to_date)
		print "Received posts from mongo. Time =",(time.time() - start_time)
		# Update last seen parameter
		print "Updating user last seen parameter..."
		start_time = time.time()
		mongo.update_last_seen_for_user(Users, USER._('name'), USER._('network'))
		print "Updated. Time =",(time.time() - start_time)
		return json.dumps(posts_and_remaining_count, cls=Encoder)
	else:
		return "Authentication error: you are not logged in to your group."
		
@app.route('/_network_exists')
def network_exists():
	"""
	Determines whether network already exists
	"""
	network_clean = str_clean(request.args.get('network'))
	users = list(Users.find({'network_clean':network_clean}))
	if users:
		response = 1
	else:
		response = 0
	return json.dumps(response)

@app.route('/_name_in_network_exists')
def name_in_network_exists():
	"""
	Determines whether name already exists within a network
	"""
	network_clean = str_clean(request.args.get('network'))
	name_clean = str_clean(request.args.get('name'))
	users = list(Users.find({'network_clean':network_clean, 'name_clean':name_clean}))
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
	name_clean = str_clean(name)
	password = request.json['password']
	try:  # We should remove this LONG token option
		token = long(USER._('token'))
		print "Using the long token"
	except:
		token = USER._('token')
		print "Ascii token being used"

	object_id = Users.find_one({'token':token}).get('_id')

	if object_id:
		# Update user data with login data
		Users.update(
			{'_id':object_id}, {"$set": {
											'name':name,
											'name_clean':name_clean,
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
	name_clean = str_clean(name)
	email = request.json['email']
	network = request.json['network']
	network_clean = str_clean(network)
	password = request.json['password']
	picture = random.choice(animals)

	# Final check to make sure network not in use
	u1 = Users.find_one({'network_clean':network_clean})

	if not u1:
		to_add = { 	
						'name':name,
						'name_clean':name_clean,
						'email':email,
						'password_hash': generate_password_hash(password),
						'register' : datetime.datetime.utcnow(), #.strftime('%Y-%m-%dT%H:%M:%S'),
						'picture' : picture,
						'online' : False, #TODO
						'network' : network,
						'network_clean': network_clean,
						'role' : 1, # i.e. admin
						'completed_registration':True,
						'unsubscribe_token':generate_token(10),
						'join_method':'admin'

				}
		# Add user to DB		
		Users.insert(to_add)

		# Sign user in
		session['user'] = load_user(Users, {'name_clean':name_clean, 'network_clean':network_clean} )
		# session['user']['log_in_binary'] = 1
		session['logged_in']=1
		USER = session['user']

		if app.debug:
			print "Added user (%s, %s) to database." %(name_clean, network_clean)
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

		return json.dumps({'status':1, 'user_id':session['user']['user_id']})

	else:
		return json.dumps({'status':0, 'data':"I'm sorry, it seems the group name is now in use. Please try again."})

@app.route('/_add_user_on_behalf', methods=['GET', 'POST'])
def add_user_on_behalf():
	"""
	Creates a new user 
	(needs to check that current session is by user who is able to do this, and they're adding to correct network)
	"""
	name = request.json['name']
	name_clean = str_clean(name)
	password = request.json['password']

	# Check someone is logged in and is an admin for that group
	if USER.is_admin():
		# Check that username does not exist already within this network
		existing = Users.find_one({'network_clean':USER._('network_clean'), 'name_clean':name_clean})
		if not existing:
			# No user exists with this username, we can add them
			to_add = { 	
						'name':name,
						'name_clean':name_clean,
						'email':"",
						'admin_name' : USER._('name'),
						'admin_email': USER._('email'),
						'password_hash': generate_password_hash(password),
						'register' : datetime.datetime.utcnow(),
						'picture' : random.choice(animals),
						'online' : False, #TODO
						'network' : USER._('network'),
						'network_clean' : USER._('network_clean'),
						'role' : 0, # i.e. admin
						'completed_registration':True,
						'unsubscribe_token':generate_token(10),
						'join_method':'behalf'
					}	
			Users.insert(to_add)
			user_id = str(Users.find_one({'network_clean':USER._('network_clean'), 'name_clean':name_clean})['_id'])
			print "Added a user", user_id
			return json.dumps({'status':1, 'data':user_id})
		else:
			message =  "Name already exists in group. Please pick another name."
			return json.dumps({'status':0, 'data':message})
	else:
		message = "Authentication error: you are not logged in to your group. Please contact us if you require assistance."
		return json.dumps({'status':0, 'data':message})


@app.route('/_add_user_via_access_token', methods=['GET', 'POST'])
def add_user_via_access_token():
	"""
	Creates a new user (needs to check that current session is by user who is able to do this, and they're adding to correct network)
	This user then needs to accept by email via some access token to be taken to a page to decide on their username and password
	"""
	email = request.json['email']
	firstname = request.json['firstname']
	firstname_clean = str_clean(firstname)
	
	# Check if allowed to add people
	if USER.is_admin():
		# Check that username does not exist already within this network
		existing = Users.find_one({'network_clean':USER._('network_clean'), 'name_clean':firstname_clean})
		if not existing:
			# Generate access token and add user to database
			token = generate_token(6)
			to_add = { 	
							'name':firstname,
							'name_clean':firstname_clean,
							'email':email,
							'admin_name':USER._('name'),
							'admin_email':USER._('email'),
							'password_hash': "",
							'register' : "",
							'picture' : random.choice(animals),
							'online' : False, #TODO
							'network' : USER._('network'),
							'network_clean' : USER._('network_clean'),
							'role' : 0, # i.e. admin TODO
							'token' : token,
							'token_not_used' : True,
							'token_sent' : datetime.datetime.utcnow(),
							'completed_registration' : False,
							'unsubscribe_token':generate_token(10),
							'join_method':'email'
						}	
			Users.insert(to_add)
			user_id = str(Users.find_one({'network_clean':USER._('network_clean'), 'name_clean':firstname_clean})['_id'])
			print "Added a user", user_id

			# Send user an access token type of link
			access_url = base_url+'/invite/'+str(token)  #i.e. website.com/invite/1209312703
			send_access_token_email(
					sender=USER._('name'),
					sender_email=USER._('email'),
					network=USER._('network'),
					recipient=firstname,
					recipient_email=email,
					url=access_url
				)
			# All OK, return status 1
			return json.dumps({'status':1, 'data':user_id})
		
		else:
			message = "Name already exists in group. Please pick another name."
			return json.dumps({'status':0, 'data':message})
			
	else:
		message = "Authentication error: you are not logged in to your group. Please contact us if you require assistance."
		return json.dumps({'status':0, 'data':message})


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


@app.route('/_upload_base_img_to_dropbox', methods=['GET', 'POST'])
def upload_base_img_to_dropbox():
	"""
	Decodes base 64 string to image file, then uploads file to dropbox
	"""
	import base64
	if USER.is_a_user():
		base = request.json['base']
		base_clean = base.replace('data:image/jpeg;base64,','')
		img = base64.decodestring(base_clean)
		url = (dropbox_upload.upload_and_get_url(img, '.jpeg'))['url']
		return json.dumps(url)
	else:
		return None


@app.route('/upload_real_img_to_dropbox_and_create_post', methods=['GET','POST'])
def upload_real_img_to_dropbox_and_create_post():
	"""
	Saves a file to dropbox
	"""
	if USER.is_a_user():
		for _, filestorage in request.files.iteritems():
			# We return at the end of this, so can only ever process one file
			dropbox_big_upload = (dropbox_upload.upload_and_get_url(filestorage, '.jpeg'))
			filename_big = dropbox_big_upload['filename']
			url_big = dropbox_big_upload['url']
			
			# Resize image (25,000 per month with this key)
			url_small = 'http://i.embed.ly/1/display/resize?width=%s&url=%s&key=%s' %(480,url_big,EMBEDLY_KEY)
			image_data = urllib2.urlopen(url_small).read()
			url_small_dropbox = dropbox_upload.upload_and_get_url(image_data, '.jpeg')['url']
			
			# Create content and put into a post
			content = "<p class='post-body'><img src="+url_small_dropbox+" width='80%'></p>"
			to_add ={ 	
					'name': USER._('name'),
					'posted' : datetime.datetime.utcnow(), #.strftime('%Y-%m-%dT%H:%M:%S'),
					'body' : content,
					'network' : USER._('network'),
					'picture' : USER._('picture')
				}
			Posts.insert(to_add)

			# Finally delete the big file from dropbox
			print "Deleting dropbox file",filename_big
			dropbox_upload.delete_file(filename_big)
			
			return json.dumps(1)
	else:
		return None


@app.route('/_change_profile_picture', methods=['GET', 'POST'])
def change_profile_picture():
	"""
	Post request to change profile picture
	"""
	picture = request.json['animal']
	
	if USER.is_a_user():
		Users.update({'network_clean':USER._('network_clean'), 'name_clean':USER._('name_clean')}, {"$set": {'picture':picture} })
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
	new_name_clean = str_clean(new_name)
	if USER.is_a_user():
		if not USER._('name_changed_before'):
			# Check to make sure new name doesn't exist already
			existing_user = Users.find_one({'network_clean':USER._('network_clean'), 'name_clean':new_name_clean})
			# If user is tweaking their name so that it is still the same 'clean' one (i.e. removing a space, etc)
			# then there are no existing users
			if new_name_clean == str_clean(USER._('name')):   # i.e. new name ~= existing name
				existing_user = False
			if not existing_user:
				# We can update the name!
				Users.update({'network':USER._('network'), 'name':USER._('name')},
					{"$set": {'name':new_name, 'name_clean':new_name_clean, 'name_changed_before':True} })
				session['user']['name']=new_name
				session['user']['name_clean']=new_name_clean
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
		known_password_hash = Users.find_one({'network_clean':USER._('network_clean'), 'name_clean':USER._('name_clean')})['password_hash']
		response = check_password_hash(str(known_password_hash), str(password))
		# Check password correct
		if response:
			Users.update({'network_clean':USER._('network_clean'), 'name_clean':USER._('name_clean')}, {"$set": {'email':new_email} })
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
		known_password_hash = Users.find_one({'network_clean':USER._('network_clean'), 'name_clean':USER._('name_clean')})['password_hash']
		response = check_password_hash(str(known_password_hash), str(old_password))
		# Check password correct
		if response:
			Users.update({'network_clean':USER._('network_clean'), 'name_clean':USER._('name_clean')}, {"$set": {'password_hash':generate_password_hash(new_password)} })
			return json.dumps(1)
		else:
			# This password didn't match known password
			message =  "The old password you have entered is not correct."
			return json.dumps(message)
	else:
		message = "Authentication error: you are not logged in to your group. Please contact us if you require assistance."
		return json.dumps(message)

@app.route('/_send_feedback', methods=['GET','POST'])
def send_feedback():
	"""
	Send feedback from user to our email
	"""
	try:
		user_id = request.json['user_id']
		feedback_user = Users.find_one({'_id':ObjectId(user_id)})
	except:
		user_id = None
		feedback_user = None
	message = request.json['message']
	subject = request.json['subject']
	
	receive_feedback_via_email(feedback_user, subject, message)

	return json.dumps(1)


@app.route('/_make_user_admin', methods=['GET', 'POST'])
def make_user_admin():
	"""
	Make a specific ID admin
	"""
	if USER.is_admin():
		user_id = request.json['user_id']
		# Check they are in the same network
		change_network = Users.find_one({'_id': ObjectId(user_id)})['network_clean']
		if change_network == USER._('network_clean'):
			print "Check: Yes, they are in the same network"
			Users.update({'_id': ObjectId(user_id)}, {"$set": {'role':1} })
			# Should send message to say they are now an admin TODO
			return json.dumps({'status':1})
		else:
			print "Error: Not the correct network"
			return json.dumps({'status':0, 'data':"Not correct network"})
	else:
		print "Error: Not authenticated"
		return json.dumps({'status':0, 'data':"Not authenticated"})

@app.route('/_delete_user', methods=['GET', 'POST'])
def delete_user():
	"""
	Delete a user
	"""
	if USER.is_admin():
		user_id = request.json['user_id']
		# Check they are in the same network
		change_network = Users.find_one({'_id': ObjectId(user_id)})['network_clean']
		if change_network == USER._('network_clean'):
			print "Check: Yes, they are in the same network"
			Users.remove({'_id': ObjectId(user_id)})
			return json.dumps({'status':1})

		else:
			print "Error: Not the correct network"
			return json.dumps({'status':0, 'data':"Not correct network"})
		
	else:
		print "Error: Not authenticated"
		return json.dumps({'status':0, 'data':"Not authenticated"})


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
	