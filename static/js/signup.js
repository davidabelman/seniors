function check_network_exists() {
  // Function to check if network name already exists
    var network_input = $('#network').val()
    $.getJSON('/_network_exists',
              { 
                "network" : network_input
              },
              function(response) {
                if (response=='1') {
                      // $('#network-ok').hide()
                      $('#network-not-ok').text("Group name already taken").show()
                }
                else {
                      $('#network-not-ok').hide()
                      // $('#network-ok').show()
                }
                }) // end JSON
} // end check_network_exists

function validate_network_name() {
  // Client side validation
    var network_input = $('#network').val()
    var valid_response = valid_name_and_group_syntax(network_input, 4, 20)
    if (valid_response===true) {
      // $('#network-ok').show()
      $('#network-not-ok').hide()
    }
    else {
      // If group name is too short or long:
      $('#network-not-ok').text(valid_response).show()
      // $('#network-ok').hide()
      return;
    }

    check_network_exists()

} // end check_network_exists



function get_ajax_handlers_ready() {

  // Check network name on blur
  $('#network').blur( function() {
    validate_network_name()
  }) // end blur callback

  // Check network name on blur
  $('#email').blur( function() {
    validate_network_name()
  }) // end blur callback

  // Check network name on blur
  $('#name').blur( function() {
    validate_network_name()
  }) // end blur callback

  // Check network name on blur
  $('#password').blur( function() {
    validate_network_name()
  }) // end blur callback

  // Check network name on blur
  $('#password_confirm').blur( function() {
    validate_network_name()
  }) // end blur callback



  // Submitting all form data when done
  $('#registration_submit').click( function(evt) {
      evt.preventDefault();
      evt.stopImmediatePropagation();
      console.log('clicked')
      $.ajax({
                url:'/_create_account_create_network',
                data: JSON.stringify({
                  "network":$('#network').val(),
                  "email":$('#email').val(),
                  "name":$('#name').val(),
                  "password":$('#password').val()
                }, null, '\t'), // end data
                contentType: 'application/json;charset=UTF-8',
                type: "POST",
                success: function(response) { 
                  if (response==1) {
                        console.log ('Success! Redirect...')
                        window.location.href = "/add_users";
                      }
                  else {
                    $('#error_messages').text(response)
                  }
                }, // end success
                error: function() {
                  alert('Server error')
                }

              }) // end ajax
    } // end submit_click
    );
}

function show_signup_hint(title, body) {
  setTimeout(function() {
    $('#hints-div h1').text(title);
    $('#hints-div p').html(body);
    $('#hints-div').fadeIn();
  }, 100)
}

function hide_signup_hint_on_blurs() {
  $('input').blur( function() {
    $('#hints-div').fadeOut(50);  
  })
  
}

function get_hints_ready() {
  $('#network').focus( function() { show_signup_hint('Hint', 'The group name should be memorable, as all group members will need to use it to sign in.') } )
  $('#name').focus( function() { show_signup_hint('Hint', 'You should use your first name if possible, or a simple username that others will recognise. Spaces are fine!') } )
  $('#email').focus( function() { show_signup_hint('Hint', "To reset your password - <strong>or someone else's</strong> - you will need to be able to receive email.") } )
  $('#password').focus( function() { show_signup_hint('Hint', "You'll need to remember this next time you visit!") } )
  $('#password_confirm').focus( function() { show_signup_hint('Just checking', "This is just to ensure you know what password you're entering!") } )
}

get_ajax_handlers_ready()
// get_hints_ready()
// hide_signup_hint_on_blurs()