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
    html += "<section class='post' id="+post._id+" posted="+moment(post.posted).unix()+">"
    html += "<div class='post-img'>"
    html += "<img src='/static/img/icon.png' width='70', height='70'>"
    html += "</div> <!-- end img part -->"
    html += "<div class='post-alltext'>"
    html += "<h2 class='post-name'>"+post.name+"</h2>"
    html += "<span class='post-time'>"+moment(post.posted).fromNow()+"</span>"
    html += "<p class='post-body'>"+post.body+"</p>"
    html += "</div> <!-- end text part -->"    
    html += "</section> <!-- end post --><hr>"
  }) // end each
    $('#post-list-area').html(html)
}


function add_new_posts_only(posts) {
  // This checks if there are any new posts to display given a set of latest posts from the server
  var newest_post_displayed = parseInt($('.post').first().attr('posted'))
  var newest_post_on_server = moment(posts[0].posted).unix()
  if (newest_post_displayed < newest_post_on_server) {
    html=""
    $.each( posts, function(index, post) {
      console.log(index, post)
      if (moment(post.posted).unix() > newest_post_displayed) {
        html += "<section class='post' id="+post._id+" posted="+moment(post.posted).unix()+">"
        html += "<div class='post-img'>"
        html += "<img src='/static/img/icon.png' width='70', height='70'>"
        html += "</div> <!-- end img part -->"
        html += "<div class='post-alltext'>"
        html += "<h2 class='post-name'>"+post.name+"</h2>"
        html += "<span class='post-time'>"+moment(post.posted).fromNow()+"</span>"
        html += "<p class='post-body'>"+post.body+"</p>"
        html += "</div> <!-- end text part -->"    
        html += "</section> <!-- end post --><hr>"
      }
    }) // end each
    $('#post-list-area').prepend(html)
  } // end if
  else{ console.log(moment().unix(), 'no new posts') }
}


function submit_posts_button_ready() {
  $('#post_submit_button').click( function(evt) {
      evt.preventDefault();
      evt.stopImmediatePropagation();
      console.log('Clicked submit')
      var message = $('#post_input').val();
      hide_submit_button();
      $.ajax({
                url:'/_submit_post_entry',
                data: JSON.stringify({
                  "message":message
                }, null, '\t'), // end data
                contentType: 'application/json;charset=UTF-8',
                type: "POST",
                success: function(result) { 
                  console.log ('This is the result and type of result:',result,typeof(result))
                  get_posts(full_refresh=true, 10,0)
                  remove_text_from_input();
                }, // end success
                error: function() {
                  alert('Server error')
                }

              }) // end ajax
  }); // end submit
}

function recursive_check_for_new_posts(){
    // Loops the poll on server via AJAX to check for new posts
    delay = 30000;
    get_posts(full_refresh=false, 30,0)
    setTimeout(recursive_check_for_new_posts, delay)
}

function show_submit_button_when_typing() {
  $('#post_input').bind('keyup', function() { 
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
    console.log('fading!')
  }
  else {
    $('.can-fade').css('opacity',1);
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
      if ($('body').scrollTop()>50) {
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
    if ($('body').scrollTop()>50) {
        $('.navigation-arrow-up').fadeIn()
      }
    else {
      $('.navigation-arrow-up').fadeOut()
    }
    })

}

// START OF SCRIPT ON PAGE LOAD
get_posts(full_refresh=true, 30,0)
recursive_check_for_new_posts()
submit_posts_button_ready()
show_submit_button_when_typing()
get_scroll_navs_ready()

