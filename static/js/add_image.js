function prepare_LHS_button_fading_behaviour () {
	// Enables click behaviour for buttons on LHS
	// Fades all other buttons when one is clicked
	// Brings up correct content on RHS
			$('#bing-button').click( function(evt) {
			// Fade other buttons on click, and show relevant content on RHS
			evt.preventDefault();
		    evt.stopImmediatePropagation();

		    // Fade all but current button
		    $('#bing-button').css('opacity',1)
			$('#webcam-button').css('opacity',0.6)
			$('#upload-button').css('opacity',0.6)
			$('#cancel-button').css('opacity',0.6)

			// Fade all RHS content
			$('.rhs-to-disappear').fadeOut(50)

			// Show relevant RHS content
			setTimeout ( function() {
				$('#bing-rhs').fadeIn(300)
			} , 51 ) 
		});

		$('#webcam-button').click( function(evt) {
			// Fade other buttons on click, and show relevant content on RHS
			evt.preventDefault();
		    evt.stopImmediatePropagation();

		    // Fade all but current button
		    $('#bing-button').css('opacity',0.6)
			$('#webcam-button').css('opacity',1)
			$('#upload-button').css('opacity',0.6)
			$('#cancel-button').css('opacity',0.6)

			// Fade all RHS content
			$('.rhs-to-disappear').fadeOut(50)

			// Show relevant RHS content
			setTimeout ( function() {
				$('#webcam-rhs').fadeIn(300)
			} , 51 ) 
		});

		$('#upload-button').click( function(evt) {
			// Fade other buttons on click, and show relevant content on RHS
			evt.preventDefault();
		    evt.stopImmediatePropagation();

		    // Fade all but current button
		    $('#bing-button').css('opacity',0.6)
			$('#webcam-button').css('opacity',0.6)
			$('#upload-button').css('opacity',1)
			$('#cancel-button').css('opacity',0.6)

			// Fade all RHS content
			$('.rhs-to-disappear').fadeOut(50)

			// Show relevant RHS content
			setTimeout ( function() {
				$('#upload-rhs').fadeIn(300)
			} , 51 ) 
		});
} // end fading behaviour for LHS buttons


function prepare_to_get_content_from_bing() {
	// Binds event to a submit button which will pull images and draw to screen when clicked
	$('#bing-search-submit').click ( function(evt) {
		evt.preventDefault();
      	evt.stopImmediatePropagation();

      	// Make call to server
      	$.ajax({
              url:'/_get_bing_image_urls',
              data: JSON.stringify({
                "query":$('#img-input').val(),
                "funny":0,
                "cartoon":0,
                "animated":0,
                "max_results":9
              }, null, '\t'),
              contentType: 'application/json;charset=UTF-8',
              type: "POST",
              success: function(result) { 
              	  result = JSON.parse(result);
              	  if (result['status']==1) {
              	  	// Fade out the original Bing content
                  	$('#bing-page1of2').fadeOut()
                  	// Draw new content
                  	urls = result['data']
                  	draw_images(urls)
                  }
                  else {
                  	alert(result['status'])
                  }
                },
              error: function() {
                alert('Server error')
              }
            }) // end ajax
	})
}

function draw_images() {
	// Loops through URL list to draw to screen
	html = "<row>"
	$.each( urls, function(index, url) {
		console.log(url)
		html += "<div class='div-in-img-grid'>"
		html += "<img src='"+url+"' class='img-in-img-grid'>"
		html += "</div>"
	}) // end each
	html += "</row><div class='filler'></div>" // Adding on a filler element to bottom
	$('#bing-img-grid').html(html)
	setTimeout (function() {
		$('#bing-page2of2').fadeIn()
		}, 500)
}

prepare_LHS_button_fading_behaviour()
prepare_to_get_content_from_bing()


