
from flask import Flask, render_template, request, jsonify
from flask.ext.script import Manager
import mongo
import json

app = Flask(__name__)
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
	if True:
		return render_template('feed.html')
	else:
		return render_template('info.html')

@app.route('/login')
def login():
	"""
	This is where you enter group name, then choose your group member name, then type your password
	"""
	users = list(Users.find())
	return render_template('login.html', users = users)

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


if __name__ == '__main__':
	manager.run()
	