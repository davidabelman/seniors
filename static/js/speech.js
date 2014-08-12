function speech_app() {
	$('#stop-listening-button').fadeTo(1, 0.4);
	first_intermediate = true; // Can add 'listening' on to end of text again now
	listening_string = ' (...listening...)'

	if (!('webkitSpeechRecognition' in window)) {
		$('#speech-bad-browser').show()

	} else {
		$('#speech-permission-needed').show()

		// Get microphone permission
		navigator.webkitGetUserMedia ( {audio: true},   // 3 arguments, fn1 = granted, fn2 = denied
		
			// If they have given permission
			function(){ 
				$('#speech-permission-needed').hide()
				$('#speech-permission-granted').show()
				$('#speech-input').focus()
				
				recognition = new webkitSpeechRecognition();
				recognition.lang = 'en-GB'
				recognition.continuous = true;
				recognition.interimResults = true;
				recognition.maxAlternatives = 1;

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
					    $('#speech-input').val((current_text + " " + transcript).replace(/ +(?= )/g,''));
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
				recognition.onerror = function(event) { stop_listening() }
				//recognition.onend = function() { alert('end') }
			 
			 }, // end permission granted

			// If they denied us permission
			function(){
				$('#speech-permission-needed').hide()
				$('#speech-permission-denied').show()
			} // end denied permission

	);} // end permission needed

} // end speech app

function prepare_start_stop_speech_buttons () {
	$('#start-listening-button').click ( function(evt) {
		evt.preventDefault();
		evt.stopImmediatePropagation();
		start_listening();
	})

	$('#stop-listening-button').click ( function(evt) {
		evt.preventDefault();
		evt.stopImmediatePropagation();
		stop_listening();
	})
}

function stop_listening() {
	recognition.stop();
	$('#start-listening-button').fadeTo(100,1);
	$('#stop-listening-button').fadeTo(100,0.4);
	var current_text = $('#speech-input').val().replace(listening_string, "");
	$('#speech-input').val((current_text + " ").replace(/ +(?= )/g,''));
	$('#speech-intro-text-div').fadeTo(300, 0, function() {
		$('#speech-intro-text-speaking').hide()
		$('#speech-intro-text-subsequent').show()
		$('#speech-intro-text-div').fadeTo(300, 1)
	})
}

function start_listening() {
	recognition.start();
	$('#start-listening-button').fadeTo(100,0.4);
	$('#stop-listening-button').fadeTo(100,1);
	$('#speech-intro-text-div').fadeTo(300, 0, function() {
		$('#speech-intro-text-first, #speech-intro-text-subsequent').hide()
		$('#speech-intro-text-speaking').show()
		$('#speech-intro-text-div').fadeTo(300, 1)
	})
}

