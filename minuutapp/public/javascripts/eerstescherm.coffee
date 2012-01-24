$(document).ready ->
	PUBNUB.subscribe(
		channel: "playingonfirstscreen"
		error: ->console.log("connection lost, will reconnect")
		connect: ->console.log("connected")
		callback: (message)->
			console.log(message.user)
			console.log($("#username").val())
			if(message.username == $("#username").val())
				thevideo = new Video(message.url, message.starttime, message.endtime)
				date1=date2=0
				thevideo.onplay(->
					$.post("/posts/playingonfirstscreen",
						{
							username: $("#username").val(),
							url: message.url,
						})
					)

				thevideo.startFullWindow()
				thevideo.play()
				
	)


	
	
	 	 
	      
