

$('#feedback-submit').click( function(evt) {
	evt.preventDefault();
	evt.stopImmediatePropagation();
	var message = $('#feedback-input').val();
	var user_id = $('#user_id_hidden').val();

	// Check there is some feedback before sending
	if (message.length<=2) {
		$('#feedback-submit').text('Please type a longer message.')
		return
	}
	// Change the button text
	$('#feedback-submit').text('Sending...')

	// Mixpanel track
	mixpanel.track('Feedback', {'Message':message})

	// Send to server (sends an email)
	$.ajax({
                url:'/_send_feedback',
                data: JSON.stringify({
                  "message":message,
                  "user_id":user_id,
                  "subject":'General feedback'
                }, null, '\t'), // end data
                contentType: 'application/json;charset=UTF-8',
                type: "POST",
                success: function(response) { 
                	setTimeout( function() {
                		$('#feedback-submit').hide()
                		$('#back-to-group-button').show()
                		 , 200 }) // end timeout
                } // end success function
            }); // end ajax
})

