from flask import Flask, render_template
app = Flask(__name__)

@app.route('/')
def home():
	"""
	If logged in, user sees main feed, if not, they see the main 'about' page
	"""
	if True:
		return render_template('feed.html')
	else:
		return render_template('info.html')

@app.route('/login')
def login():
	"""
	This is where you enter group name, then choose your group member name, then type your password
	"""
	return render_template('login.html')

@app.route('/signup')
def signup():
	"""
	This is where one person creates the group, he/she is then the admin(?)
	"""
	return render_template('signup.html')

if __name__ == '__main__':
	app.run(debug=True)