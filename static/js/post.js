function get_posts(which_posts, limit, skip, skip_to_date) {
  // This requests new posts from the server
  // Appends to DOM if called with full_refresh, or only appends new posts if not or older ones if pressing 'see more' button
  // Also returns number of posts that were not collected by the refresh (in 'remaining_count')
    $.getJSON('/_get_posts',
              { 
                "limit":limit,
                "skip":skip,
                "skip_to_date":skip_to_date
              },
              function(data) {
                posts = data['posts']
                remaining_count = data['remaining_count']
                c(data)
                if (which_posts=='all') {
                  all_posts_to_dom(posts, remaining_count, append_or_replace='replace');
                }
                else if (which_posts=='new') {
                  add_new_posts_only(posts);  // Remaining count is not relevant here as only appending new data
                }
                else if (which_posts=='old') {
                  all_posts_to_dom(posts, remaining_count, append_or_replace='append');
                  scroll_page(500, 'down')
                }
              }) // end JSON
} // end get_posts


function all_posts_to_dom(posts, remaining_count, append) {
  // This replaces all posts currently shown in the DOM with a refreshed set
  // or appends set of posts to the bottom
  html = ""

  $.each(posts, function(index, post) {
    if ($('#user_name_hidden').val()==post.name) {
      var own_post = 'self-post';
    }
    else {
      var own_post = '';
    }
    html += "       <section class='post "+own_post+"' id="+post._id+" posted="+moment.utc(post.posted).unix()+">\n"
    html += "         <div class='post-img-div'>\n"
    html += "           <img src='/static/img/"+post.picture+"-icon.png' class='post-img'>\n"
    html += "         </div> <!-- end img part -->\n"
    html += "         <div class='post-alltext'>\n"
    html += "           <h2 class='post-name'>"+post.name+"</h2>\n"
    html += "           <span class='post-time'>"+moment.utc(post.posted).fromNow()+"</span>\n"
    html += "           <p class='post-body'>"+post.body+"</p>\n"
    html += "         </div> <!-- end text part -->\n"    
    html += "       </section> <!-- end post --><hr>\n\n"
  }) // end each

  if (append_or_replace=='append') {
    html_hidden = "<div class='hidden-new-post'>"+html+"</div>"
    $('#post-list-area').append(html_hidden)
    $('.hidden-new-post').fadeTo(300,1)
  }
  else {
    $('#post-list-area').html(html)
  }

  c('Checking if more posts...')
  // Now finally we want to bring back our 'see more button' if there are more
  if (remaining_count > 0) {
    // More to show
    c('More posts to show, fading out spinner and bringing in orange button')
    $('#show-more-loading-icon').fadeOut('fast', function() {
      $('#show-more-posts-button').fadeTo(500, 1);
    })
  }
  else {
    // No more to show - just fade out the loading icon
    c('No more posts to show, fading out spinner')
    $('#show-more-loading-icon').fadeOut('fast')
  }
  
}


function add_new_posts_only(posts) {
  // This checks if there are any new posts to display given a set of latest posts from the server
  var newest_post_displayed = parseInt($('.post').first().attr('posted'))
  var newest_post_on_server = moment.utc(posts[0].posted).unix()
  if (newest_post_displayed < newest_post_on_server) {
    $.each( posts, function(index, post) {
      if (moment.utc(post.posted).unix() > newest_post_displayed) {
        add_single_post_to_top(post);
      }
    }) // end each
  } // end if
  else{ c( [ moment.utc().unix(), 'no new posts' ] ) }
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
  html += "         <div class='post-img-div'>\n"
  html += "           <img src='/static/img/"+post.picture+"-icon.png' class='post-img'>\n"
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
      
      // Mixpanel
      mixpanel.track('Posted text', {'Length (chars)':html.length}) // event
      mixpanel.people.increment('Text posts', 1); // people

      setTimeout( function() {
        get_posts(which_posts='new', limit=number_of_new_posts+1, skip=0, skip_to_date=null)  // add 1 since his/her own post is included
      }, 500) // Adding a delay to avoid two very close requests to server
      remove_text_from_input();
      $('#post_input').focus()
  }); // end submit
}

// TODO currently duplicated in post.js and add_image.js
function create_post_from_html(html) {
  // Adds some HTML (or text etc) to the feed on the Database side
  c('Submitting post to server')
  $.ajax({
                url:'/_submit_post_entry',
                data: JSON.stringify({
                  "content":html
                }, null, '\t'), // end data
                contentType: 'application/json;charset=UTF-8',
                type: "POST",
                success: function(result) { 
                  c (['Post submitted', result])
                }, // end success
                error: function() {
                  alert('Server error')
                }
              }) // end ajax
}


function nav_buttons_ready() {
  // Get all navigation buttons on the page ready for action

  var speed = 200
  // Fade out and logout 
  $('#logout-button').click( function(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    
    // Track logout and clear mixpanel cookie
    mixpanel.track('Logout');
    var id = window.setInterval(function() {
      if (mixpanel.cookie && mixpanel.cookie.clear) {
        mixpanel.cookie.clear();
        window.clearInterval(id);
      }
      // Redirect away
      $('#whole-content').animate({
      opacity: 0}, speed, function() {
        // When complete
        window.location.href = "logout";
      })
    }, 50);
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

  // When we want more posts, check to see what oldest post is
  $('#show-more-posts-button').click ( function(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    var last_posted_time = $('.post:last').attr('posted');
    get_posts(which_posts='old', limit=number_of_old_posts, skip=0, skip_to_date=last_posted_time)
    $('#show-more-posts-button').fadeOut('fast', function() {
      $('#show-more-loading-icon').fadeIn('fast');
    })
  })

  // Click ditate button
  $('#dictate-button').click ( function(evt) {
    speech_app()
    prepare_start_stop_speech_buttons()
  })

} // end function

function recursive_check_for_new_posts(count, delay){
    // Loops the poll on server via AJAX to check for new posts
    // Count increments for tracking purposes, delay is millisecond delay
    c(["Refresh posts:", count]);
    var delays_per_min = 60000/delay
    if (count%delays_per_min==0) {
      // 1 minute passed
      mixpanel.track('Wall refreshes', {'Consecutive minutes': count/delays_per_min})
      c(["We have been going for",count/delays_per_min,'min'])
    }    
    setTimeout( function() {
      get_posts(which_posts='new', limit=number_of_new_posts, skip=0, skip_to_date=null);
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

function scroll_page(amount, up_or_down) {
  // Get current position
    var pos = $('body').scrollTop()
    if (up_or_down=='up') {change=-amount}
    else {change=amount}
    pos = pos+change
    // Update position
    $('body').animate({scrollTop: pos}, amount);
    c('Scrolled')
}

function get_scroll_navs_ready() {
  // Scroll down
  $('#scrollDown').click( function() {
    scroll_page(450, 'down')
  })
 
  // Scroll up
  $('#scrollUp').click( function() {
     scroll_page(450, 'up')
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
    // Down arrow only if user not at bottom
    if($(window).scrollTop() + $(window).height() < $(document).height()-100) {
       $('.navigation-arrow-down').fadeIn()
   }
    else {
       $('.navigation-arrow-down').fadeOut()
    }
    
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
// How many posts to pull?
number_of_new_posts = 3  // Checking for posts within the last X seconds (delay, see below)
number_of_old_posts = 10  // When user clicks 'get more', how many older ones to display
number_of_posts_initially = 15 // How many to load on page refresh

mixpanel.track('Wall load')
quick_fade()
get_posts(which_posts='all', limit=number_of_posts_initially, skip=0, skip_to_date=null)
recursive_check_for_new_posts(count=1, delay=6000)
submit_posts_button_ready()
change_button_behaviour_when_typing_post()
get_scroll_navs_ready()
nav_buttons_ready()

