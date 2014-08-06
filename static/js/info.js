function left_panel_to_page_height_on_load() {
	$('#home-left').css({'height':(($(window).height()))+'px'});
}

function get_buttons_ready() {
	$('#new-group-button').click( function(evt) {
		evt.preventDefault();
		evt.stopImmediatePropagation();
		$('.whole-body').fadeOut('fast', 
		function() {
			window.location.href = "/signup"
		})	
	})
	$('#join-group-button').click( function(evt) {
		evt.preventDefault();
		evt.stopImmediatePropagation();
		$('.whole-body').fadeOut('fast', 
		function() {
			window.location.href = "/enter"
		})	
	})	
	
}

left_panel_to_page_height_on_load()
get_buttons_ready()