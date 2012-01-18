$(document).ready ->
	console.log "blah"
	
	$('.startbutton').click () ->
		video = $(this).parent().attr('id')
		console.log video
		user = $("#username").val()
		data = {video: video, user: user}
		l = ' [ ] sending: ' + JSON.stringify(data);
		if (sockjs.readyState != SockJS.OPEN)
			l += ' (error, connection not established)'
		else 
			sockjs.send(data)
		console.log(l)
		#$.post('/', data, (data)
		#	console.log data
		#)
		console.log ("shouldbeposted")


sockjs_url = '/echo'
sockjs = new SockJS(sockjs_url)

sockjs.onopen =  () ->
	console.log(' [*] Connected (using: '+sockjs.protocol+')')

sockjs.onclose = (e) ->
	console.log(' [*] Disconnected ('+e.status + ' ' + e.reason+ ')')

sockjs.onmessage = (e) ->
	console.log(' [ ] received echo: ' + JSON.stringify(e.data))


#
#
#start(user,time,fragment)

