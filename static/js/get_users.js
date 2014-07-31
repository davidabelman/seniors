$('form').submit( function(evt) {
		evt.preventDefault();
		var network = $('#network').val();
    console.log("Sending network value = ", network)
		$.getJSON('/_network_users_list',
              {"network":network},
              function(data) {
                console.log(data)
              })
}); // end submit
