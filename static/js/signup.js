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


$('#tester').click( function() {check_network_exists()})

function get_ajax_handlers_ready() {

  // Firstly checking network doesn't exist after typing it in
  $('#network').blur( function() {
    check_network_exists()
  }) // end blur callback

  // Submitting all form data when done
  $('#signup_form').submit( function(evt) {
      evt.preventDefault();
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

get_ajax_handlers_ready()