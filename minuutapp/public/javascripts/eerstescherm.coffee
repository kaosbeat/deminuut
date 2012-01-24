$(document).ready ->
	PUBNUB.subscribe(
		channel: "vtm"
		error: ->console.log("connection lost, will reconnect")
		connect: ->console.log("connected")
		callback: (message)->
			console.log(message.user)
			console.log($("#username").val())
			if(message.user == $("#username").val())
				thevideo = new Video(message.movie ,message.starttime, message.endtime)
				date1=date2=0
				thevideo.onplay(->
					$.post("/posts/playingonfirstscreen",
						{
							movieurl: message.movie,
							username: $("#username").val()
						})
					)

				thevideo.startFullWindow()
				thevideo.play()
				
	)


	
	
	 	 
	      
