// Start up speech app, check for browser compatiability
// Ask for permission
// Once given, start a new speechrecognition object, and then listen for 'results'
// On results update the form
function speech_app() {
	first_intermediate = true; // Can add 'listening' on to end of text again now
	listening_string = ' (...listening...)'

	if (!('webkitSpeechRecognition' in window)) {
		$('#speech-bad-browser').show()
		mixpanel.track('Dictate dialog bad browser') // event

	} else {
		$('#speech-permission-needed').show()

		// Get microphone permission
		navigator.webkitGetUserMedia ( {audio: true},   // 3 arguments, fn1 = granted, fn2 = denied
		
			// If they have given permission
			function(){ 
				mixpanel.track('Dictate dialog permission granted') // event
				$('#speech-permission-needed').hide();
				$('#speech-permission-granted').show();
				$('#speech-input').focus();

				recognition = new webkitSpeechRecognition();
				recognition.lang = 'en-GB'
				recognition.continuous = true;
				recognition.interimResults = true;
				recognition.maxAlternatives = 1;
				start_listening();

				//recognition.onstart = function() {  }
				recognition.onresult = function(event) { 

				    if (typeof(event.results) == 'undefined') {
				      // appears we don't have browser support
				      recognition.onend = null;
				      recognition.stop();
				      $('#speech-permission-granted').hide()
				      $('#speech-bad-browser').show()
				      return;
				    }
				    if (event.results[event.resultIndex].isFinal) {
				    	var transcript = event.results[event.resultIndex][0].transcript;
				    	console.log(transcript)
					    var current_text = $('#speech-input').val().replace(listening_string, " ");
					    //final_transcript = (current_text + " " + transcript).replace(/ +(?= )/g,'')
					    final_transcript = current_text + transcript
					    final_transcript = clean_text(final_transcript)
					    $('#speech-input').val(final_transcript);
					    $('#speech-input').css({'background-color':'#fff'});
					    focus_at_end_of_input_form('#speech-input')
					    first_intermediate = true; // Can add 'listening' on to end of text again now
				    }
				    else {
				    	// We are getting intermediate results
				    	console.log( event.results[event.resultIndex][0].transcript )
				    	console.log(first_intermediate)
				    	var current_text = $('#speech-input').val()
				    	if (first_intermediate) {
				    		$('#speech-input').val(current_text + listening_string)
				    		first_intermediate = false; // Do not add 'listening' again
				    	}
				    	$('#speech-input').css({'background-color':'#fdd'});
				    }
				    
				 }
				recognition.onerror = function(event) { 
					show_speech_error_and_start_button()
					 }
			 
			 }, // end permission granted

			// If they denied us permission
			function(){
				mixpanel.track('Dictate dialog permission denied') // event
				$('#speech-permission-needed').hide()
				$('#speech-permission-denied').show()
				
			} // end denied permission

	);} // end permission needed

} // end speech app

// Get speech - dialog related buttons ready
function prepare_speech_buttons () {
	$('#speech-start-listening-button').click ( function(evt) {
		evt.preventDefault();
		evt.stopImmediatePropagation();
		start_listening();
	})

	// When user posts, stop listening, send post to DB, get new posts
	$('#speech-post-button').click (function(evt) {
		evt.preventDefault();
		evt.stopImmediatePropagation();
		stop_listening();
		message = $('#speech-input').val();
		create_post_from_html(message);
		$('#speech-modal').modal('hide');
		
		// Mixpanel
	    mixpanel.track('Posted speech', {'Length (chars)':message.length}) // event
	    mixpanel.people.increment('Text posts (speech)', 1); // people

	    setTimeout( function() {
	        get_posts(which_posts='new', limit=number_of_new_posts+1, skip=0, skip_to_date=null)  // add 1 since his/her own post is included
	      }, 500) // Adding a delay to avoid two very close requests to server
	    remove_text_from_speech_input();
	})

	// When the dialog box is closed
	$('#speech-modal').on('hidden.bs.modal', function () {
  		stop_listening();
	})

	// When testing error functionality (button hidden in HTML)
	$('#speech-test-error-button').click ( function(evt) {
		evt.preventDefault();
		evt.stopImmediatePropagation();
		recognition.stop()
		show_speech_error_and_start_button();
	})
}

// Cleans output and stops listening
function stop_listening() {
	recognition.stop();
	var current_text = $('#speech-input').val().replace(listening_string, "");
	$('#speech-input').val(clean_text(current_text))
}

// Shows 'dictate' instruction headline and starts recognition
function start_listening() {
	recognition.start();
	c("Called 'start listening'")
	$('#speech-intro-text-error').hide()
	$('#speech-intro-text-speaking').show()
}

// When there is an error, shows button to start recognition again
function show_speech_error_and_start_button() {
	$('#speech-intro-text-div').fadeTo(300, 0, function() {
		$('#speech-intro-text-speaking').hide()
		$('#speech-intro-text-error').show()
		$('#speech-intro-text-div').fadeTo(300, 1)
	})
}

// Clears input box
function remove_text_from_speech_input() {
  	$('#speech-input').val('')
}

// Cleans text
var first_char = /\S/;
function clean_text(s) {
  s = s.replace(first_char, function(m) { return m.toUpperCase(); });  // caps where appropriate
  s = s.replace(/ +(?= )/g,'')  // remove extra spaces
  return s
}

