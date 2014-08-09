# README

## Introduction
A mini social-network designed for use by small groups (e.g. families) and in particular those who have members where traditional social media is too complex. Aims to be incredibly simple to use, even for those with very little experience with computers or the internet.

## Project structure
The app is built in Flask. The main routing file is seniors.py (on a local machine run python seniors.py runserver to run on the Flask server). Database currently uses mongohq. Templates all contained in one place. Each HTML template has a corresponding Javascript file, and also links to a common Javascript file with general functions in. Most functionality on site is result of AJAX calls to seniors.py.

## Functionality
Functionality (current): Create account and network, add other users to network (by email and create account on behalf), login, usernames/networks have tolerance for capitalisation and punctuation errors, user icons, post text, automatically see others' posts appearing, add image from internet search (bing), add image from webcam, timestamps, change all settings, email notifications once per day of new posts since login (with unsubscribe option), add older posts button, analytics tracking via mixpanel, responsive design, 

TODO: add image from computer, add sound file, add video, dictate text, synthesise text, forgot password feature, colour new messages, make other users admin, delete users, webcam photo as profile icon(?)

## seniors.py
Loads Flask modules and other modules created within project. Passwords stored in os.environ. Before each request we create a user object (global USER) based on session['user'] where the user is loaded when they signup or login (using load_user(Users, {'name':username, 'network':network}) ). This allows us to easily check for logged in and admin status etc. within routes. USER has a method of underscore which just returns the value inside the session_variable dictionary. E.g. a user pulled from the database will be in format:

{'name':'Joe', 'network':'MyFamily', 'role':1}

We can then get the name by saying USER._('name'). The reason we don't just use the dictionary as an object in itself is that we want some extra methods to be available on it. Note that a silly workaround has been implemented using session['logged_in'] in addition to session['user'] as some issues over non HTTPS when trying to use session.clear() on Heroku (the session wasn't clearing upon logout - so instead we set session['user']=None and session['logged_in']=0)

## mongo.py
Functionality for database access. db = start_up_mongo() to fire up database connection. Other functions to pull posts, delete all users, create test users etc.

## m.py
Run 'from m import *' to quickly have databases in Python namespace

## model.py
User class and ability to load user into session variable (removes password_hash field first)

## dropbox_upload.py
Takes image string as Base64 and uploads to private Dropbox link, returns URL

## mailgun.py
Functionality to send email using mailgun. Emails are sent:
* When an invite is sent from one user asking another to join the group
* On a CRON job daily to update users of new messages
Each of these can be tested without sending email, see file

## venv
activate --> source venv/bin/activate
deactivate --> deactivate

## Environment variables
These need to be put into the environment

## External
Mixpanel used to track events. Super properties added when a user signs in or creates an account which persist through the session (until a logout, which clears mixpanel cookie). User is identified on each page with a hidden input box, containing the users ID (_id on mongodb)

## Pages
### info
'/' routes to both the logged out homepage (info) and the logged in homepage (posts).

### signup
4 stage checkup with client and server validation allowing user to create a new network, and their user within it. Creates session['user']

### add_users
Allows admin to either create a username & password for someone else, or add by email. This sends an email (mailgun) to the specified address, with a generated token. A user visiting this token can then add their password (if token valid: expires after 30 days)

### login
3 stage process of typing in network name (optionally already filled in if coming from ../enter/_groupname_ URL), selecting user icon, and then entering password. Creates session['user']

### valid_token
Invitee can create password and is logged in. Creates session['user']

### post
Main page ('/' leads here when USER logged in). Loads X posts on render from server. Periodically checks for new posts from server (on scale of 5-10 seconds). If latest post on client doesn't match latest post on server, the new posts are added to DOM. When user posts some text, this is sent to server, and then a refresh is requested from the server (i.e. doesn't add it to screen on client side, though perhaps should?)

### add_image
Page allowing various image insertion options. Can either pull images from Bing (these are filtered according to size, only certain dimension images shown) or take a photo from webcam. In the latter case, this is encoded as Base64, saved as JPEG in Python to Dropbox link (long random string), which is then added to database as <img src=...> so it can be loaded within timelines.

### settings
Allows user to change settings, all via AJAX callbacks. Client and serverside validation.

### help
Basic help screens

### logout
session.clear() and return to home screen