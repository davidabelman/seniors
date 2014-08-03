$('#bing-search-button').click( function(evt) {
	// Fade other buttons on click, and show relevant content on RHS
	evt.preventDefault();
    evt.stopImmediatePropagation();

    // Fade all but current button
    $('#bing-search-button').css('opacity',1)
	$('#webcam-button').css('opacity',0.6)
	$('#upload-button').css('opacity',0.6)
	$('#imgurl-button').css('opacity',0.6)
	$('#cancel-button').css('opacity',0.6)

	// Fade all RHS content
	$('.bing-search-content, .webcam-content, .upload-content, .imgurl-content').fadeOut(50)

	// Show relevant RHS content
	setTimeout ( function() {
		$('.bing-search-content').fadeIn(300)
	} , 51 ) 
});


function get_content_from_bing() {
	$('#bing-search-submit').click ( function(evt) {
		evt.preventDefault();
      	evt.stopImmediatePropagation();

      	// Make call to server
      	$.ajax({
              url:'/_get_bing_image_urls',
              data: JSON.stringify({
                "query":$('#img-input').val(),
                "funny":0,
                "cartoon":0,
                "animated":0,
                "max_results":9
              }, null, '\t'),
              contentType: 'application/json;charset=UTF-8',
              type: "POST",
              success: function(result) { 
              	  result = JSON.parse(result);
              	  if (result['status']==1) {
                  	urls = result['data']
                  	draw_images(urls)
                  	$('#bing-search-hint').fadeOut()
                  	$('#bing-search-body').fadeOut()
                  	$('#bing-search-submit').fadeOut()
                  }
                  else {
                  	alert(result['status'])
                  }
                },
              error: function() {
                alert('Server error')
              }
            }) // end ajax
	})
}

function draw_images() {
	html = "<row>"
	$.each( urls, function(index, url) {
		console.log(url)
		html += "<div class='div-in-img-grid'>"
		html += "<img src='"+url+"' class='img-in-img-grid'>"
		html += "</div>"
	}) // end each
	html += "</row>"
	$('#img-grid').html(html)
	setTimeout (function() {
		$('#bing-search-results').fadeIn()
		}, 500)
}

get_content_from_bing()




// TRYING TO SEE IF IMAGES ARE BROKEN LINKS DOESN"T WORK ON LOCALHOST - TRY ONLINE:
// function draw_images() {
// 	html = "<row>"
// 	$.each( urls, function(index, url) {
// 		UrlExists(url, function(status){
// 		    if(status === 200){
// 		       // file was found
// 		       console.log(url)
// 				html += "<div class='col-sm-4 shift-down-3'>"
// 				html += "<img src='"+url+"' height='100px'>"
// 				html += "</div>"
// 		    }
// 		});
		
// 	}) // end each
// 	html += "</row>"
// 	$('#img-grid').html(html)
// }

// function UrlExists(url, cb){
//     jQuery.ajax({
//         url:      url,
//         dataType: 'text',
//         type:     'GET',
//         complete:  function(xhr){
//             if(typeof cb === 'function')
//                cb.apply(this, [xhr.status]);
//         }
//     });
// }

