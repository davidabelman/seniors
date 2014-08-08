function bind_clicks() {
  // This will invite a user by email when submit pressed
  $('#submit_email_invitation').click( function(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    check_form_and_invite_user_by_email()
  }) // end submit

  // This will add user to DB when submit pressed
  $('#create_account_on_behalf').click( function(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    check_form_and_add_user_to_db()
  }) // end submit
}

function check_form_and_invite_user_by_email() {
    // This will add a user by email 
    var email = $('#email').val();
    var firstname = $('#firstname').val();

      // Client side validation...
      //... of email
      var valid_response_email = isEmail(email);
      if (valid_response_email!=true) {
        display_error('This is not a valid email address.', '#email_invitation_error')
        return;
      }

      //... of username
      var valid_response_firstname = valid_name_and_group_syntax(firstname, 2, 15);
      if (valid_response_firstname!=true) {
        display_error(valid_response_firstname, '#email_invitation_error')
        return;
      }

    // Server add user (or display error)
    $.ajax( {
      url: '/_add_user_via_access_token',
      data: JSON.stringify ({
        'email':email,
        'firstname':firstname
        //'admin':admin
      }, null, '\t'),
      contentType: 'application/json;charset=UTF-8',
      type: "POST",
      success: function(response) {
        if (response=='1') {
          // We will show a message to user saying successful (clear page 1, show page 2a)
          mixpanel.track('Invite send')
          redraw_screen(page_1_or_2='2', page_2a_or_2b='2a', name=$('#firstname').val())
        }
        else {
          display_error(response, '#email_invitation_error')
        }
      },
      fail: function() {
        alert("Server error?")
      } // end success callback
    }); // end ajax
}

function check_form_and_add_user_to_db() {
  // This will just add the user to the database, can then show them how to log on at ..com/enter/networkname
    var initial_name = $('#initial_name').val()
    var password = $('#password').val()

      // Client side validation...
      //... of username
      var valid_response_firstname = valid_name_and_group_syntax(initial_name, 2, 15);
      if (valid_response_firstname!=true) {
        display_error(valid_response_firstname, '#create_account_error')
        return;
      }

      //... of password
      var valid_password = valid_password_length(password, 6, 20);
      if (valid_password!=true) {
        display_error(valid_password, '#create_account_error')
        return;
      }

    // Server add user and check name doesn't exist
    $.ajax( {
      url: '/_add_user_on_behalf',
      data: JSON.stringify ({
        'name':initial_name,
        'password':password,
      }, null, '\t'), // end data
      contentType: 'application/json;charset=UTF-8',
      type: "POST",
      success: function(response) {
        if (response=='1') {
          mixpanel.track('Signup', {'Method':'On behalf'})

          // We will show a message to user saying successful (clear page 1, show page 2b)
          c('Added user successfully to database');
          network = $('#network_hidden').val();

          // Now redraw screen
          redraw_screen(page_1_or_2='2', page_2a_or_2b='2b', name=$('#initial_name').val())

          } // end if
        else {
          display_error(response, '#create_account_error')
        }
      } // end success callback
    }) // end ajax
}

function get_page2_links_ready() {
  $('#add_another_user').click( function(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    redraw_screen(page_1_or_2='1')
  }) // end add another user

  $('#go_to_group').click( function(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    fade_page_in_out('out','/')
  })
}


function redraw_screen(page_1_or_2, page_2a_or_2b, name) {
  // This function switches between the 'add user' screen and the confirmation messages (2 variations)

  if (page_1_or_2 == '2') {
    // Fill in page 2 with the correct values
    $('.invited-name').text(name)

    // Show the correct version of page 2
    if (page_2a_or_2b == '2b') {
      $('.page2a').hide();
      $('.page2b').show(); 
    }
    else {
      $('.page2a').show();
      $('.page2b').hide();  
    }
    
    // Fade out page 1 and show page 2
    $('.page1of2').fadeOut( function() {
      $('.page2of2').fadeIn();
    })
  } // end if
  else {
    // Clear all values on page 1
    $('input').val('')
    $('.flash-message').fadeOut();

    // Show page 1
    $('.page2of2').fadeOut ( function () {
      $('.page1of2').fadeIn();
    })
  }
}

function display_error(message, id) {
  // id should be #create_account_error or #email_invitation_error, i.e. shows where to place the error message
  if (message[0]=='"') {
    // Cut quotes off if receiving from server
    message = message.substring(1, message.length-1)
  }
  $(id).text(message)
  $(id).fadeIn()
}


fade_page_in_out('in')
hide_messages_on_focus()
bind_clicks()
get_page2_links_ready()