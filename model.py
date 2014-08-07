def load_user(collection, search_dict):
	"""
	Returns dict from mongodb, if dict is search query like {'network':'London', 'name':'David'}
	This is used to load session variables, which are passed to User class
	"""
	u_dict = collection.find_one(search_dict)
	u_dict.pop('password_hash', None)
	u_dict.pop('_id', None)
	return u_dict


class User:
	"""
	A class for the user
	"""
	def __init__(self, session_variables):
		self.name = session_variables.get('name', '')
		# self.email = session_variables.get('email', '')
		# self.picture = session_variables.get('picture', '')
		self.network = session_variables.get('network', '')
		self.role = session_variables.get('role', '')
		# self.admin_email = session_variables.get('admin_email', '')
		# self.admin_name = session_variables.get('admin_name', '')
		# self.token = session_variables.get('token', '')
		# self.token_not_used = session_variables.get('token_not_used', '')
		# self.token_sent = session_variables.get('token_sent', '')
		self.completed_registration = session_variables.get('completed_registration', '')
		# self.name_changed_before = session_variables.get('name_changed_before', '')
		self.session_variables = session_variables	
		# self.log_in_binary = session_variables.get('log_in_binary', '')

	def _(self, key):
		return self.session_variables.get(key, '')

	def is_admin(self):
		return self.role

	def is_a_user(self):
		return 1 if self.name and self.network and self.completed_registration else 0

	def to_console(self):
		print "\nThe current user's object has keys:"
		for key in self.session_variables:
			print "    ", key, ":", self.session_variables[key]