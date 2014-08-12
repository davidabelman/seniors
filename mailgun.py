import os
import requests
import random
import datetime
import time
import urllib

SENIORS_MAILGUN_KEY = os.environ.get('SENIORS_MAILGUN_KEY')
company_name = "Salt & Pepper"
company_url = 'http://salt-and-pepper.herokuapp.com'


########################################## FEEDBACK #########################################
def receive_feedback_via_email(feedback_user, subject, message):
  """
  Sends a message to my email address from a user 
  """
  if not feedback_user:
    feedback_user = {'name':'Unknown (logged out)', 'email':'unknown email'}
  if not feedback_user['email']:
    feedback_user['email'] = 'unknown email'
  print "Sending email via mailgun"
  return requests.post(
    "https://api.mailgun.net/v2/sandbox8c1ada18520d4bd7bc1fa83b271e0dda.mailgun.org/messages",
    auth=("api", SENIORS_MAILGUN_KEY),
    data={"from": "User <postmaster@sandbox8c1ada18520d4bd7bc1fa83b271e0dda.mailgun.org>",
              "to": "David <davidabelman@gmail.com>",
              "subject": "S&P Feedback - %s" %subject,
              "text": "%s (%s) says: %s" %( feedback_user['name'], feedback_user['email'], message )
          }
    )


########################################## ACCESS TOKENS #########################################
def send_access_token_email_test():
    send_access_token_email('Cliff', 'cliff@gmail.com', 'Abelman',
    						'Davey', 'davidabelman@gmail.com', 'http://www.seltandpepper.com/sometoken/a0910ohn2o1j2n1')
    
def send_access_token_email(sender, sender_email, network, recipient, recipient_email, url):
	print "Sending email via mailgun..."
	return requests.post(
		"https://api.mailgun.net/v2/sandbox8c1ada18520d4bd7bc1fa83b271e0dda.mailgun.org/messages",
        auth=("api", SENIORS_MAILGUN_KEY),
        data={"from": "Salt & Pepper <postmaster@sandbox8c1ada18520d4bd7bc1fa83b271e0dda.mailgun.org>",
              "to": "%s <%s>" %(recipient, recipient_email),
              "subject": "%s has invited you to Salt & Pepper!" %sender,
              "text": 
              """
              \nDear %s,
              \nCongratulations, %s (%s) has just invited you to join the group '%s' on Salt & Pepper!
              \nHere you can enjoy the simplest way ever to share messages and photos amongst a small group of trusted companions.
              \nClick here to get started - %s.
              \nCan't wait to see you there!
              \nYour friends at Salt & Pepper.""" %(recipient, sender, sender_email, network, url)
             	}
         )
		

################################## DAILY DIGEST EMAIL ###############################################
def send_daily_digest_to_all_users(testing=True):
  """
  This function is the main function for this section, and needs to be run once per day at a set time.
  It loops through all registered users (who have confirmed account and not opted out of email)
  If there have been posts in their network since the user was last seen by us, an email is sent to them
  Email is customised according to how long ago they were seen, and how many messages there have been
  Email only sent on day 1, 2, 3 and X%5==0
  Unsubscribe link uses a token which looks them up if they click on it
  """
  import mongo
  db = mongo.start_up_mongo()

  print "Preparing to send out daily digest emails..."
  if testing:
    print "TESTING MODE ON: EMAILS NOT ACTUALLY SENT."

  # Loop through all users
  for u in db.users.find( ):
      last_seen = u.get('last_seen',None)
      email = u.get('email',None)
      unsubscribed = u.get('unsubscribed',None)
      completed_registration = u.get('completed_registration',None)
      name = u.get('name',None)
      network = u.get('network',None)
      # name_clean = u.get('name_clean',None)
      # network_clean = u.get('network_clean',None)
      unsubscribe_token = u.get('unsubscribe_token',None)
      url = "%s/enter/%s/%s" %(company_url, urllib.quote(network), urllib.quote(name))
      unsubscribe_url = "%s/unsubscribe/%s" %(company_url, unsubscribe_token)

      print "\n=====\nGot user! Variables:"
      print last_seen, email, unsubscribed, completed_registration, name, network, url

      # If they have a last seen date, they have completed registration, an email, and have not unsubscribed...
      if last_seen and email and completed_registration and not unsubscribed:

        print "They are a valid email target! How many posts since their login?"

        # Find posts since they were last seen (note that they're seen status is updated to now+1 minute when they post so they should not appear in this block)
        missed_posts = db.posts.find( { 'posted': {'$gt': last_seen }, 'network':network} );
        number_of_posts = missed_posts.count()
        print "Number of posts =", number_of_posts

        # Send message if 1 or more posts
        if number_of_posts>=1:
          senders = set()
          for p in missed_posts:
            senders.add(p['name'])
          print "Senders are", senders

          # Create message parts (only send a message on certain days, defined in create_opening_line)
          subject_line, opening_line = create_opening_line(last_seen)
          if opening_line:
            main_text = create_main_text(number_of_posts, senders, url)
            closing_line = create_closing_line()

            # Compose full message and send
            full_message_body = create_full_message_body(name, opening_line, main_text, closing_line, company_name, unsubscribe_url)
            print "Full subject and message body is this:"
            print subject_line, full_message_body
            if not testing:
              time.sleep(0.1)
              send_one_daily_digest(company_name, name, email, subject_line, full_message_body)
          else:
            print "Not sending user an email today (only send on certain days)"
        else:
          print "No posts to send them."
      else:
        print "Not a valid email target."


def create_opening_line(last_seen):
  """
  Returns a subject line and opening line depending on when user last logged in
  """
  seconds = (datetime.datetime.utcnow() - last_seen).total_seconds()
  days = seconds*1.0/60/60/24
  if days<1:
    return ["Activity today", "Good day!"]
  if days<2:
    return ["Unread messages", "How are you today?"]
  if days<4:
    return ["You're missing out on the fun!",  "It's been a few days since we saw you on %s. Hoping you're doing great." %(company_name)]
  if round(days)%5==0:
    return ["Your unread messages",  "We're missing you at %s - come and check in on the action that you've been missing!" %(company_name)]
  else:
    return [None, None]

def list_senders(senders):
  """
  Put commas and ands in correct place when listing a set of users (e.g. David / David and Ben / David, Ben and Annie )
  """
  s = list(senders)
  if len(s) == 1:
    return s[0]
  elif len(s) == 2:
    return "%s and %s" %(s[0], s[1])
  else:
    string = ""
    for i in range(len(s)-1):
      string += (str(s[i])+', ')
    return "%s and %s" %(string[:-2], str(s[-1]))


def create_main_text(number_of_posts, senders, url):
  if number_of_posts==1:
    return "Since we last saw you, %s has sent a message to the group. Click here to take a look: %s." %(list_senders(senders), url)
  if number_of_posts<=3:
    return "Since we last saw you, there have been %s messages from %s to the group. Click here to take a look: %s." %(number_of_posts, list_senders(senders), url)
  else:
    return "Since we last saw you, there have been a few messages from %s to the group. Click here to take a look: %s." %(list_senders(senders), url)


def create_closing_line():
  return random.choice(['Over and out.', 'With best wishes,', 'All the best,', 'Till next time,', 'See you soon!'])

def create_full_message_body(name, opening_line, main_text, closing_line, company_name, unsubscribe_url):
  return """
\nDear %s,
\n%s
\n%s
\n%s
\nYour friends at %s.
\n\nPS - if you no longer wish to receive these updates, please click on %s.
      """ %(name, opening_line, main_text, closing_line, company_name, unsubscribe_url)

def send_one_daily_digest(company_name, recipient, recipient_email, subject_line, full_message_body):
  print "Sending email via mailgun..."
  return requests.post(
    "https://api.mailgun.net/v2/sandbox8c1ada18520d4bd7bc1fa83b271e0dda.mailgun.org/messages",
        auth=("api", SENIORS_MAILGUN_KEY),
        data={"from": "%s <postmaster@sandbox8c1ada18520d4bd7bc1fa83b271e0dda.mailgun.org>" %(company_name),
              "to": "%s <%s>" %(recipient, recipient_email),
              "subject": subject_line,
              "text": full_message_body
              }
         )
