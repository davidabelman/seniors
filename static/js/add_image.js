function main_buttons_to_contol_hidden_content() {
	x = 1
}

function get_content_from_bing() {
	$('#bing-search-button').click ( function(evt) {
		evt.preventDefault();
      	evt.stopImmediatePropagation();
      	$.ajax({
              url:'/_get_bing_image_urls',
              data: JSON.stringify({
                "query":'grandparents',
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
		html += "<div class='col-sm-4 shift-down-3'>"
		html += "<img src='"+url+"' height='100px'>"
		html += "</div>"
	}) // end each
	html += "</row>"
	$('#img-grid').html(html)
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

