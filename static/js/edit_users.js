function make_user_admin(user_id) {
	// Take it to the server
	$.ajax( {
      url: '/_make_user_admin',
      data: JSON.stringify ({
        'user_id':user_id
      }, null, '\t'),
      contentType: 'application/json;charset=UTF-8',
      type: "POST",
      success: function(response) {
        // Returns status=1 and name
        response = JSON.parse(response);
        status = response['status']
        data = response['data']
        if (status=='1') {
          mixpanel.track('User made admin')
          fade_page_in_out('out','/edit_users')
        }
        else {
          alert(data)          
        }
      },
      fail: function() {
        alert("There has been a server error.")
      } // end success callback
    }); // end ajax
}

function delete_user(user_id) {
	// Take it to the server
	$.ajax( {
      url: '/_delete_user',
      data: JSON.stringify ({
        'user_id':user_id
      }, null, '\t'),
      contentType: 'application/json;charset=UTF-8',
      type: "POST",
      success: function(response) {
        // Returns status=1 and name
        response = JSON.parse(response);
        status = response['status']
        data = response['data']
        if (status=='1') {
          mixpanel.track('User deleted')
          fade_page_in_out('out','/edit_users')
        }
        else {
          alert(data)          
        }
      },
      fail: function() {
        alert("There has been a server error.")
      } // end success callback
    }); // end ajax
}

function prepare_buttons() {
	$('.make-admin-button').click ( function(evt) {
		evt.preventDefault();
		evt.stopImmediatePropagation();
		var user_id = $(this).attr('href')
		make_user_admin(user_id)
	})
	$('.delete-user-button').click ( function(evt) {
		evt.preventDefault();
		evt.stopImmediatePropagation();
		var user_id = $(this).attr('href')
		delete_user(user_id)
	})
}

fade_page_in_out('in')
make_general_links_clickable()
prepare_buttons()