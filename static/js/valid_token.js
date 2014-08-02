// Submitting all form data when done
$('#signup_form').submit( function(evt) {
  evt.preventDefault();
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
              window.location.href = "/";
            }, // end success
            error: function() {
              alert('Server error')
            } // end error
          }) // end ajax
}); // end submit_click
