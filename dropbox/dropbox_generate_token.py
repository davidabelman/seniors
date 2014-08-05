#FROM http://taught-process.blogspot.co.uk/2012/05/asdlasd-asda-sd-asd-asdasd.html

# Include the Dropbox SDK libraries
from dropbox import client, rest, session
 
# Get your app key and secret from the Dropbox developer website
APP_KEY = 'vqffib25i3zi8nc'
APP_SECRET = 'ae8zppkwbcdql42'
 
# ACCESS_TYPE should be 'dropbox' or 'app_folder' as configured for your app
ACCESS_TYPE = 'app_folder'
 
sess = session.DropboxSession(APP_KEY, APP_SECRET, ACCESS_TYPE)
request_token = sess.obtain_request_token()
url = sess.build_authorize_url(request_token)
 
# Make the user sign in and authorize this token
print "url:", url
print "Please visit this website and press the 'Allow' button, then hit 'Enter' here."
raw_input()
 
# This will fail if the user didn't visit the above URL
access_token = sess.obtain_access_token(request_token)
 
#Print the token for future reference
print access_token

# I DID THIS AND GOT ACCESS_TOKEN PROPERTIWS OF THE FOLLOWING (connected to S&P1 app for davidabelman+s&p@gmail.com):
#key wdzl5swfk3wk9hqy
#secret k6c38pyop9zg0en