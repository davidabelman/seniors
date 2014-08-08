def remove_whitespace_etc(x):
	return x

def generate_token(length):
	"""
	Generate random token
	"""
	import os, binascii
	return binascii.b2a_hex(os.urandom(length))