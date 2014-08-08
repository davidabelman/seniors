"""
This file starts up the mongo database, generates some fake data (can delete all old data whilst it is at it too)
"""

# from secret import SENIORS_MONGO_USERNAME, SENIORS_MONGO_PASSWORD
import os
from tools.icons import animals
SENIORS_MONGO_USERNAME = os.environ.get('SENIORS_MONGO_USERNAME')
SENIORS_MONGO_PASSWORD = os.environ.get('SENIORS_MONGO_PASSWORD')

def start_up_mongo():
	import pymongo
	from pymongo import MongoClient
	# PASSWORD = raw_input('Password: ')
	client = MongoClient('mongodb://'+SENIORS_MONGO_USERNAME+':'+SENIORS_MONGO_PASSWORD+'@kahana.mongohq.com:10096/davidabelman', 27017)
	db = client.davidabelman
	# Users=db.users
	# Posts=db.posts
	return db

def show_all_users(db):
	print list(db.users.find())

def show_all_posts(db):
	print list(db.posts.find())

def return_last_X_posts(Posts, network, limit=10, skip=0):
	"""
	Given a Posts collection, and a network name, returns the last X posts, with optional skip parameter
	"""
	return Posts.find({'network':network}).sort([('posted',-1)]).skip(skip).limit(limit)

def update_last_seen_for_user(Users, name, network):
	"""
	Given a users collection, and a username/network (i.e. unique), sets last_seen to now()
	"""
	import datetime
	Users.update( 
		{'name':name, 'network':network},
		{ '$set': {	'last_seen': datetime.datetime.utcnow() } }
	)


def delete_all_data(db):
	u = raw_input("Do you wish to delete all users? (Type 'y' to delete...) ")
	if u=='y':
		db.users.remove()

	u = raw_input("Do you wish to delete all posts? (Type 'y' to delete...) ")
	if u=='y':
		db.posts.remove()

	u = raw_input("Do you wish to delete all tokens? (Type 'y' to delete...) ")
	if u=='y':
		db.tokens.remove()


def create_fake_users(db):
	import datetime
	import random
	from werkzeug.security import generate_password_hash

	network_name = 'test10'
	to_add =  	[{ 	
					'name':'David',
					'email':'davidabelman@gmail.com',
					'password_hash': generate_password_hash('David123'),
					'register' : datetime.datetime(2014,4,5), #.strftime('%Y-%m-%dT%H:%M:%S'),
					'picture' : random.choice(animals),
					'online' : False,
					'network' : network_name,
					'role' : 1,
					'completed_registration':True,
					'last_seen': datetime.datetime(2014,8,3)
				},
				{ 	
					'name':'Ben',
					'email':'davidabelman+ben@gmail.com',
					'password_hash': generate_password_hash('Ben123'),
					'register' : datetime.datetime(2014,4,9), #.strftime('%Y-%m-%dT%H:%M:%S'),
					'picture' : random.choice(animals),
					'online' : False,
					'network' : network_name,
					'role' : 0,
					'completed_registration':True,
					'last_seen': datetime.datetime(2014,8,7)
				},
				{ 	
					'name':'Annie',
					'email':'davidabelman+annie@gmail.com',
					'password_hash': generate_password_hash('Annie123'),
					'register' : datetime.datetime(2014,4,30), #.strftime('%Y-%m-%dT%H:%M:%S'),
					'picture' : random.choice(animals),
					'online' : False,
					'network' : network_name,
					'role' : 0,
					'completed_registration':True,
					'last_seen': datetime.datetime(2014,8,6)
				},
				{ 	
					'name':'Jack',
					'email':'davidabelman+jack@gmail.com',
					'password_hash': generate_password_hash('Jack123'),
					'register' : datetime.datetime(2014,4,10), #.strftime('%Y-%m-%dT%H:%M:%S'),
					'picture' : random.choice(animals),
					'online' : False,
					'network' : network_name,
					'role' : 0,
					'completed_registration':True,
					'unsubscribed':True,
					'last_seen': datetime.datetime(2014,8,6)
				},
				{ 	
					'name':'Brenda',
					'email':'davidabelman+brenda@gmail.com',
					'password_hash': '',
					'register' : '', #.strftime('%Y-%m-%dT%H:%M:%S'),
					'picture' : random.choice(animals),
					'online' : False,
					'network' : network_name,
					'role' : 0,
					'token' : '868122211',
					'token_not_used' : True,
					'admin_email' : 'davidabelman@gmail.com',
					'admin_name' : 'David',
					'completed_registration':False,
					'last_seen': datetime.datetime(2014,8,6)
				},
				]		
	collection = db.users
	collection.insert(to_add)

def create_fake_posts(db):
	import datetime
	network_name = 'test10'
	to_add =  	[{ 	
					'name':'David',
					'posted' : datetime.datetime(2014,8,5), #.strftime('%Y-%m-%dT%H:%M:%S'),
					'body' : 'This is a good post!',
					'network' : network_name,
					'picture' : 'cat'
				},
				{ 	
					'name':'David',
					'posted' : datetime.datetime(2014,8,6), #.strftime('%Y-%m-%dT%H:%M:%S'),
					'body' : 'Another good post!',
					'network' : network_name,
					'picture' : 'cat'
				},
				{ 	
					'name':'Sadie',
					'posted' : datetime.datetime(2014,8,7), #.strftime('%Y-%m-%dT%H:%M:%S'),
					'body' : 'How does this work',
					'network' : network_name,
					'picture' : 'cat'
				},
				{ 	
					'name':'Ben',
					'posted' : datetime.datetime(2014,8,7), #.strftime('%Y-%m-%dT%H:%M:%S'),
					'body' : 'Glad to have joined the party!!!!',
					'network' : network_name,
					'picture' : 'cat'
				},
				{ 	
					'name':'David',
					'posted' : datetime.datetime(2014,8,1), #.strftime('%Y-%m-%dT%H:%M:%S'),
					'body' : 'Yabadabadoooooooo. So.',
					'network' : network_name,
					'picture' : 'cat'
				},
				{ 	
					'name':'Zebedee',
					'posted' : datetime.datetime(2014,8,4), #.strftime('%Y-%m-%dT%H:%M:%S'),
					'body' : 'Yabadabadoooooooo. So what?!?!?!?! Blah blha lash ldka lsht oaihs dins oiajos aois longer post.',
					'network' : network_name,
					'picture' : 'cat'
				},
				{ 	
					'name':'Jack',
					'posted' : datetime.datetime(2014,8,8), #.strftime('%Y-%m-%dT%H:%M:%S'),
					'body' : 'Another good post!!!!! Once again.',
					'network' : network_name,
					'picture' : 'cat'
				},
				{ 	
					'name':'Ben',
					'posted' : datetime.datetime(2014,8,6), #.strftime('%Y-%m-%dT%H:%M:%S'),
					'body' : 'Mind your own business.',
					'network' : network_name,
					'picture' : 'cat'
				},
				]		
	collection = db.posts
	collection.insert(to_add)

def create_fake_tokens(db):
	import datetime

	network_name = 'test0'
	to_add =  	[{ 	
					'token' : 'exampletoken123',
					'recipient_name' : 'Brenda',
					'recipient_email' : 'davidabelman+brenda@gmail.com',
					'token_sent' : datetime.datetime(2014,8,1),
					'network' : network_name,
					'token_not_used':True
				},
				{ 	
					'token' : 'exampletoken456',
					'recipient_name' : 'Martha',
					'recipient_email' : 'davidabelman+martha@gmail.com',
					'token_sent' : datetime.datetime(2014,6,1),
					'network' : network_name,
					'token_not_used':True
				},
				{ 	
					'token' : 'exampletoken789',
					'recipient_name' : 'Wilma',
					'recipient_email' : 'davidabelman+wilma@gmail.com',
					'token_sent' : datetime.datetime(2014,8,1),
					'network' : network_name,
					'token_not_used':False
				}
				]		
	collection = db.tokens
	collection.insert(to_add)

if __name__ == '__main__':
	db = start_up_mongo()
	print "Creating users..."
	create_fake_users(db)
	print "Creating posts..."
	create_fake_posts(db)
	print "Creating tokens..."
	create_fake_tokens(db)
	# print "Printing users..."
	# for x in show_all_users(db):
	# 	print x
	# print "Printing posts..."
	# for y in show_all_posts(db):
	# 	print y
