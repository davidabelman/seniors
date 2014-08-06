"""
This file starts up the mongo database, generates some fake data (can delete all old data whilst it is at it too)
"""

from secret import USERNAME, PASSWORD
from tools.icons import animals

def start_up_mongo():
	import pymongo
	from pymongo import MongoClient
	# PASSWORD = raw_input('Password: ')
	client = MongoClient('mongodb://'+USERNAME+':'+PASSWORD+'@kahana.mongohq.com:10096/davidabelman', 27017)
	db = client.davidabelman
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

def create_fake_users(db):
	import datetime
	import random
	from werkzeug.security import generate_password_hash

	u = raw_input("Do you wish to delete all existing first? (Type 'y' to delete...) ")

	if u=='y':
		db.users.remove()

	network_name = 'test11'
	to_add =  	[{ 	
					'name':'David',
					'email':'test0@gmail.com',
					'password_hash': generate_password_hash('David123'),
					'register' : datetime.datetime(2014,4,5), #.strftime('%Y-%m-%dT%H:%M:%S'),
					'picture' : random.choice(animals),
					'online' : False,
					'network' : network_name,
					'role' : 1,
					'completed_registration':True,
				},
				{ 	
					'name':'Ben',
					'email':'test1@gmail.com',
					'password_hash': generate_password_hash('Ben123'),
					'register' : datetime.datetime(2014,4,9), #.strftime('%Y-%m-%dT%H:%M:%S'),
					'picture' : random.choice(animals),
					'online' : False,
					'network' : network_name,
					'role' : 0,
					'completed_registration':True,
				},
				{ 	
					'name':'Annie',
					'email':'test2@gmail.com',
					'password_hash': generate_password_hash('Annie123'),
					'register' : datetime.datetime(2014,4,30), #.strftime('%Y-%m-%dT%H:%M:%S'),
					'picture' : random.choice(animals),
					'online' : False,
					'network' : network_name,
					'role' : 0,
					'completed_registration':True,
				},
				{ 	
					'name':'Jack',
					'email':'test3@gmail.com',
					'password_hash': generate_password_hash('Jack123'),
					'register' : datetime.datetime(2014,4,10), #.strftime('%Y-%m-%dT%H:%M:%S'),
					'picture' : random.choice(animals),
					'online' : False,
					'network' : 'Smith',
					'role' : 0,
					'completed_registration':True,
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
				},
				]		
	collection = db.users
	collection.insert(to_add)

def create_fake_posts(db):
	import datetime
	u = raw_input("Do you wish to delete all existing first? (Type 'y' to delete...) ")
	
	if u=='y':
		db.posts.remove()

	network_name = 'test0'
	to_add =  	[{ 	
					'name':'David',
					'posted' : datetime.datetime(2014,4,5), #.strftime('%Y-%m-%dT%H:%M:%S'),
					'body' : 'This is a good post!',
					'network' : network_name,
					'picture' : 'cat'
				},
				{ 	
					'name':'David',
					'posted' : datetime.datetime(2014,4,6), #.strftime('%Y-%m-%dT%H:%M:%S'),
					'body' : 'Another good post!',
					'network' : network_name,
					'picture' : 'cat'
				},
				{ 	
					'name':'Annie',
					'posted' : datetime.datetime(2014,4,7), #.strftime('%Y-%m-%dT%H:%M:%S'),
					'body' : 'How does this work',
					'network' : network_name,
					'picture' : 'cat'
				},
				{ 	
					'name':'Ben',
					'posted' : datetime.datetime(2014,4,8), #.strftime('%Y-%m-%dT%H:%M:%S'),
					'body' : 'Glad to have joined the party!!!!',
					'network' : network_name,
					'picture' : 'cat'
				},
				{ 	
					'name':'David',
					'posted' : datetime.datetime(2014,4,9), #.strftime('%Y-%m-%dT%H:%M:%S'),
					'body' : 'Yabadabadoooooooo. So.',
					'network' : network_name,
					'picture' : 'cat'
				},
				{ 	
					'name':'Annie',
					'posted' : datetime.datetime(2014,4,9), #.strftime('%Y-%m-%dT%H:%M:%S'),
					'body' : 'Yabadabadoooooooo. So what?!?!?!?! Blah blha lash ldka lsht oaihs dins oiajos aois longer post.',
					'network' : network_name,
					'picture' : 'cat'
				},
				{ 	
					'name':'David',
					'posted' : datetime.datetime(2014,4,10), #.strftime('%Y-%m-%dT%H:%M:%S'),
					'body' : 'Another good post!!!!! Once again.',
					'network' : network_name,
					'picture' : 'cat'
				},
				{ 	
					'name':'Ben',
					'posted' : datetime.datetime(2014,5,12), #.strftime('%Y-%m-%dT%H:%M:%S'),
					'body' : 'Mind your own business.',
					'network' : network_name,
					'picture' : 'cat'
				},
				]		
	collection = db.posts
	collection.insert(to_add)

def create_fake_tokens(db):
	import datetime

	u = raw_input("Do you wish to delete all existing first? (Type 'y' to delete...) ")

	if u=='y':
		db.tokens.remove()

	to_add =  	[{ 	
					'token' : 'exampletoken123',
					'recipient_name' : 'Brenda',
					'recipient_email' : 'davidabelman+brenda@gmail.com',
					'token_sent' : datetime.datetime(2014,8,1),
					'network' : 'abelman',
					'token_not_used':True
				},
				{ 	
					'token' : 'exampletoken456',
					'recipient_name' : 'Martha',
					'recipient_email' : 'davidabelman+martha@gmail.com',
					'token_sent' : datetime.datetime(2014,6,1),
					'network' : 'smith',
					'token_not_used':True
				},
				{ 	
					'token' : 'exampletoken789',
					'recipient_name' : 'Wilma',
					'recipient_email' : 'davidabelman+wilma@gmail.com',
					'token_sent' : datetime.datetime(2014,8,1),
					'network' : 'smith',
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
