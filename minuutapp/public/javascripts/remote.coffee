$(document).ready ->
	console.log "ready"
	
	$('.startbutton').click () ->
		video = $(this).parent().attr('id')
		console.log video
		user = $("#username").val()
		data = {video: video, user: user}
		#$.post('/', data, (data)
		#	console.log data
		#)
		console.log ("shouldbeposted")

#
#
#start(user,time,fragment)

