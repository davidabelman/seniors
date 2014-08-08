def load_user(collection, search_dict):
	"""
	Returns dict from mongodb, if dict is search query like {'network':'London', 'name':'David'}
	This is used to load session variables, which are passed to User class
	"""
	u_dict = collection.find_one(search_dict)
	if u_dict:
		u_dict.pop('password_hash', None) # Remove password from session variables
		user_id = u_dict.pop('_id', None) # Pop ID and convert to string, then put it back
		u_dict['user_id'] = str(user_id)
		return u_dict
	else:
		return None  # no user found


class User:
	"""
	A class for the user
	"""
	def __init__(self, session_variables):
		self.name = session_variables.get('name', '')
		self.network = session_variables.get('network', '')
		self.role = session_variables.get('role', '')
		self.completed_registration = session_variables.get('completed_registration', '')
		self.session_variables = session_variables	

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

