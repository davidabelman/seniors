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
				// Focus on search box
	    		$('#img-input').focus()
	    		// Return = submit
				$("#img-input").keyup(function(event){
				    if(event.keyCode == 13){ $("#bing-search-submit").click();  }
				});
			} , 51 ) 
		});

		$('#webcam-button').click( function(evt) {
			// Fade other buttons on click, and show relevant content on RHS
			evt.preventDefault();
		    evt.stopImmediatePropagation();

		    // When button is clicked, load webcam script stuff
		    if (window.webcamActivated == 0) {
		    	window.webcamActivated = 1;
		    	activate_webcam_script()
		    }

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

		$('#back-to-group-button').click( function(evt) {
			// Reload main page
			evt.preventDefault()
			evt.stopImmediatePropagation()
			fade_page_in('out')
			setTimeout( function() {window.location.href = "/"}, 500)
		})
} // end fading behaviour for LHS buttons


function prepare_to_get_content_from_bing() {
	// Binds event to a submit button which will pull images and draw to screen when clicked
	$('#bing-search-submit').click ( function(evt) {
		evt.preventDefault();
      	evt.stopImmediatePropagation();
      	var query = $('#img-input').val()

      	// Make call to server
      	$.ajax({
              url:'/_get_bing_image_urls',
              data: JSON.stringify({
                "query":query,
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
		html += "<a><img src='"+url+"' class='img-in-img-grid'></a>"
		html += "</div>"
	}) // end each
	html += "</row><div class='filler'></div>" // Adding on a filler element to bottom
	$('#bing-img-grid').html(html)
	setTimeout (function() {
		$('#bing-page2of2').fadeIn()
		click_image_to_post()
		}, 500)
}

function click_image_to_post() {
$('.img-in-img-grid').click( function(evt) {
		evt.preventDefault();
		evt.stopImmediatePropagation();
		url = $(this).attr("src")
		img_link = "<p class='post-body'><img src="+url+" width='40%'></p>"
		create_post_from_html(img_link)
	})
}

// TODO currently duplicated in post.js and add_image.js
function create_post_from_html(html) {
	console.log('about to submit post')
	$.ajax({

                url:'/_submit_post_entry',
                data: JSON.stringify({
                  "content":html
                }, null, '\t'), // end data
                contentType: 'application/json;charset=UTF-8',
                type: "POST",
                success: function(result) { 
                  console.log ('This is the result and type of result:',result,typeof(result))
                  // get_posts(full_refresh=true, 10,0)
                  // remove_text_from_input();
                  // When complete
				  fade_page_in('out')
				  setTimeout( function() {window.location.href = "/"}, 200)
                }, // end success
                error: function() {
                  alert('Server error')
                }

              }) // end ajax
}

function show_and_hide_submit_button() {
	$('#bing-search-submit').hide();
	$('#img-input').keyup( function(evt) {
		evt.preventDefault()
		evt.stopImmediatePropagation()
		console.log('asda')
		if ($('#img-input').val().length >= 1 ) {
				$('#bing-search-submit').show();
				prepare_to_get_content_from_bing()
		}
		else if ($('#img-input').val().length == 0 ) {
			$('#bing-search-submit').hide()
		}
	})
}


// TODO duplicated in settings.js
function fade_page_in(fade_in_out) {
	if (fade_in_out == 'in') {
		$('.initially-hidden').fadeTo(500, 1)
	}
	else {
		$('.initially-hidden').fadeTo(300, 0)
	}
}

window.webcamActivated = 0 // Later switched to 1 if activated
fade_page_in('in')
prepare_LHS_button_fading_behaviour()

show_and_hide_submit_button()

