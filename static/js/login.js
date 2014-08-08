function bind_clicks() {
  // Bind network submit to click
  $('#choose_network_submit').click( function(evt) {
   evt.preventDefault();
   evt.stopImmediatePropagation();
   check_form_and_show_usernames()
  })

  // Bind password submit

  $('#password_submit').click( function(evt) {
      evt.preventDefault();
      evt.stopImmediatePropagation();
      check_form_and_login()
    })
}

function check_form_and_show_usernames() {
      var network = $('#network').val();

      // Client side validation
      var valid_response = valid_name_and_group_syntax(network, 4, 20)
      if (valid_response===true) {
        // We're fine, so continue
      }
      else {
        // If group name is too short or long:
        $('#network-error-message').text(valid_response).fadeIn()
        return;
      }
      
      // Drawing a list of user icons if they exist (or firing error message if not)
      $.getJSON('/_network_users_list',
                {"network":network},
                function(result) {
                  data = result['data']
                  status = result['status']
                  if (status==1) {
                    // We will now display the users
                    toggle_page_1_and_2()
                    html = "<row>"
                    $.each( data, function(i, d) {
                        html += "<div class='col-md-3 col-xs-4 user-icon-div  icon_unselected'>"
                        html+=  "  <img src='/static/img/"+d.picture+"-icon.png' class='img-responsive user-icon-img'>"
                        html+=  "  <span class='user-icon-span'>"+d.name+"</span>"
                        html+=  "</div>"
                    }) //each
                    html += "</row>"
                    $('#user_grid').html(html);
                    make_user_icons_clickable()
                  } // end it
                  else {
                    // No users in network, i.e doesn't exist, display error
                    $('#network-error-message').text(result['data']).fadeIn();
                  }                  
                }) // end getJSON
}


var make_user_icons_clickable = function() {

  // When any user icon is clicked, we bring up password form, fade the others
  $('.user-icon-div').click( function() {
    
    // Remove any fade
    fade_unselected_icons('unfade')

    // Swap fade labels around (icon_selected is also used within password submit)
    $('.user-icon-div').addClass( "icon_unselected" )
    $('.user-icon-div').removeClass( "icon_selected" )
    $(this).removeClass( "icon_unselected" )
    $(this).addClass( "icon_selected" )
    // Fade again
    fade_unselected_icons('fade')
    
    // Show password entry with correct name
    $('#password_entry').fadeIn();
    $('#password_enter_field').focus();
    $('#chosen_name').text( $(this).find('.user-icon-span').text() ) // Update the name within the span based on the clicked item

  }); // end click
}

function fade_unselected_icons(fade_or_unfade) {
  if (fade_or_unfade =='fade') {
    $('.icon_unselected').css('opacity',0.4)
  }
  else {
    $('.icon_unselected').css('opacity',1)
  }
}

function check_form_and_login() {

  // Client and server validation on password when clicked
      var network = $('#network').val();  // This comes from page 1 of 2
      var username = $('.icon_selected').find('.user-icon-span').text()
      var password = $('#password_enter_field').val()

      // Client side validation
      var valid_response = valid_password_length(password, 6, 20)
      if (valid_response===true) {
        // We're fine, so continue
      }
      else {
        // If password is too short or long:
        $('#password-error-message').text(valid_response).fadeIn();
        return;
      }

      // Now check if password OK on server
      $.ajax({
                url:'/_check_network_username_password',
                data: JSON.stringify({
                  "network":network,
                  "username":username,
                  "password":password
                }, null, '\t'),
                contentType: 'application/json;charset=UTF-8',
                type: "POST",
                success: function(result) { 
                  result = JSON.parse(result)
                  if (result['status']=="1") {
                    // Let's go!
                    var user_id = result["user_id"]; // We sent the logged in user ID
                    // Mixpanel
                    //... Track person
                    mixpanel.identify(user_id)
                    mixpanel.people.set_once({  // This will only overwrite if not set before (i.e. not original group creator)
                              "Signup method": 'On behalf',
                              "$created": Date(),
                              "Logins": 1,
                              "Text posts":0,
                              "Image posts":0,
                              "$first_name" : username,
                              "Network" : network,
                      });
                    mixpanel.people.increment('Logins', 1);
                    //... Register super properties for this session
                    mixpanel.register_once({  // This will only overwrite if not set before (i.e. not original group creator)
                        "Session method": 'Log in',
                        "Name" : username,
                        "Network" : network,
                    });
                    mixpanel.track('Login');

                    // Go to posts page
                    fade_page_in_out('out','/');
                    
                  }
                  else {
                    c(result['data'])
                    $('#password-error-message').text(result['data']).fadeIn();
                  }
                },
                error: function() {
                  alert('Server error')
                }
              }) // end ajax

}




fade_page_in_out('in') // From common.js

bind_clicks()
hide_messages_on_focus()  // From common.js

focus_at_end_of_input_form('#network')
focus_at_end_of_input_form('#password_enter_field')
make_enter_key_submit_form('#network', '#choose_network_submit')
make_enter_key_submit_form('#password_enter_field', '#password_submit')
