function activate_webcam_script() {

	// Code from: view-source:http://davidwalsh.name/demo/camera.php
	// Put event listeners into place
		// Grab elements, create settings, etc.
		
		// Load webcam canvas straight away
		// $('#webcam-required-message').fadeOut(200, function() {
		//   	$('#webcam-available').fadeIn()
		//   })
		

		var canvas = document.getElementById("webcam-canvas"),
			context = canvas.getContext("2d"),
			video = document.getElementById("webcam-video"),
			videoObj = { "video": true },
			showWebcam = function() {
				$('.webcam-pre-permission').hide()
	  			$('#webcam-permission-granted').show()
			},
			errBack = function(error) {
				c(["Video capture error: ", error.code])
				$('.webcam-pre-permission').hide()
				$('.webcam-permission-granted').hide()
				$('.webcam-permission-denied').show()
			};

		// Put video listeners into place
		if(navigator.getUserMedia) { // Standard
			navigator.getUserMedia(videoObj, function(stream) {
				video.src = stream;
				video.play();
				showWebcam()
			}, errBack);
		} else if(navigator.webkitGetUserMedia) { // WebKit-prefixed
			navigator.webkitGetUserMedia(videoObj, function(stream){
				video.src = window.webkitURL.createObjectURL(stream);
				video.play();
				showWebcam()
			}, errBack);
		} else if(navigator.mozGetUserMedia) { // WebKit-prefixed
			navigator.mozGetUserMedia(videoObj, function(stream){
				video.src = window.URL.createObjectURL(stream);
				video.play();
				showWebcam()
			}, errBack);
		}

		// Trigger photo take
		$("#webcam-take-photo-button").click( function(evt) {
			evt.preventDefault();
			evt.stopImmediatePropagation();
			mixpanel.track('Webcam take photo');
			// Create image
			context.drawImage(video, 0, 0, 400, 300);
			// Fade in new buttons, etc
			$('#pre-photo-take').fadeOut('fast',  function() {
				$('#post-photo-take').show()
				console.log('SHOWN')
			})
		}); // end take photo process

		// When user wants to take another photo instead
		$("#webcam-take-another-button").click (function(evt) {
			evt.preventDefault();
			evt.stopImmediatePropagation();
			mixpanel.track('Webcam try another photo');

			// Fade out canvas and fade in video
			$('#post-photo-take').fadeOut('fast',  function() {
				$('#pre-photo-take').fadeIn('fast')
			})
			
		})

		// When user wishes to save photo
		$('#webcam-use-photo-button').click( function(evt) {
			evt.preventDefault();
			evt.stopImmediatePropagation();
			
			mixpanel.track('Posted image', {'Method':'Webcam'});
			mixpanel.people.increment('Image posts', 1);

			$('#post-photo-take').hide()
			$('#post-photo-submit').show()
			
			// Convert to BASE 64 and then call function to send to server
			var image = new Image();
			image.src = canvas.toDataURL("image/jpeg");
			save_image_to_cloud(image.src)

		})
};

// Sends image data to Flask, where we convert to PNG, save to Dropbox
function save_image_to_cloud(base) {
	// Post data to server
	c('Posting data to server...')
		$.ajax({
                url:'/_upload_base_img_to_dropbox',
                data: JSON.stringify({
                  "base":base
                }, null, '\t'), // end data
                contentType: 'application/json;charset=UTF-8',
                type: "POST",
                success: function(url) { 
                  c(['This is the url',url]);
                  img_link = "<p class='post-body'><img src="+url+"></p>";
				  create_post_from_html(img_link);
				  // When complete
				  setTimeout( function() {				  	
				  	$('#image-modal').modal('hide', function() {
				  		$('#post-photo-submit').hide();
				  		$('#pre-photo-take').show();  // Get ready for next time
				  	});
				  	get_posts(which_posts='new', limit=number_of_new_posts+1, skip=0, skip_to_date=null)  // add 1 since his/her own post is included
				  }, 500)
        			
                }, // end success
                error: function() {
                  c('Server error')
                }
              }) // end ajax

		// On callback, refresh
}

