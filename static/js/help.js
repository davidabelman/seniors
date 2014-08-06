function prepare_LHS_button_fading_behaviour () {
	// Enables click behaviour for buttons on LHS
	// Fades all other buttons when one is clicked
	// Brings up correct content on RHS
			$('.lhs-button').click( function(evt) {

			// Fade other buttons on click, and show relevant content on RHS
			evt.preventDefault();
		    evt.stopImmediatePropagation();
		    
		    // Fade all but current button
		    $('.lhs-button').css('opacity',0.6)
		    $(this).css('opacity',1)
			
			// Fade all RHS content and make sure page 1 of 2 is showing
			$('.rhs-to-disappear').fadeOut(50)

			// Show relevant RHS content
			var id_to_show = $(this).attr('id').replace('-button','')
			setTimeout ( function() {
				$('#'+id_to_show).fadeIn(300)
			} , 51 ) 
		});

		$('#back-to-group-button').click( function(evt) {
			// Reload main page
			evt.preventDefault()
			evt.stopImmediatePropagation()
			fade_page_in('out')
			setTimeout( function() {window.location.href = "/"}, 500)
		})
} // end fading behaviour for LHS buttons

// TODO duplicated in add-image
function fade_page_in(fade_in_out) {
	if (fade_in_out == 'in') {
		$('.initially-hidden').fadeTo(500, 1)
	}
	else {
		$('.initially-hidden').fadeTo(300, 0)
	}
}

prepare_LHS_button_fading_behaviour()
fade_page_in('in')