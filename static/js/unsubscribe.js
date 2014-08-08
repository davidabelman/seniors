

$('#feedback-submit').click( function(evt) {
	evt.preventDefault();
	evt.stopImmediatePropagation();
	var message = $('#feedback-input').val();
	var user_id = $('#user_id-input-hidden').val();

	// Check there is some feedback before sending
	if (message.length<2) {
		return
	}
	// Change the button text
	$('#feedback-submit').text('Sending...')

	// Send to server (sends an email)
	$.ajax({
                url:'/_send_feedback',
                data: JSON.stringify({
                  "message":message,
                  "user_id":user_id,
                  "subject":'Unsubscribe'
                }, null, '\t'), // end data
                contentType: 'application/json;charset=UTF-8',
                type: "POST",
                success: function(response) { 
                	$('#feedback-submit').text('Sent! Thank you.')
                } // end success function
            }); // end ajax
})