function get_submit_buttons_ready() {

  // Focus on name at the end of set value
  $('#name').prop("selectionStart", $('#name').val().length) // set caret to length (end)
       .focus();

  // Page 1/2
  // Accepting given name (or altered name, check against DB) then bring on the 2nd page
  $('#confirm_name').click( function(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    
    // Check if they changed the name
    var initial_name = $('#name_initial').val()
    var new_name = $('#name').val()
    if (initial_name == new_name) {
      // No change, so we can draw screen 2
      console.log("no name change")
      toggle_page_1_and_2(go_to_page=2)
      } // end if
    
    else {
        // We need to check if the name they have entered is valid on the client and then server
        
        // Client side validation...
        var valid_response_firstname = valid_name_and_group_syntax(new_name, 2, 15);
        if (valid_response_firstname!=true) {
          $('.error-message h2').text(valid_response_firstname)
          $('.error-message').fadeIn();
            return;
          return;
        }

        check_name_in_network_exists_to_toggle_page();
      } // end checking name change
    }) // end confirm_name click

}

function check_name_in_network_exists_to_toggle_page() {
  // Function to check if network name already exists
    var network = $('#network').val()
    var name = $('#name').val()
    console.log(name)
    $.getJSON('/_name_in_network_exists',
              { 
                "name" : name,
                "network" : network
              },
              function(response) {
                if (response=='1') {
                      $('.error-message h2').text("That name is already taken in this group.")
                      $('.error-message').fadeIn();
                }
                else {
                      $('.error-message').fadeOut();
                      toggle_page_1_and_2(go_to_page=2)
                }
    }) // end JSON
} // end check_name_in_network_exists

function toggle_page_1_and_2(go_to_page) {
  if (go_to_page==1) {
    $('.page2of2').fadeOut( function() {
      $('.page1of2').fadeIn()
    })
    
  }
  else {
    $('.page1of2').fadeOut( function() {
      $('.page2of2').fadeIn()
    })
    
  }
}

// Submitting all form data when done
$('#submit_all_form_data').click( function(evt) {
  evt.preventDefault();
  evt.stopImmediatePropagation();

  // Client side check on password
  new_password = $('#password').val();
  new_password_confirm = $('#password_confirm').val();

  // Client side validation password type
    var valid_response = two_passwords_ok(new_password, new_password_confirm, 6, 20)
    if (valid_response!=true)
    {
      // Passwords do not match or are wrong size
      $('.error-message h2').text(valid_response+" Please try again.")
      $('.error-message').fadeIn();
      return;
    }

    console.log('ajax request')

  $.ajax({
            url:'/_create_account_join_network',
            data: JSON.stringify({
              "name":$('#name').val(),
              "password":$('#password').val()
            }, null, '\t'), // end data
            contentType: 'application/json;charset=UTF-8',
            type: "POST",
            success: function(response) { 
              console.log ('Success! Redirect...')
              $('.centered-page').fadeOut('fast', function() {
                window.location.href = "/";
              })
              
            }, // end success
            error: function() {
              alert('Server error')
            } // end error
          }) // end ajax
}); // end submit_click


function hide_error_message_when_input_active() {
  $('#name, #password, #password_confirm').focus( function() {
      $('.error-message').fadeOut();
    })
  $('#name, #password, #password_confirm').keyup( function() {
      $('.error-message').fadeOut();
    })
  // And when user clicks submit
  $('#confirm_name, #submit_all_form_data').click( function(evt) {
    $('.error-message').fadeOut();
    })
}

get_submit_buttons_ready()
hide_error_message_when_input_active()
