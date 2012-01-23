$(document).ready ->
	PUBNUB.subscribe(
		channel: "vtm"
		error: ->console.log("connection lost, will reconnect")
		connect: ->console.log("connected")
		callback: (message)->
			console.log(message.user)
			console.log($("#username").val())
			if(message.user == $("#username").val())
				$.post("/posts/playingonfirstscreen",
					{
						movieurl: message.movie,
						username: $("#username").val()
					})
				thevideo = new Video(message.movie ,  message.startframe, message.stopframe)
				thevideo.play()
				
	)


	
	
	 	 
	      
