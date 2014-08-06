function prepare_LHS_button_fading_behaviour () {
	// Enables click behaviour for buttons on LHS
	// Fades all other buttons when one is clicked
	// Brings up correct content on RHS
			$('#change-name-button').click( function(evt) {

			// Fade other buttons on click, and show relevant content on RHS
			evt.preventDefault();
		    evt.stopImmediatePropagation();
		    
		    // Fade all but current button
		    $('#change-name-button').css('opacity',1)
			$('#change-email-button').css('opacity',0.6)
			$('#change-password-button').css('opacity',0.6)
			$('#change-picture-button').css('opacity',0.6)
			$('#users-button').css('opacity',0.6)

			// Fade all RHS content and make sure page 1 of 2 is showing
			$('.rhs-to-disappear').fadeOut(50, function() {
				$('.page2of2').hide()
		    	$('.page1of2').fadeIn(300)
			})

			// Show relevant RHS content
			setTimeout ( function() {
				$('#change-name-rhs').fadeIn(300)
			} , 51 ) 
		});

		$('#change-email-button').click( function(evt) {
			// Fade other buttons on click, and show relevant content on RHS
			evt.preventDefault();
		    evt.stopImmediatePropagation();

		    // Fade all but current button
		    $('#change-name-button').css('opacity',0.6)
			$('#change-email-button').css('opacity',1)
			$('#change-password-button').css('opacity',0.6)
			$('#change-picture-button').css('opacity',0.6)
			$('#users-button').css('opacity',0.6)

			// Fade all RHS content and make sure page 1 of 2 is showing
			$('.rhs-to-disappear').fadeOut(50, function() {
				$('.page2of2').hide()
		    	$('.page1of2').fadeIn(300)
			})

			// Show relevant RHS content
			setTimeout ( function() {
				$('#change-email-rhs').fadeIn(300)
			} , 51 ) 
		});

		$('#change-password-button').click( function(evt) {
			// Fade other buttons on click, and show relevant content on RHS
			evt.preventDefault();
		    evt.stopImmediatePropagation();

		    // Fade all but current button
		    $('#change-name-button').css('opacity',0.6)
			$('#change-email-button').css('opacity',0.6)
			$('#change-password-button').css('opacity',1)
			$('#change-picture-button').css('opacity',0.6)
			$('#users-button').css('opacity',0.6)

			// Fade all RHS content and make sure page 1 of 2 is showing
			$('.rhs-to-disappear').fadeOut(50, function() {
				$('.page2of2').hide()
		    	$('.page1of2').fadeIn(300)
			})

			// Show relevant RHS content
			setTimeout ( function() {
				$('#change-password-rhs').fadeIn(300)
			} , 51 ) 
		});

		$('#change-picture-button').click( function(evt) {
			// Fade other buttons on click, and show relevant content on RHS
			evt.preventDefault();
		    evt.stopImmediatePropagation();

		    // Fade all but current button
		    $('#change-name-button').css('opacity',0.6)
			$('#change-email-button').css('opacity',0.6)
			$('#change-password-button').css('opacity',0.6)
			$('#change-picture-button').css('opacity',1)
			$('#users-button').css('opacity',0.6)

			// Fade all RHS content and make sure page 1 of 2 is showing
			$('.rhs-to-disappear').fadeOut(50, function() {
				$('.page2of2').hide()
		    	$('.page1of2').fadeIn(300)
			})

			// Show relevant RHS content
			setTimeout ( function() {
				$('#change-picture-rhs').fadeIn(300)
			} , 51 ) 
		});

		$('#back-to-group-button').click( function(evt) {
			// Reload main page
			evt.preventDefault()
			evt.stopImmediatePropagation()
			fade_page_in('out')
			setTimeout( function() {window.location.href = "/"}, 500)
		})
} // end fading behaviour for LHS buttons


$('.icon-pick').click( function(evt) {
	// Update database to use this icon as user's icon
	evt.preventDefault()
	evt.stopImmediatePropagation()
	animal = $(this).attr('animal');
	$.ajax({
                url:'/_change_profile_picture',
                data: JSON.stringify({
                  "animal":animal
                }, null, '\t'), // end data
                contentType: 'application/json;charset=UTF-8',
                type: "POST",
                success: function(result) { 
                  result = JSON.parse(result);
                  if (result==1) {
                  	$('.response-message').text('Your picture has been changed succesfully!')
                  	$('.page1of2').fadeOut( function() {
                  		$('.page2of2').fadeTo(300,1)
                  	})
                  }
	                else {
	                	$('.response-message').text(result)
	                	$('.page1of2').fadeOut( function() {
	                  		$('.page2of2').fadeTo(300,1)
	                	})	   
	                } // end else
                }, // end success
                error: function() {
                  alert('Server error')
                }
              }) // end ajax
})

$('#change-name-submit').click( function(evt) {
	// Update user's name (check it doesn't exist already)
	evt.preventDefault()
	evt.stopImmediatePropagation()
	new_name = $('#name-input').val();

	// Client side validation
      var valid_response = valid_name_and_group_syntax(new_name, 2, 15)
      if (valid_response===true) {
        // We're fine, so continue
      }
      else {
        // If group name is too short or long:
        $('.response-message').text(valid_response+" Your name has not been changed.")
    	$('.page1of2').fadeOut( function() {
  		$('.page2of2').fadeTo(300,1)
        	})
    	console.log('too short?')
        return;
      }

	$.ajax({
                url:'/_change_username',
                data: JSON.stringify({
                  "new_name":new_name
                }, null, '\t'), // end data
                contentType: 'application/json;charset=UTF-8',
                type: "POST",
                success: function(result) { 
                	result = JSON.parse(result);
                	if (result==1) {
                		$('.response-message').text('Your name has been changed succesfully! Note that you cannot now make another change to your name on this site.')
                		// Change name on HTML page already rendered
	                  	$('.page1of2').fadeOut( function() {
	                  		$('.page2of2').fadeTo(300,1)
	                  		$('.name-from-server').text(new_name)
	                 	 })
	                  }
	                else {
	                	$('.response-message').text(result)
	                	$('.page1of2').fadeOut( function() {
	                  		$('.page2of2').fadeTo(300,1)
	                	})
	                } // end else               
                }, // end success
                error: function() {
                  alert('Server error')
                }
              }) // end ajax
})

$('#change-email-submit').click( function(evt) {
	// Update user's email (check password too)
	evt.preventDefault()
	evt.stopImmediatePropagation()
	new_email = $('#email-input').val();
	password = $('#email-password-confirm').val()
	$('#email-password-confirm').val('')

	// Client side validation of email
      var valid_response = isEmail(new_email)
      if (valid_response===true) {
        // We're fine, so continue
      }
      else {
        // If group name is too short or long:
        $('.response-message').text("This doesn't look like a valid email address. Please try again.")
    	$('.page1of2').fadeOut( function() {
  		$('.page2of2').fadeTo(300,1)
        	})
        return;
      }

	$.ajax({
                url:'/_change_email',
                data: JSON.stringify({
                  "new_email":new_email,
                  'password':password
                }, null, '\t'), // end data
                contentType: 'application/json;charset=UTF-8',
                type: "POST",
                success: function(result) { 
                	result = JSON.parse(result);
                	if (result==1) {
                		$('.response-message').text('Your email address has been changed succesfully!')
                		// Change name on HTML page already rendered
	                  	$('.page1of2').fadeOut( function() {
	                  		$('.page2of2').fadeTo(300,1)
	                  		$('.email-from-server').text(new_email)
	                 	 })
	                  }
	                else {
	                	$('.response-message').text(result)
	                	$('.page1of2').fadeOut( function() {
	                  		$('.page2of2').fadeTo(300,1)
	                 		})
	               		} // end else          
                }, // end success
                error: function() {
                  alert('Server error')
                }
              }) // end ajax
})

$('#change-password-submit').click( function(evt) {
	// Update user's email (check password too)
	evt.preventDefault()
	evt.stopImmediatePropagation()

	old_password = $('#old-password').val();
	new_password = $('#new-password').val();
	new_password_confirm = $('#new-password-confirm').val();

	// Client side validation password type
	  var valid_response = two_passwords_ok(new_password, new_password_confirm, 6, 20)
	  if (valid_response===true) {
	    // We're fine, so continue
	  }
	  else {
	    // If group name is too short or long:
	    $('.response-message').text(valid_response+" Your password has not been changed. Please try again.")
		$('.page1of2').fadeOut( function() {
			$('.page2of2').fadeTo(300,1)
	    	})
	    return;
	  }

	$.ajax({
                url:'/_change_password',
                data: JSON.stringify({
                  "old_password":old_password,
                  'new_password':new_password
                }, null, '\t'), // end data
                contentType: 'application/json;charset=UTF-8',
                type: "POST",
                success: function(result) { 
                	result = JSON.parse(result);
                	if (result==1) {
                		$('.response-message').text('Your password has been changed succesfully!')
                		// Change name on HTML page already rendered
	                  	$('.page1of2').fadeOut( function() {
	                  		$('.page2of2').fadeTo(300,1)
	                 	 })
	                  }
	                else {
	                	$('.response-message').text(result)
	                	$('.page1of2').fadeOut( function() {
	                  		$('.page2of2').fadeTo(300,1)
	                	})
	                } // end else	               
                }, // end success
                error: function() {
                  alert('Server error')
                }
              }) // end ajax
})

// TODO duplicated in add-image
function fade_page_in(fade_in_out) {
	if (fade_in_out == 'in') {
		$('.initially-hidden').fadeTo(500, 1)
	}
	else {
		$('.initially-hidden').fadeTo(300, 0)
	}
}

prepare_LHS_button_fading_behaviour()
fade_page_in('in')