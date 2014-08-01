var reload_posts = function() {
  console.log('{{initial_posts}}')
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
                reload_posts()
              }, // end success
              error: function() {
                alert('Server error')
              }

            }) // end ajax
}); // end submit