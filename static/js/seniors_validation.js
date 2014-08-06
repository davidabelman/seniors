function alphanumeric(inputtxt) { 
  var letters = /^[-&.\s0-9a-zA-Z]+$/;
  if (letters.test(inputtxt)) {
    return true;
  } else {
    return false;
  }
}

function valid_name_and_group_syntax(x, min, max) {
	if(x.length<min) {
		return "Name must be "+min+" letters or more."
	}
	if(x.length>max) {
		return "Name must be "+max+" letters or less."
	}
	if( !alphanumeric(x) ) {
		return "Name should use letters, numbers and spaces only."
	}
	else { return true }
}

function valid_password_length(x, min, max) {
	if(x.length<min) {
		return "Password must be "+min+" characters or more."
	}
	if(x.length>max) {
		return "Password must be "+max+" characters or less."
	}
	else { return true }
}

function two_passwords_ok(x, y, min, max) {
	if(x!=y) {
		return "Passwords do not match."
	}
	else {
		return valid_password_length(x, min, max)
	}
}

// http://badsyntax.co/post/javascript-email-validation-rfc822
function isEmail(email){
        return /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/.test( email );
}