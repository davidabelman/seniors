function get_submit_buttons_ready() {

  // Page 1/2
  // Accepting given name (or altered name, check against DB) then bring on the 2nd page
  $('#confirm_name').click( function(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    // Check if they changed the name
    if ($('#name_initial').val() == $('#name').val()) {
      // No change, so we can draw screen 2
      console.log("no name change")
      toggle_page_1_and_2(go_to_page=2)
      } // end if
    else {
        // We need to check if the name they have entered is valid on the server
        console.log("name was changed")
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
                      $('#name-taken').fadeIn()
                }
                else {
                      $('#name-taken').fadeOut()
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


get_submit_buttons_ready()
