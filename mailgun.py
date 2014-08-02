import requests

def send_access_token_email_test():
    send_access_token_email('Cliff', 'cliff@gmail.com', 'Abelman',
    						'Davey', 'davidabelman@gmail.com', 'http://www.seltandpepper.com/sometoken/a0910ohn2o1j2n1')
    
def send_access_token_email(sender, sender_email, network, recipient, recipient_email, url):
	print "SENDING EMAIL"
	return requests.post(
		"https://api.mailgun.net/v2/sandbox8c1ada18520d4bd7bc1fa83b271e0dda.mailgun.org/messages",
        auth=("api", "key-4dccea8bd722ec8c58297a54ef87f837"),
        data={"from": "Salt & Pepper <postmaster@sandbox8c1ada18520d4bd7bc1fa83b271e0dda.mailgun.org>",
              "to": "%s <%s>" %(recipient, recipient_email),
              "subject": "%s has invited you to Salt & Pepper!" %sender,
              "text": 
              """
              \nDear %s,
              \nCongratulations, %s (%s) has just invited you to join the group '%s' on Salt & Pepper!
              \nHere you can enjoy the simplest ever way to chat, share photos and share videos between a small group of trusted companions.
              \nClick here to get started - %s.
              \nCan't wait to see you there!
              \nYour friends at Salt & Pepper.""" %(recipient, sender, sender_email, network, url)
             	}
         )
		
