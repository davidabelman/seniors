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
    html += "<div class='post' id="+post._id+" posted="+moment(post.posted).unix()+">"
    html += "<div class='post-name'>"+post.name+"</div>"
    html += "<div class='post-body'>"+post.body+"</div>"
    html += "<div class='post-time'>"+moment(post.posted).fromNow()+"</div>"
    html += "<br></div>"
  }) // end each
    $('#post_list').html(html)
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
        html += "<div class='post' id="+post._id+" posted="+moment(post.posted).unix()+">"
        html += "<div class='post-name'>"+post.name+"</div>"
        html += "<div class='post-body'>"+post.body+"</div>"
        html += "<div class='post-time'>"+moment(post.posted).fromNow()+"</div>"
        html += "<br></div>"
      }
    }) // end each
    $('#post_list').prepend(html)
  } // end if
  else{ console.log(moment().unix(), 'no new posts') }
}


function submit_posts_button_ready() {
  $('#post_submit').submit( function(evt) {
      evt.preventDefault();
      console.log('clicked')
      var message = $('#post_input').val();
      console.log(message)
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

// START OF SCRIPT ON PAGE LOAD
get_posts(full_refresh=true, 30,0)
recursive_check_for_new_posts()
submit_posts_button_ready()

