// Initiate mixpanel
(function(f,b){if(!b.__SV){var a,e,i,g;window.mixpanel=b;b._i=[];b.init=function(a,e,d){function f(b,h){var a=h.split(".");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)))}}var c=b;"undefined"!==typeof d?c=b[d]=[]:d="mixpanel";c.people=c.people||[];c.toString=function(b){var a="mixpanel";"mixpanel"!==d&&(a+="."+d);b||(a+=" (stub)");return a};c.people.toString=function(){return c.toString(1)+".people (stub)"};i="disable track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.track_charge people.clear_charges people.delete_user".split(" ");
for(g=0;g<i.length;g++)f(c,i[g]);b._i.push([a,e,d])};b.__SV=1.2;a=f.createElement("script");a.type="text/javascript";a.async=!0;a.src="//cdn.mxpnl.com/libs/mixpanel-2.2.min.js";e=f.getElementsByTagName("script")[0];e.parentNode.insertBefore(a,e)}})(document,window.mixpanel||[]);
if ( window.location.origin=="http://localhost:5000" ) {
	var token = "a54d273360d0c16af87f3eaacb84c2e4"
} else if ( window.location.origin == "http://salt-and-pepper.herokuapp.com") {
	//var token = "a54d273360d0c16af87f3eaacb84c2e4"
	var token = "6fe9a2b63dfcdc26327bd00857dab569"
}
// Initialise Mixpanel
mixpanel.init(token);
c (["Mixpanel initialised with token", token])
// Track all page views
mixpanel.track('Page view', 
	{
		'title':$(document).find("title").text().trim().replace(/\s{2,}/g, ' '),
		'path':window.location.pathname
	}
);
// Use user ID to identify if a user is logged in (put as hidden field on base template)
var user_id_hidden = $('#user_id_hidden').val()
c(['User id is', user_id_hidden])
if (user_id_hidden!=undefined) {
	mixpanel.identify($('#user_id_hidden').val());
	c( [ "Identified user as",$('#user_id_hidden').val() ] )
}