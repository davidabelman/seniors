$('#choose_network').submit( function(evt) {
		evt.preventDefault();
		var network = $('#network').val();
    console.log("Sending network value = ", network)
		$.getJSON('/_network_users_list',
              {"network":network},
              function(data) {
                html = "<ul>"
                $.each( data, function(i, d) {
                  html+="<li class='user_logo'>"
                  html+=d.name
                  html+="</li>"
                }) //each
                html += "</ul>"
                $('#user_grid').html(html);
                make_user_logo_clickable()
              })
}); // end submit

var make_user_logo_clickable = function() {
  $('.user_logo').click( function() {
    $('.user_logo').removeClass( "logo_selected" )
    $(this).addClass( "logo_selected" )
    $('#password_entry').show()
  }); // end click
}

$('#password_entry').submit( function(evt) {
    evt.preventDefault();
    var network = $('#network').val();
    var username = $('.logo_selected').text()
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