function bind_clicks() {
  $('#confirm_name').click( function(evt) {
      evt.preventDefault();
      evt.stopImmediatePropagation();
      check_form_and_show_password_page();
  })
  $('#submit_all_form_data').click( function(evt) {
      evt.preventDefault();
      evt.stopImmediatePropagation();
      submit_all_form_data();
    });
}

function check_form_and_show_password_page() {
  // Check if they changed the name
    var initial_name = $('#name_initial').val()
    var new_name = $('#name').val()
    if (initial_name == new_name) {
      // No change, so we can draw screen 2
      toggle_page_1_and_2(go_to_page=2)
      return
      } // end if
    
    // They changed the name
    // We need to check if the name they have entered is valid on the client and then server
        
    // Client side validation...
    var valid_response_firstname = valid_name_and_group_syntax(new_name, 2, 15);
    if (valid_response_firstname!=true) {
      $('#error-name').text(valid_response_firstname).fadeIn();
        return;
      } 
    
    // Server side validation on name in network
    var network = $('#network').val()
    var name = $('#name').val()
    $.getJSON('/_name_in_network_exists',
            { 
              "name" : name,
              "network" : network
            },
            function(response) {
              if (response=='1') {
                    $('#error-name').text("That name is already taken in this group.").fadeIn();
              }
              else {
                    $('#success-name').text("Hello"+name+"!").fadeIn( function() {
                      setTimeout( function() {
                        focus_at_end_of_input_form('#password')
                        toggle_page_1_and_2(go_to_page=2)

                      }, 500)
                    });
                    
              }
    }) // end JSON
}

function submit_all_form_data() {
  // Client side check on password
  new_password = $('#password').val();
  new_password_confirm = $('#password_confirm').val();
  var valid_response = two_passwords_ok(new_password, new_password_confirm, 6, 20)
  if (valid_response!=true)
  {
    // Passwords do not match or are wrong size
    $('#error-password').text(valid_response+" Please try again.").fadeIn();
    return;
  }

  mixpanel.track('Signup', {'Method':'Email'})
  // Server check if all OK
  $.ajax({
            url:'/_create_account_join_network',
            data: JSON.stringify({
              "name":$('#name').val(),
              "password":$('#password').val()
            }, null, '\t'), // end data
            contentType: 'application/json;charset=UTF-8',
            type: "POST",
            success: function(response) { 
              $('#success-password').text("Success! Taking you to the group...").fadeIn( function() {
                            setTimeout( function() {
                              fade_page_in_out('out', "/")
                            }, 500) // end set timeout
                          }) // end fadeIn
            }, // end success
            error: function() {
              $('#error-password').text("Oops! There has been a server error. Please try again.").fadeIn();
            } // end error
          }) // end ajax
}; // end submit_click


fade_page_in_out('in')
bind_clicks()
hide_messages_on_focus()
focus_at_end_of_input_form('#name')
make_enter_key_submit_form('#name', '#confirm_name')
make_enter_key_submit_form('#password_confirm', '#submit_all_form_data')
