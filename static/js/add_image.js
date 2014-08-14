function prepare_img_buttons () {
	// General click behavour for LHS buttons already taken care of through bind_left_hand_button_clicks()
	// This just adds a little extra functionality
	// No prevent default, as this would override the bind_left_hand_button_clicks() functionality
		$('#bing-button').click( function(evt) {
			setTimeout ( function() {
				// Focus on search box
	    		$('#img-input').focus()
	    		// Return = submit
				$("#img-input").keyup(function(event){
				    if(event.keyCode == 13){ $("#bing-search-submit").click();  }
				});
			} , 200 ) 
			toggle_page_1_and_2(go_to_page=1)
		});

		$('#webcam-button').click( function(evt) {
		    // mixpanel.track('Webcam panel load attempt');
		    // When button is clicked, load webcam script stuff
		    if (window.webcamActivated == 0) {
		    	window.webcamActivated = 1;
		    	 activate_webcam_script()
		    }
		});

		// When image modal closes
		$('#image-modal').on('hidden.bs.modal', function () {
			// Webcam
  			$('#post-photo-submit').hide();
  			$('#post-photo-take').hide();
			$('#pre-photo-take').show();  // Get ready for next time

			// Bing
			toggle_page_1_and_2(go_to_page=1)
		})

} // end fading behaviour for LHS buttons


function prepare_to_get_content_from_bing() {
	// Binds event to a submit button which will pull images and draw to screen when clicked
	$('#bing-search-submit').click ( function(evt) {
		evt.preventDefault();
      	evt.stopImmediatePropagation();
      	var query = $('#img-input').val();
      	mixpanel.track('Bing search submit', {'Query':query});

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
		c(url)
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
		
		mixpanel.track('Posted image', {'Method':'Search'});
		mixpanel.people.increment('Image posts', 1);
		
		url = $(this).attr("src")
		img_link = "<p class='post-body'><img src="+url+" width='50%'></p>"
		create_post_from_html(img_link)
	})
}


function prepare_to_upload_photo() {
	$('#upload_link').click( function() {
		$('#upload_link').text("Please wait (this takes a few seconds)...")
		$('#spinning_icon').fadeTo(400, 1);
	})

	$('#file_upload').uploadify({
			'hideButton': false,
			'height':30,
    		'wmode'     : 'transparent',
	        'uploader': '/static/uploadify/uploadify.swf',
	        'script': '/upload_real_img_to_dropbox_and_create_post',
	        'cancelImg': '',
	        'auto': false,
	        'multi': false,
	        'fileExt'     : '*.jpg;*.gif;*.png;*.jpeg',
	        'fileDesc'    : 'Image Files',
	        'fileSizeLimit' : '300KB',
		    'queueSizeLimit': 10,
	        'removeCompleted': false, // Could set to true, then list completed uploads onComplete
		    'onSelect': function(event, ID, fileObj) {
	            
		    	$('#upload-h2-1of2').fadeOut(500, function() {
		    		$('#upload-h2-2of2').fadeIn(500);
		    	})

	            $('#file-upload-wrapper').fadeTo(500,0)
	            setTimeout( function () {
	            	$('#upload_link').fadeTo(400, 1);
	            }, 501);

	            
	        },
		    'onAllComplete': function(event, data) {
		    	mixpanel.track('Posted image', {'Method':'Upload'});
				mixpanel.people.increment('Image posts', 1);
				setTimeout( function() { 
	            	// Reload the page here as can't get interface to reset properly
	            	fade_page_in_out('out', '/')
	        	}, 100)
	            
	        }
	      });
}
prepare_to_upload_photo()

// TODO currently duplicated in post.js and add_image.js
function create_post_from_html(html) {
	$.ajax({

                url:'/_submit_post_entry',
                data: JSON.stringify({
                  "content":html
                }, null, '\t'), // end data
                contentType: 'application/json;charset=UTF-8',
                type: "POST",
                success: function(result) { 
                  c (['Submitted post:', result])
                  // When complete
				  setTimeout( function() {
				  	$('#image-modal').modal('hide');
				  	get_posts(which_posts='new', limit=number_of_new_posts+1, skip=0, skip_to_date=null)  // add 1 since his/her own post is included
				  }, 200)
                }, // end success
                error: function() {
                  alert('Server error')
                }

              }) // end ajax
}

function show_and_hide_bing_submit_button() {
	$('#bing-search-submit').hide();
	$('#img-input').keyup( function(evt) {
		evt.preventDefault()
		evt.stopImmediatePropagation()
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

function browser_compatibility_checks() {
	var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
	var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
	var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
	    // At least Safari 3+: "[object HTMLElementConstructor]"
	var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
	var isIE = /*@cc_on!@*/false || !!document.documentMode; // At least IE6

	if (isChrome) {
		$('.chrome').show()
		c('Browser is chrome')
	}

	else if (isFirefox) {
		$('.mozilla').show()
		c('Browser is mozilla')
	}
	
	else {
		$('.not_chrome_mozilla').show()
		c('Browser not mozilla or chrome')
	}
}



browser_compatibility_checks() // Displays correct message before webcam is activated
window.webcamActivated = 0 // Later switched to 1 if activated
fade_page_in('in')
prepare_img_buttons()
bind_left_hand_button_clicks()
show_and_hide_bing_submit_button()

