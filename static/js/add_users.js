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

  // This will just add the user to the database, can then show them how to log on at ..com/enter/networkname
  $('#add_user_on_behalf').submit( function(evt) {
    evt.preventDefault();
    console.log('clicked');

    $.ajax( {
      url: '/_add_user_on_behalf',
      data: JSON.stringify ({
        'name':$('#initial_name').val(),
        'password':$('#password').val(),
      }, null, '\t'), // end data
      contentType: 'application/json;charset=UTF-8',
      type: "POST",
      success: function(response) {
        if (response=='1') {
          console.log('Added user successfully to database')
          network = $('#network_hidden').val()
          alert('Show this user how to log in at http://www.thiswebsite.com/enter/'+network);
          redraw_screen()
          } // end if
        else {
          alert (response)
        }
      } // end success callback
    }) // end ajax

  }) // end submit
}

get_ajax_handlers_ready()