function activate_webcam_script() {

	// Code from http://stackoverflow.com/questions/23288918/check-user-has-webcam-or-not-using-javascript
	navigator.getMedia = ( navigator.getUserMedia || // use the proper vendor prefix
	                       navigator.webkitGetUserMedia ||
	                       navigator.mozGetUserMedia ||
	                       navigator.msGetUserMedia);

	navigator.getMedia({video: true}, function() {
	  // webcam is available: draw canvas, buttons etc. and remove message
	  $('#webcam-required-message').fadeOut(200, function() {
	  	$('#webcam-available').fadeIn()
	  })
	  
	}, function() {
	  // webcam is not available
	  $('#webcam-required-message').fadeOut(200, function() {
	  	$('#webcam-denied-message').fadeIn()
	  })

	});

	// Code from: view-source:http://davidwalsh.name/demo/camera.php
	// Put event listeners into place
		// Grab elements, create settings, etc.
		var canvas = document.getElementById("webcam-canvas"),
			context = canvas.getContext("2d"),
			video = document.getElementById("webcam-video"),
			videoObj = { "video": true },
			errBack = function(error) {
				console.log("Video capture error: ", error.code); 
			};

		// Put video listeners into place
		if(navigator.getUserMedia) { // Standard
			navigator.getUserMedia(videoObj, function(stream) {
				video.src = stream;
				video.play();
			}, errBack);
		} else if(navigator.webkitGetUserMedia) { // WebKit-prefixed
			navigator.webkitGetUserMedia(videoObj, function(stream){
				video.src = window.webkitURL.createObjectURL(stream);
				video.play();
			}, errBack);
		} else if(navigator.mozGetUserMedia) { // WebKit-prefixed
			navigator.mozGetUserMedia(videoObj, function(stream){
				video.src = window.URL.createObjectURL(stream);
				video.play();
			}, errBack);
		}

		// Trigger photo take
		$("#webcam-take-photo-button").click( function(evt) {
			evt.preventDefault();
			evt.stopImmediatePropagation();
			// Create image
			context.drawImage(video, 0, 0, 320, 250);
			$('#webcam-video').fadeOut('fast',  function() {
				$('#webcam-canvas').fadeIn('fast')
			})
			// Edit buttons to allow user to save or retake
			$('#webcam-take-photo-button').fadeOut('fast', function() {
				$('#webcam-take-another-button, #webcam-use-photo-button').fadeIn('fast')
			})
		}); // end take photo process

		// When user wants to take another photo instead
		$("#webcam-take-another-button").click (function(evt) {
			evt.preventDefault();
			evt.stopImmediatePropagation();

			// Fade out canvas and fade in video
			$('#webcam-canvas').hide()
			$('#webcam-video').show()
			
			// Edit buttons to allow user to take another
			$('#webcam-take-another-button, #webcam-use-photo-button').hide()
			$('#webcam-take-photo-button').show()
			
		})

		// When user wishes to save photo
		$('#webcam-use-photo-button').click( function(evt) {
			evt.preventDefault();
			evt.stopImmediatePropagation();

			$('#webcam-canvas, #webcam-take-another-button, #webcam-use-photo-button').hide()
			$('#loading-spinner').html("<img src='http://cdnjs.cloudflare.com/ajax/libs/file-uploader/3.7.0/processing.gif'>").show()
			
			// Convert to BASE 64 and then call function to send to server
			var image = new Image();
			image.src = canvas.toDataURL("image/png");
			save_image_to_cloud(image.src)

		})
};

// Sends image data to Flask, where we convert to PNG, save to Dropbox
function save_image_to_cloud(base) {
	// Post data to server
	console.log('posting data to server')
		$.ajax({
                url:'/_upload_img_to_dropbox',
                data: JSON.stringify({
                  "base":base
                }, null, '\t'), // end data
                contentType: 'application/json;charset=UTF-8',
                type: "POST",
                success: function(url) { 
                  console.log ('This is the url',url);
                  img_link = "<p class='post-body'><img src="+url+"></p>";
				  create_post_from_html(img_link);
				  // When complete
        			setTimeout( function() {window.location.href = "/"}, 100)
                }, // end success
                error: function() {
                  alert('Server error')
                }
              }) // end ajax

		// On callback, refresh
}

