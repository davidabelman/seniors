var debug = false;

function c(stuff) {
  // Logs to console only on localhost
  if ( window.location.origin=="http://localhost:5000" || debug==true) {
    console.log("Debug:")
    console.log(stuff)
    console.log("")
  }
}

function escapeHtml(text) {
  // This makes HTML submitted by user safer, is applied to text input by user
  // Means they can't encode links, iframes, etc.
  return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}

function make_general_links_clickable() {
  $('.general-link').click( function(evt) {
    evt.preventDefault()
    evt.stopImmediatePropagation()
    var href = $(this).attr('href')
    c(['Redirecting', href])
    fade_page_in_out('out', href)
  })
}

function bind_left_hand_button_clicks() {
  // Enables click behaviour for buttons on LHS
  // Fades all other buttons when one is clicked
  // Brings up correct content on RHS
    $('.lhs-button').click( function(evt) {

      c('LHS button clicked')
      
      // Fade other buttons on click, and show relevant content on RHS
      evt.preventDefault();
      evt.stopImmediatePropagation();

      // Track page title and button clicked
      mixpanel.track(
        $(document).find("title").text().trim().replace(/\s{2,}/g, ' ')+' button click', // event name
         {'Button': $(this).text()} // property
      );
        
      // Fade all but current button
      $('.lhs-button').css('opacity',0.6)
      $(this).css('opacity',1)
      
      // Fade all RHS content (and make sure page 1 of 2 is showing if relevant)
      $('.rhs-to-disappear').fadeOut(50, function() {
          $('.page2of2').hide();
          $('.page1of2').fadeIn(300);
      })

      // Show relevant RHS content
      var id_to_show = $(this).attr('id').replace('-button','')
      setTimeout ( function() {
        $('#'+id_to_show+'-rhs').fadeIn(300)
      } , 51 ) 
    });
}

function hide_messages_on_focus() { 
  // Finds all flash messages relating to the input and hides them if input is edited
  $('input').focus( function() {
      $(this).parent().parent().find('.flash-message').fadeOut();
    })
  $('input').keyup( function() {
      $(this).parent().parent().find('.flash-message').fadeOut();
    })
  // And when user clicks submit
  $('.a-button').click( function(evt) {
    $(this).parent().parent().find('.flash-message').fadeOut();
    })
}

function fade_page_in_out(fade_in_out, link_url) {
  if (fade_in_out == 'in') {
    $('.initially-hidden').fadeTo(500, 1)
    c('Fading page in')
  }
  else {
    $('.initially-hidden').fadeTo(300, 0)
    c('Fading page out')
    setTimeout( function() {
      window.location.href = link_url;
    }, 301)
  }
}

function make_enter_key_submit_form(input_id, button_id) {
  // Make enter key click submit
  $(input_id).keyup(function(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    if(evt.keyCode == 13){
        $(button_id).click();
    }
  });
}

function focus_at_end_of_input_form(input_id) {
  // Focus at end of text of an input element
  $(input_id).prop("selectionStart", $(input_id).val().length) // set caret to length (end)
       .focus();
  c('Focused at end.')
}

function toggle_page_1_and_2(go_to_page) {
  // Toggle between pages 1 and 2 (should probably make this function more general, for any number of pages)
  if (go_to_page==1) {
    $('.page2of2').fadeOut( function() {
      $('.page1of2').fadeIn()
    })
    
  }
  else {
    $('.page1of2').fadeOut( function() {
      $('.page2of2').fadeIn()
    })
  }
}

function quick_fade() {
  // We don't want anything on 'initially-hidden' state, as they have their own quick-fade states
  $('.initially-hidden').show()

  // Quick fade
  x=0
  gap = 100
  fade = 700
  setTimeout( function() {
    $('.quick-fade-1').fadeTo( fade , 1 )
  }, x)
  x=x+gap
  setTimeout( function() {
    $('.quick-fade-2').fadeTo( fade , 1 )
  }, x)
  x=x+gap
  setTimeout( function() {
    $('.quick-fade-3').fadeTo( fade , 1 )
  }, x)
  x=x+gap
  setTimeout( function() {
    $('.quick-fade-4').fadeTo( fade , 1 )
  }, x)
  x=x+gap
  setTimeout( function() {
    $('.quick-fade-5').fadeTo( fade , 1 )
  }, x)
  x=x+gap
  setTimeout( function() {
    $('.quick-fade-6').fadeTo( fade , 1 )
  }, x)
  x=x+gap
  setTimeout( function() {
    $('.quick-fade-7').fadeTo( fade , 1 )
  }, x)
  x=x+gap
  setTimeout( function() {
    $('.quick-fade-8').fadeTo( fade , 1 )
  }, x)
  x=x+gap
  setTimeout( function() {
    $('.quick-fade-9').fadeTo( fade , 1 )
  }, x)
  x=x+gap
  setTimeout( function() {
    $('.quick-fade-10').fadeTo( fade , 1 )
  }, x)
  x=x+gap
}

// Functions to run
make_general_links_clickable()