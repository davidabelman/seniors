# Include the Dropbox SDK libraries
from dropbox import client, rest, session
 
# Get your app key and secret from the Dropbox developer website
APP_KEY = 'vqffib25i3zi8nc'
APP_SECRET = 'ae8zppkwbcdql42'
 
# ACCESS_TYPE should be 'dropbox' or 'app_folder' as configured for your app
ACCESS_TYPE = 'app_folder'
 
sess = session.DropboxSession(APP_KEY, APP_SECRET, ACCESS_TYPE)
 
# We will use the OAuth token we generated already. The set_token API 
# accepts the oauth_token and oauth_token_secret as inputs.
sess.set_token("wdzl5swfk3wk9hqy", "k6c38pyop9zg0en")
 
# Create an instance of the dropbox client for the session. This is
# all we need to perform other actions
client = client.DropboxClient(sess)
 
# Let's upload a file!
import base64
f = open('temp_img').read()
img = base64.b64decode(f)
response = client.put_file('/test-img.png', img)
print "uploaded:", response

client.share('/test-img.png', short_url=False)
# https://www.dropbox.com/s/s1u52gerceg7bqq/test-img.png --> replace with https://dl.dropboxusercontent.com/s/s1u52gerceg7bqq/test-img.png