function prepare_LHS_button_fading_behaviour () {
	// Enables click behaviour for buttons on LHS
	// Fades all other buttons when one is clicked
	// Brings up correct content on RHS
			$('#change-name-button').click( function(evt) {

			// Fade other buttons on click, and show relevant content on RHS
			evt.preventDefault();
		    evt.stopImmediatePropagation();

		    // Fade all but current button
		    $('#change-name-button').css('opacity',1)
			$('#change-email-button').css('opacity',0.6)
			$('#change-password-button').css('opacity',0.6)
			$('#change-picture-button').css('opacity',0.6)

			// Fade all RHS content
			$('.rhs-to-disappear').fadeOut(50)

			// Show relevant RHS content
			setTimeout ( function() {
				$('#change-name-rhs').fadeIn(300)
			} , 51 ) 
		});

		$('#change-email-button').click( function(evt) {
			// Fade other buttons on click, and show relevant content on RHS
			evt.preventDefault();
		    evt.stopImmediatePropagation();

		    // Fade all but current button
		    $('#change-name-button').css('opacity',0.6)
			$('#change-email-button').css('opacity',1)
			$('#change-password-button').css('opacity',0.6)
			$('#change-picture-button').css('opacity',0.6)

			// Fade all RHS content
			$('.rhs-to-disappear').fadeOut(50)

			// Show relevant RHS content
			setTimeout ( function() {
				$('#change-email-rhs').fadeIn(300)
			} , 51 ) 
		});

		$('#change-password-button').click( function(evt) {
			// Fade other buttons on click, and show relevant content on RHS
			evt.preventDefault();
		    evt.stopImmediatePropagation();

		    // Fade all but current button
		    $('#change-name-button').css('opacity',0.6)
			$('#change-email-button').css('opacity',0.6)
			$('#change-password-button').css('opacity',1)
			$('#change-picture-button').css('opacity',0.6)

			// Fade all RHS content
			$('.rhs-to-disappear').fadeOut(50)

			// Show relevant RHS content
			setTimeout ( function() {
				$('#change-password-rhs').fadeIn(300)
			} , 51 ) 
		});

		$('#change-picture-button').click( function(evt) {
			// Fade other buttons on click, and show relevant content on RHS
			evt.preventDefault();
		    evt.stopImmediatePropagation();

		    // Fade all but current button
		    $('#change-name-button').css('opacity',0.6)
			$('#change-email-button').css('opacity',0.6)
			$('#change-password-button').css('opacity',0.6)
			$('#change-picture-button').css('opacity',1)

			// Fade all RHS content
			$('.rhs-to-disappear').fadeOut(50)

			// Show relevant RHS content
			setTimeout ( function() {
				$('#change-picture-rhs').fadeIn(300)
			} , 51 ) 
		});
} // end fading behaviour for LHS buttons

$('.icon-pick').click( function(evt) {
	// Update database to use this icon as user's icon
	// Then return to main screen
	evt.preventDefault()
	evt.stopImmediatePropagation()
	animal = $(this).attr('animal');
	$.ajax({
                url:'/_change_profile_picture',
                data: JSON.stringify({
                  "animal":animal
                }, null, '\t'), // end data
                contentType: 'application/json;charset=UTF-8',
                type: "POST",
                success: function(result) { 
                  fade_page_in('out')
				  setTimeout( function() {window.location.href = "/"}, 500)
                }, // end success
                error: function() {
                  alert('Server error')
                }
              }) // end ajax
})

// TODO duplicated in add-image
function fade_page_in(fade_in_out) {
	if (fade_in_out == 'in') {
		$('.initially-hidden').fadeTo(500, 1)
	}
	else {
		$('.initially-hidden').fadeTo(500, 0)
	}
}

prepare_LHS_button_fading_behaviour()
fade_page_in('in')