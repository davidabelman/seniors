import pymongo
from pymongo import MongoClient
PASSWORD = raw_input('Password: ')
client = MongoClient('mongodb://admin:sVkky6Gr!5'+PASSWORD'@kahana.mongohq.com:10096/davidabelman', 27017)
db = client.davidabelman