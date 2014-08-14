function get_buttons_ready() {
	// On navigation, change page content
	$('.navigation').click( function(evt) {
		evt.preventDefault();
		evt.stopImmediatePropagation();
		var target = $(this).attr('href');
		$('.page1of4, .page2of4, .page3of4, .page4of4').fadeOut(200)
		setTimeout( function() {
			$('.page'+target+'of4').fadeIn(200)
		}, 201);
		
		// Change menu selected
		$('.circle').addClass('greyed')
		$('.circle[href$="'+target+'"]').removeClass('greyed')
	})

	// On navigation, change page content
	$('.back-to-group-button').click (function(evt) {
		evt.preventDefault();
		evt.stopImmediatePropagation();
		fade_page_in_out('out', '/')
	});
}

get_buttons_ready()
quick_fade()  // fades each element in in term (see common.js)