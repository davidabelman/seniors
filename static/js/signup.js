function validate_password() {
  // Client side validation
    var password_input = $('#password-input').val()
    var password_confirm_input = $('#password-confirm-input').val()
    var valid_response = two_passwords_ok(password_input, password_confirm_input, 6, 20)
    if (valid_response===true) {
      $('#success-password').text("Creating account, please wait...").fadeIn()
    }
    else {
      // If name is too short or long:
      $('#error-password').text(valid_response).fadeIn()
      return;
    }
    mixpanel.track('Signup1', {'Method':'Original'}) // i.e. he/she created group, no referrer
    $.ajax({
                url:'/_create_account_create_network',
                data: JSON.stringify({
                  "network":$('#network-input').val(),
                  "email":$('#email-input').val(),
                  "name":$('#name-input').val(),
                  "password":$('#password-input').val()
                }, null, '\t'), // end data
                contentType: 'application/json;charset=UTF-8',
                type: "POST",
                success: function(response) { 
                  if (response==1) {
                        $('#success-password').fadeOut( function() {
                          $('#success-password').text("Success!").fadeIn( function() {
                            setTimeout( function() {
                              fade_page_in_out('out', "/add_users")
                            }, 300) // end set timeout
                          }) // end fadeIn
                        }) // end fadeOut
                      } // end response = 1
                  else {
                    $('#error-password').text(response).fadeIn()
                  }
                }, // end success
                error: function() {
                  alert('Server error')
                }

              }) // end ajax
}

function validate_name() {
  // Client side validation only
    var name_input = $('#name-input').val()
    var valid_response = valid_name_and_group_syntax(name_input, 2, 15)
    if (valid_response===true) {
      $('#success-name').text("Hi "+name_input+"!").fadeIn( function() {
          $('.page2bof2').fadeIn();
          $('#password-input').focus()
        })
    }
    else {
      // If name is too short or long:
      $('#error-name').text(valid_response).fadeIn()
      return;
    }
}

function validate_email() {
  // Client side validation only
  var email = $('#email-input').val()
  valid_response = isEmail(email)
  if (valid_response===true) {
      $('#error-email').hide()
      $('#success-email').text("Great!").fadeIn( function() {
                        setTimeout( function() {
                            $('.page1of2').fadeOut( function() {
                              $('.page2of2').fadeIn();
                              $('#name-input').focus()
                            })                          
                        }, 400 )
                      })
    }
    else {
      // If group name is too short or long:
      $('#error-email').text("This is not a valid email address.").fadeIn()
      return;
    }
}

function validate_network() {
    // Client side validation
    var network_input = $('#network-input').val()
    var valid_response = valid_name_and_group_syntax(network_input, 4, 20)
    if (valid_response===true) {
      $('#error-network').hide()
    }
    else {
      // If group name is too short or long:
      $('#error-network').text(valid_response).fadeIn()
      return;
    }
    // Server side validation
    check_network_already_exists(network_input)

} // end check_network

function check_network_already_exists(name) {
  // Function to check if network name already exists
    $.getJSON('/_network_exists',
              { 
                "network" : name
              },
              function(response) {
                console.log(response)
                if (response=='1') {
                      // $('#network-ok').hide()
                      $('#error-network').text("Group name already taken").fadeIn()
                }
                else {
                      $('#success-network').text("Looks good to me!").fadeIn( function() {
                        $('.page1bof2').fadeIn();
                        $('#email-input').focus()
                      })

                }
          }) // end JSON
} // end check_network_exists


function bind_clicks() {

  // Network submit button
  $('#network-submit').click ( function(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    validate_network()
  })

  // Email submit button
  $('#email-submit').click ( function(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    validate_email()
  })

  // Name submit button
  $('#name-submit').click ( function(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    validate_name()
  })

  // Password submit button
  $('#password-submit').click ( function(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    validate_password()
  })
}


fade_page_in_out('in')
bind_clicks()
hide_messages_on_focus()
make_enter_key_submit_form('#network-input', '#network-submit')
make_enter_key_submit_form('#name-input', '#name-submit')
make_enter_key_submit_form('#email-input', '#email-submit')
make_enter_key_submit_form('#password-confirm-input', '#password-submit')
// Start by focusing form
$('#network-input').focus()