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
				date1=date2=0
				thevideo.onplay(->
					date1=new Date()
					)
				thevideo.onplaying(->
					date2=new Date()
					)

				thevideo.startFullWindow()
				thevideo.play()
				setTimeout( ->
					console.log("play: "+date1)
					console.log("playing: "+date2)
				, 1000)
				
	)


	
	
	 	 
	      
