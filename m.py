"""
Puts db, Users, Posts into the namespace
"""
import pymongo
import os
from pymongo import MongoClient

SENIORS_MONGO_USERNAME = os.environ.get('SENIORS_MONGO_USERNAME')
SENIORS_MONGO_PASSWORD = os.environ.get('SENIORS_MONGO_PASSWORD')

client = MongoClient('mongodb://'+SENIORS_MONGO_USERNAME+':'+SENIORS_MONGO_PASSWORD+'@kahana.mongohq.com:10096/davidabelman', 27017)
db = client.davidabelman
Users = db.users
Posts = db.posts