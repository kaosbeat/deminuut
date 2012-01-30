$(document).ready ->
	thevideo=''
	PUBNUB.subscribe(
		channel: "playingonfirstscreen"
		error: ->console.log("connection lost, will reconnect")
		connect: ->console.log("connected")
		callback: (message)->
			if(message.username == $("#username").val())
				console.log(message.username + " == " + $("#username").val() + ": playing video (" + message.url + ")")
				if(thevideo)
					thevideo.destroy()
				thevideo = new Video(message.url, message.starttime, message.endtime)
				
				thevideo.onplay(->
					$.post("/posts/playingonfirstscreen",
						{
							username: $("#username").val(),
							url: message.url,
						})
					)

				thevideo.startFullWindow()
				thevideo.play()
			else
				console.log(message.username + " != " + $("#username").val())
				
	)


	
	
	 	 
	      
