"""
This file starts up the mongo database, generates some fake data (can delete all old data whilst it is at it too)
"""

from secret import USERNAME, PASSWORD

def start_up_mongo():
	import pymongo
	from pymongo import MongoClient
	# PASSWORD = raw_input('Password: ')
	client = MongoClient('mongodb://'+USERNAME+':'+PASSWORD+'@kahana.mongohq.com:10096/davidabelman', 27017)
	db = client.davidabelman
	return db

def show_all_users(db):
	print list(db.users.find())

def create_fake_users(db):
	import datetime
	import random
	from werkzeug.security import generate_password_hash

	u = raw_input("Do you wish to delete all existing first? (Type 'y' to delete...) ")

	if u=='y':
		db.users.remove()

	to_add =  	[{ 	
					'name':'David',
					'email':'test0@gmail.com',
					'password_hash': generate_password_hash('David'),
					'register' : datetime.datetime(2014,4,5),
					'picture' : random.choice(['anteater', 'bat', 'cat', 'dog', 'elephant', 'fish']),
					'online' : False,
					'network' : 'abelman'
				},
				{ 	
					'name':'Ben',
					'email':'test1@gmail.com',
					'password_hash': generate_password_hash('Ben'),
					'register' : datetime.datetime(2014,4,9),
					'picture' : random.choice(['anteater', 'bat', 'cat', 'dog', 'elephant', 'fish']),
					'online' : False,
					'network' : 'abelman'
				},
				{ 	
					'name':'Annie',
					'email':'test2@gmail.com',
					'password_hash': generate_password_hash('Annie'),
					'register' : datetime.datetime(2014,4,30),
					'picture' : random.choice(['anteater', 'bat', 'cat', 'dog', 'elephant', 'fish']),
					'online' : False,
					'network' : 'abelman'
				},
				{ 	
					'name':'Jack',
					'email':'test3@gmail.com',
					'password_hash': generate_password_hash('Jack'),
					'register' : datetime.datetime(2014,4,10),
					'picture' : random.choice(['anteater', 'bat', 'cat', 'dog', 'elephant', 'fish']),
					'online' : False,
					'network' : 'smith'
				},
				]		
	collection = db.users
	collection.insert(to_add)

def create_fake_posts(db):
	import datetime
	u = raw_input("Do you wish to delete all existing first? (Type 'y' to delete...) ")
	
	if u=='y':
		db.posts.remove()

	to_add =  	[{ 	
					'name':'David',
					'posted' : datetime.datetime(2014,4,5),
					'body' : 'This is a good post!',
					'network' : 'abelman'
				},
				{ 	
					'name':'David',
					'posted' : datetime.datetime(2014,4,6),
					'body' : 'Another good post!',
					'network' : 'abelman'
				},
				{ 	
					'name':'Annie',
					'posted' : datetime.datetime(2014,4,7),
					'body' : 'How does this work',
					'network' : 'abelman'
				},
				{ 	
					'name':'Ben',
					'posted' : datetime.datetime(2014,4,8),
					'body' : 'Glad to have joined the party!!!!',
					'network' : 'abelman'
				},
				{ 	
					'name':'David',
					'posted' : datetime.datetime(2014,4,9),
					'body' : 'Yabadabadoooooooo. So.',
					'network' : 'abelman'
				},
				{ 	
					'name':'Annie',
					'posted' : datetime.datetime(2014,4,9),
					'body' : 'Yabadabadoooooooo. So what?!?!?!?! Blah blha lash ldka lsht oaihs dins oiajos aois longer post.',
					'network' : 'abelman'
				},
				{ 	
					'name':'David',
					'posted' : datetime.datetime(2014,4,10),
					'body' : 'Another good post!!!!! Once again.',
					'network' : 'abelman'
				},
				{ 	
					'name':'Ben',
					'posted' : datetime.datetime(2014,5,12),
					'body' : 'Mind your own business.',
					'network' : 'abelman'
				},
				]		
	collection = db.posts
	collection.insert(to_add)

if __name__ == '__main__':
	db = start_up_mongo()
	print "Creating users..."
	create_fake_users(db)
	print "Creating posts..."
	create_fake_posts(db)
	print "Printing users..."
	for x in show_all_users(db):
		print x
