$(document).ready ->
	PUBNUB.subscribe(
		channel: "vtm"
		error: ->console.log("connection lost, will reconnect")
		connect: ->console.log("connected")
		callback: (message)->console.log(message)
	)
coffee = "cool"
client_opts = {
	#/ May be set to empty string if you don't need to test
	#/ cross-domain features. In other case set it to a full
	#/ url, like: "http://localhost:8080"
	url: 'localhost:3000',
	sockjs_url: '/echo',
	disabled_transports: undefined
	sockjs_opts: {devel:true, debug:true}
}




sockjs = new SockJS("http://localhost:3000/echo",client_opts.disabled_transports,client_opts.sockjs_opts) 

sockjs.onopen =  () ->
	console.log(' [*] Connected (using: '+sockjs.protocol+')')

sockjs.onclose = (e) ->
	console.log(' [*] Disconnected ('+e.status + ' ' + e.reason+ ')')

sockjs.onmessage = (e) ->
	console.log(' [ ] received in eerstescherm: ' + JSON.stringify(e.data))




