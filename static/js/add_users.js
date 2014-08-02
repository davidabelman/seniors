function check_network_exists() {
  // ...

    var network_input = $('#network').val()
    $.getJSON('/_network_exists',
              { 
                "network" : network_input
              },
              function(response) {
                if (response=='1') {
                  alert('Network name already exists') // Could give user a link to *join* the network (would need to send verification to group admin though)
                }
                else {
                  console.log ('Network name OK')
                }
                }) // end JSON
} // end check_network_exists


function redraw_screen() {
  // This will show the admin that a user has successfully been added, and redraw the screen as a blank form to add another
  window.location.href = "/add_users";
}

function get_ajax_handlers_ready() {

  // This will add a user by email (either admin or not) when the user submits an email address
  $('#email_invite').submit( function(evt) {
    evt.preventDefault();
    console.log('clicked');

    // Admin variable
    var admin = 0;
    if ($('#admin').is(':checked')) { admin = 1}

    $.ajax( {
      url: '/_add_user_via_access_token',
      data: JSON.stringify ({
        'email':$('#email').val(),
        'firstname':$('#firstname').val(),
        'admin':admin
      }, null, '\t'),
      contentType: 'application/json;charset=UTF-8',
      type: "POST",
      success: function(response) {
        if (response=='1') {
          console.log('Added user successfully, will send them an email')
          redraw_screen()
        }
      },
      fail: function() {
        alert("Server error?")
      } // end success callback
    }); // end ajax
  }) // end submit

}

get_ajax_handlers_ready()