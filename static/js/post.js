function get_posts(full_refresh, limit, skip) {
  // This requests new posts from the server
  // Appends to DOM if called with full_refresh, or only appends new posts if not
    $.getJSON('/_get_posts',
              { 
                "limit":limit,
                "skip":skip,
              },
              function(posts) {
                if (full_refresh) {
                  all_posts_to_dom(posts);
                }
                else {
                  add_new_posts_only(posts);
                }
              }) // end JSON
} // end get_posts


function all_posts_to_dom(posts) {
  // This replaces all posts currently shown in the DOM with a refreshed set
  html = ""

  $.each(posts, function(index, post) {
    if ($('#user_name_hidden').val()==post.name) {
      var own_post = 'self-post';
    }
    else {
      var own_post = '';
    }
    html += "       <section class='post "+own_post+"' id="+post._id+" posted="+moment.utc(post.posted).unix()+">\n"
    html += "         <div class='post-img'>\n"
    html += "           <img src='/static/img/"+post.picture+"-icon.png' width='70', height='70'>\n"
    html += "         </div> <!-- end img part -->\n"
    html += "         <div class='post-alltext'>\n"
    html += "           <h2 class='post-name'>"+post.name+"</h2>\n"
    html += "           <span class='post-time'>"+moment.utc(post.posted).fromNow()+"</span>\n"
    html += "           <p class='post-body'>"+post.body+"</p>\n"
    html += "         </div> <!-- end text part -->\n"    
    html += "       </section> <!-- end post --><hr>\n\n"
  }) // end each
    $('#post-list-area').html(html)
}


function add_new_posts_only(posts) {
  // This checks if there are any new posts to display given a set of latest posts from the server
  var newest_post_displayed = parseInt($('.post').first().attr('posted'))
  var newest_post_on_server = moment.utc(posts[0].posted).unix()
  if (newest_post_displayed < newest_post_on_server) {
    // html=""
    $.each( posts, function(index, post) {
      if (moment.utc(post.posted).unix() > newest_post_displayed) {
        add_single_post_to_top(post);
      }
    }) // end each
  } // end if
  else{ console.log(moment.utc().unix(), 'no new posts') }
}

function add_single_post_to_top(post) {
  // Adds HTML for a single post as hidden, and then shows it at the end

  // For testing purposes
  // post = {
  //   name:'David',
  //   posted:'2014-08-04T16:43:05.995000',
  //   body:'This is a another test xyz',
  //   picture:'dog'
  // }

  // Determine background colour
  if ($('#user_name_hidden').val()==post.name) {
      var own_post = 'self-post';
    }
    else {
      var own_post = '';
    }
  // Add HTML
  html = "        <div class='hidden-new-post''>"
  html += "       <section class='post "+own_post+"' id="+'test'+" posted="+moment.utc(post.posted).unix()+">\n"
  html += "         <div class='post-img'>\n"
  html += "           <img src='/static/img/"+post.picture+"-icon.png' width='70', height='70'>\n"
  html += "         </div> <!-- end img part -->\n"
  html += "         <div class='post-alltext'>\n"
  html += "           <h2 class='post-name'>"+post.name+"</h2>\n"
  html += "           <span class='post-time'>"+moment.utc(post.posted).fromNow()+"</span>\n"
  html += "           <p class='post-body'>"+post.body+"</p>\n"
  html += "         </div> <!-- end text part -->\n"    
  html += "       </section> <!-- end post --><hr>\n\n"
  html += "       </div>"

  // Add to post area and fade in
  $('#post-list-area').prepend(html)
  $('.hidden-new-post').show(250, function() {
    $('.hidden-new-post').fadeTo( 300 , 1)
  })
}

function submit_posts_button_ready() {
  // Focus on input page load
  $('#post_input').focus()

  // Bind ajax to post user's mssage (with clean HTML) to server
  $('#post_submit_button').click( function(evt) {
      evt.preventDefault();
      evt.stopImmediatePropagation();

      var html = escapeHtml($('#post_input').val());
      hide_submit_button();
      create_post_from_html(html);
      mixpanel.track('Posted text', {'Length (chars)':html.length})
      setTimeout( function() {
        get_posts(full_refresh=false, 5,0) 
      }, 500) // Adding a delay to avoid two very close requests to server
      remove_text_from_input();
      $('#post_input').focus()
  }); // end submit
}

// TODO currently duplicated in post.js and add_image.js
function create_post_from_html(html) {
  // Adds some HTML (or text etc) to the feed on the Database side
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
                }, // end success
                error: function() {
                  alert('Server error')
                }
              }) // end ajax
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

function nav_buttons_ready() {
  var speed = 200
  // Fade out and logout 
  $('#logout-button').click( function(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    mixpanel.track('Logout');
    $('#whole-content').animate({
      opacity: 0}, speed, function() {
        // When complete
        window.location.href = "logout";
      })
  }) // end click event

  // Fade out and go to 'add_image screen' 
  $('#add-image-button').click ( function(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    $('#whole-content').animate({
      opacity: 0}, speed, function() {
        // When complete
        window.location.href = "add_image";
      })
  })

  // Fade out and go to 'settings screen' 
  $('#settings-button').click ( function(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    $('#whole-content').animate({
      opacity: 0}, speed, function() {
        // When complete
        window.location.href = "settings";
      })
  })

  // Fade out and go to 'help screen' 
  $('#help-button').click ( function(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    $('#whole-content').animate({
      opacity: 0}, speed, function() {
        // When complete
        window.location.href = "help";
      })
  })
} // end function

function recursive_check_for_new_posts(count, delay){
    // Loops the poll on server via AJAX to check for new posts
    // Count increments for tracking purposes, delay is millisecond delay
    console.log("Refresh posts:", count);
    var delays_per_min = 60000/delay
    if (count%delays_per_min==0) {
      // 1 minute passed
      mixpanel.track('Wall refreshes', {'Consecutive minutes': count/delays_per_min})
      console.log("We have been going for",count/delays_per_min,'min')
    }    
    setTimeout( function() {
      get_posts(full_refresh=false, 5,0);
      count+=1;
      recursive_check_for_new_posts(count, delay)
    }, delay)   
}

function change_button_behaviour_when_typing_post() {
  $('#post_input').bind('keyup', function(evt) { 
    evt.preventDefault()
    evt.stopImmediatePropagation()
    if ($('#post_input').val().length > 0) {
      $('#post_submit_button').css('opacity',1).removeClass( "disabled" );
      switch_the_can_fade_elements('fade');
    }
    else {
      hide_submit_button();
    }
}); // end keyup function
} // end function

function hide_submit_button() {
  $('#post_submit_button').css('opacity',0).css('visibility','hidden').css('visibility','visible').addClass( "disabled" );
  switch_the_can_fade_elements('unfade');
} // end function

function remove_text_from_input() {
  $('#post_input').val('')
  $('#post_input').attr("placeholder", "Message has been added! \nType another here...");
}

function switch_the_can_fade_elements(fade_control) {
  if (fade_control == 'fade') {
    $('.can-fade').css('opacity',0.4);
    $('#post_input').addClass('green-border')
  }
  else {
    $('.can-fade').css('opacity',1);
    $('#post_input').removeClass('green-border')
  }
  
};

function get_scroll_navs_ready() {
  // Scroll down
  $('#scrollDown').click( function() {
    // Get current position
    var pos = $('body').scrollTop()
    pos = pos+=250
    // Update position
    $('body').animate({scrollTop: pos}, 200);
  })
 
  // Scroll up
  $('#scrollUp').click( function() {
    // Get current position
    var pos = $('body').scrollTop()
    pos = pos-=250
    // Update position
    $('body').animate({scrollTop: pos}, 200);
  })

  //Hide when mouse not over posts
  $('#right-panel').hover (
    //handler in
    function() {
      $('.navigation-arrow-down').fadeIn()
      if ($(window).scrollTop()>50) {
        $('.navigation-arrow-up').fadeIn()
      }
    },
    // handler out
    function() {
      $('.navigation-arrow').fadeOut()
    })

  // Show and hide when scrolling
  $( window ).scroll(function() {
    // Down arrow is always on
    $('.navigation-arrow-down').fadeIn()
    // Up arrow is only on if not near top
    if ($(window).scrollTop()>50) {
        $('.navigation-arrow-up').fadeIn()
      }
    else {
      $('.navigation-arrow-up').fadeOut()
    }
    })

}


// START OF SCRIPT ON PAGE LOAD
mixpanel.track('Wall load')
quick_fade()
get_posts(full_refresh=true, 30,0)
recursive_check_for_new_posts(count=1, delay=5000)
submit_posts_button_ready()
change_button_behaviour_when_typing_post()
get_scroll_navs_ready()
nav_buttons_ready()

