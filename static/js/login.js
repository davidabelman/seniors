function get_ready_to_check_network() {

  $('#choose_network_submit').click( function(evt) {
  		evt.preventDefault();
      evt.stopImmediatePropagation();
  		var network = $('#network').val();
      console.log("Sending network value = ", network)
  		$.getJSON('/_network_users_list',
                {"network":network},
                function(data) {
                  if (data.length>0) {
                    // We will now display the users
                    toggle_page_1_and_2()
                  }
                  else {
                    // No users in network, i.e doesn't exist, display error
                    console.log('display error')
                    $('#network_does_not_exist_message').fadeIn();
                  }
                  html = "<row>"
                  $.each( data, function(i, d) {
                    html += "<div class='col-md-3 col-sm-4 col-xs-6 user-icon-div'>"
                    html+= "  <img src='/static/img/icon.png' class='img-responsive user-icon-img'>"
                    html+= "  <span class='user-icon-span'>"+d.name+"</span>"
                    html+= "</div>"
                  }) //each
                  html += "</row>"
                  $('#user_grid').html(html);
                  make_user_icon_clickable()
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
    $('#password_entry').fadeIn()
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


$('#password_submit').click( function(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    var network = $('#network').val();  // This comes from page 1 of 2
    var username = $('.icon_selected').find('.user-icon-span').text()
    var password = $('#password_enter_field').val()
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
                console.log ('This is the result and type of result:',result,typeof(result))
                if (result=="1") {
                  console.log("REDIRECT")
                  window.location.href = "/";
                }
                else {
                  alert("Password auth failed")
                }
              },
              error: function() {
                alert('Server error')
              }
            }) // end ajax
}); // end submit


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
  $('#network').focus( function() {
      $('#network_does_not_exist_message').fadeOut();
    })
  $('#network').keyup( function() {
      $('#network_does_not_exist_message').fadeOut();
    })
  // And when user clicks submit
  $('#choose_network_submit').click( function(evt) {
    $('#network_does_not_exist_message').fadeOut();
    })
}

hide_error_message_when_input_active()
get_ready_to_check_network()
make_user_icon_clickable()