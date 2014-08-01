// This requests new posts from the server
// Appends to DOM if called with full_refresh, or checks for new posts if not
var get_posts = function(full_refresh, limit, skip) {
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
                  check_for_new_posts(posts);
                }
              }) // end JSON
} // end get_posts

// This replaces all posts currently shown in the DOM with a refreshed set
var all_posts_to_dom = function(posts) {
  html = ""
  $.each(posts, function(index, post) {
    html += "<div class='post'>"
    html += "<div class='post-name'>"+post.name+"</div>"
    html += "<div class='post-body'>"+post.body+"</div>"
    html += "<div class='post-time'>"+moment(post.posted).fromNow()+"</div>"
    html += "<br></div>"
  }) // end each
    $('#post_list').html(html)
}

// This checks if there are any new posts to display given a set of latest posts from the server
var check_for_new_posts = function(posts) {

}


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

// Function to get latest 10 posts
$('#post_list p').click( function(evt) {
    posts = get_posts(full_refresh=true, 10,0)
}); // end submit

