

function get_ready_to_check_network() {
  //Focus if box is empty
  if (!$("#network").val()) { 
    $("#network").focus();
  }

  // Make enter key click submit
  $("#network").keyup(function(event){
    if(event.keyCode == 13){
        $("#choose_network_submit").click();
    }
  });

  // Bind to click
  $('#choose_network_submit').click( function(evt) {
  		evt.preventDefault();
      evt.stopImmediatePropagation();
      var network = $('#network').val();

      // Client side validation
      var valid_response = valid_name_and_group_syntax(network, 4, 20)
      if (valid_response===true) {
        // We're fine, so continue
      }
      else {
        // If group name is too short or long:
        $('.error-message h2').text(valid_response)
        $('.error-message').fadeIn();
        return;
      }
  		
      // Drawing a list of users if they exist (or firing error message if not)
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
                    make_user_icon_clickable()
                  } // end it
                  else {
                    // No users in network, i.e doesn't exist, display error
                    $('#network_does_not_exist_message h2').text(result['data'])
                    $('#network_does_not_exist_message').fadeIn();
                  }                  
                })
  }); // end submit

}

var make_user_icon_clickable = function() {
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

function get_ready_to_check_password() {

  // Make enter key click submit
  $("#password_enter_field").keyup(function(event){
    if(event.keyCode == 13){
        $("#password_submit").click();
    }
  });

  // Client and server validation on password when clicked
  $('#password_submit').click( function(evt) {
      evt.preventDefault();
      evt.stopImmediatePropagation();
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
        $('#password-error-message h2').text(valid_response)
        $('.error-message').fadeIn();
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
                    fade_page_in('out')
                    setTimeout( function() {window.location.href = "/";}, 300 )
                  }
                  else {
                    console.log(result['data'])
                    $('#password-error-message h2').text(result['data'])
                    $('.error-message').fadeIn();
                  }
                },
                error: function() {
                  alert('Server error')
                }
              }) // end ajax
  }); // end submit
}


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


function hide_error_message_when_input_active() {
  $('#network, #password_enter_field').focus( function() {
      $('.error-message').fadeOut();
    })
  $('#network, #password_enter_field').keyup( function() {
      $('.error-message').fadeOut();
    })
  // And when user clicks submit
  $('#choose_network_submit').click( function(evt) {
    $('.error-message').fadeOut();
    })
}

// TODO duplicated in settings.js and add_image.js
function fade_page_in(fade_in_out) {
  if (fade_in_out == 'in') {
    $('.initially-hidden').fadeTo(500, 1)
  }
  else {
    $('.initially-hidden').fadeTo(300, 0)
  }
}

hide_error_message_when_input_active()
get_ready_to_check_network()
make_user_icon_clickable()
get_ready_to_check_password()
fade_page_in('in')