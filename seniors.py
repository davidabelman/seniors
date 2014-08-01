
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask.ext.script import Manager
from flask.ext.moment import Moment
from werkzeug.security import generate_password_hash, check_password_hash
import mongo
import json
import datetime

app = Flask(__name__)
app.config.from_object('config')
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

@app.route('/')
def home():
	"""
	If logged in, user sees main feed, if not, they see the main 'about' page
	"""
	if session.get('name') and session.get('network'):
		return render_template('posts.html')
	else:
		return render_template('info.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
	"""
	This is where you enter group name, then choose your group member name, then type your password
	"""
	return render_template('login.html')

@app.route('/logout')
def logout():
	"""
	Resets the cookies etc. so the user is logged out
	"""
	session['name'] = None
	session['network'] = None
	return redirect(url_for('home'))

@app.route('/signup')
def signup():
	"""
	This is where one person creates the group, he/she is then the admin(?)
	"""
	return render_template('signup.html')

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
		session['picture'] = user['picture']
	else:
		session['name'] = None
		session['network'] = None

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
	message = request.json['message']
	if session.get('name') and session.get('network'):
		to_add ={ 	
					'name':session['name'],
					'posted' : datetime.datetime.utcnow(), #.strftime('%Y-%m-%dT%H:%M:%S'),
					'body' : message,
					'network' : session['network']
				}
		Posts.insert(to_add)
		response = 1
	else:
		response = 0
	
	if app.debug:
		print "Information received:", message
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
		posts = mongo.return_last_X_posts(Posts, network=session['network'], limit=limit, skip=skip)
	return json.dumps(list(posts), cls=Encoder)


###################### START ######################
if __name__ == '__main__':
	manager.run()
	