def clean_str(string):
	"""
	Keep only alphanumerics and convert to lowercase
	"""
	import re
	return re.sub(ur'[\W_]+', u'', string, flags=re.UNICODE).lower()

def generate_token(length):
	"""
	Generate random token
	"""
	import os, binascii
	return binascii.b2a_hex(os.urandom(length))