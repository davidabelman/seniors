# Include the Dropbox SDK libraries
import os, binascii
from dropbox import client, rest, session
# from secret import DROPBOX_APP_KEY, DROPBOX_APP_SECRET, DROPBOX_TOKEN_KEY, DROPBOX_TOKEN_SECRET
SENIORS_DROPBOX_APP_KEY = os.environ.get('SENIORS_DROPBOX_APP_KEY')
SENIORS_DROPBOX_APP_SECRET = os.environ.get('SENIORS_DROPBOX_APP_SECRET')
SENIORS_DROPBOX_TOKEN_KEY = os.environ.get('SENIORS_DROPBOX_TOKEN_KEY')
SENIORS_DROPBOX_TOKEN_SECRET = os.environ.get('SENIORS_DROPBOX_TOKEN_SECRET')
 
sess = session.DropboxSession(SENIORS_DROPBOX_APP_KEY, SENIORS_DROPBOX_APP_SECRET, 'app_folder')
sess.set_token(SENIORS_DROPBOX_TOKEN_KEY, SENIORS_DROPBOX_TOKEN_SECRET)
client = client.DropboxClient(sess)
 
def convert_image_and_upload(img_string):
	"""
	Takes image string in BASE64 as input (e.g. from canvas object) and provides public dropbox link
	"""
	import base64, string, random
	#filename = '%030x' % random.randrange(16**50) Less secure as uses a seed?
	filename = binascii.b2a_hex(os.urandom(30))
	img = base64.decodestring(img_string)
	put = client.put_file('/%s.jpeg'%filename, img) 
	share = client.share('/%s.jpeg'%filename, short_url=False)
	return share['url'].replace('https://www.dropbox.com/', 'https://dl.dropboxusercontent.com/')