$(document).ready ->
	PUBNUB.subscribe(
		channel: "vtm"
		error: ->console.log("connection lost, will reconnect")
		connect: ->console.log("connected")
		callback: (message)->
			console.log(message)
			if(message.user == $("#user").val()) 
				thevideo=new Video(message.movie ,  message.startframe, message.stopframe)
				thevideo.play()

	)


	
	
	 	 
	      
