# Include the Dropbox SDK libraries
from dropbox import client, rest, session
from secret import DROPBOX_APP_KEY, DROPBOX_APP_SECRET, DROPBOX_TOKEN_KEY, DROPBOX_TOKEN_SECRET
 
sess = session.DropboxSession(DROPBOX_APP_KEY, DROPBOX_APP_SECRET, 'app_folder')
sess.set_token(DROPBOX_TOKEN_KEY, DROPBOX_TOKEN_SECRET)
client = client.DropboxClient(sess)
 
def convert_image_and_upload(img_string):
	"""
	Takes image string in BASE64 as input (e.g. from canvas object) and provides public dropbox link
	"""
	import base64, string, random
	filename = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(10))
	img = base64.b64decode(img_string)
	put = client.put_file('/%s.png'%filename, img) 
	share = client.share('/%s.png'%filename, short_url=False)
	return share['url'].replace('https://www.dropbox.com/', 'https://dl.dropboxusercontent.com/')