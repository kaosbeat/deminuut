$(document).ready ->
	
	$('button').click( ->
			

	#sockjs alternatief: URL vervangen door die van de server	
	#	sockjs = new SockJS('http://10.10.129.23:3000/echo',null,{'debug':true});
	#	sockjs.onopen= ()->
	#		console.log(' [*] Connected (using: '+sockjs.protocol+')')
	#		sockjs.send("afterbutton")
	#	sockjs.onmessage = (e)-> 
	#  		console.log('message', e.data)
	#  
	#	sockjs.onclose = (e) ->
	#  		console.log('close', e.data)

		PUBNUB.publish(
	    		channel : "vtm",
	    		message : {"user": $('input[name=user]').val(), "movie":$('input[name=movie]').val() , "startframe":$('input[name=startframe]').val(), "stopframe":$('input[name=stopframe]').val()}
	    )	
	    
	) 
	
	