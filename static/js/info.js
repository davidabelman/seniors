function left_panel_to_page_height_on_load() {
	$('#home-left').css({'height':(($(window).height()))+'px'});
}

function bind_clicks() {
	$('#new-group-button').click( function(evt) {
		evt.preventDefault();
		evt.stopImmediatePropagation();
		fade_page_in_out('out', '/signup')
	})
	$('#join-group-button').click( function(evt) {
		evt.preventDefault();
		evt.stopImmediatePropagation();
		fade_page_in_out('out', '/enter')
	})	
	$('#about-button').click( function(evt) {
		evt.preventDefault();
		evt.stopImmediatePropagation();
		fade_page_in_out('out', '/about')
	})
	
}

mixpanel.track('Homepage loaded')
left_panel_to_page_height_on_load()
quick_fade()  // fades each element in in term (see common.js)
bind_clicks()
