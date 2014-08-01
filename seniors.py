
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask.ext.script import Manager
from werkzeug.security import generate_password_hash, check_password_hash
import mongo
import json

app = Flask(__name__)
app.config.from_object('config')
manager = Manager(app)


#MONGO
db = mongo.start_up_mongo()
Users = db.users
Posts = db.posts

@app.route('/')
def home():
	"""
	If logged in, user sees main feed, if not, they see the main 'about' page
	"""
	if session.get('name'):
		return render_template('feed.html')
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
	print "Information received:",network, username, password
	user = Users.find_one({'name':username, 'network':network})
	known_password_hash = user['password_hash']
	response = check_password_hash(known_password_hash, password)
	print "Password submit", password
	print "Generated from submit", generate_password_hash(password)
	print "Stored in database", known_password_hash
	print "Try check_password_hash(known_password_hash, password)..."
	print "Response is", response
	if response==True:
		session['name'] = username
		session['network'] = network
		session['picture'] = user['picture']
		print "Password matched"
	else:
		session['name'] = None
		session['network'] = None
		print "Password failed to match"
	return json.dumps(int(response))


###################### START ######################
if __name__ == '__main__':
	manager.run()
	