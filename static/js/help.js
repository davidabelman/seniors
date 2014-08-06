function bind_clicks () {
	$('#back-to-group-button').click( function(evt) {
		// Reload main page
		evt.preventDefault()
		evt.stopImmediatePropagation()
		fade_page_in_out('out','/')
	})
} // end bind_clicks



bind_left_hand_button_clicks()
bind_clicks()
fade_page_in_out('in')