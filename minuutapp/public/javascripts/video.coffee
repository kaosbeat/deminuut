class @Video
	#working for 25 fps
	jvideo=nativedom=beginframe=endframe=''
	constructor:	(@video, @startframe, @stopframe)->
		jvideo=$('video').first()
		jvideo.hide()
		nativedom=$('video').first().get(0)
		jvideo.attr('src', video)
		beginframe=startframe
		endframe=stopframe
		nativedom.addEventListener('loadedmetadata', ->		
				
				
			if(typeof beginframe!= 'undefined' && beginframe)
				#console.log(nativedom.currentTime)
				#console.log(beginframe/25)
				nativedom.currentTime=beginframe/25
		)
	

	play:	() -> 	
			jvideo.hide()
			

			#hoe belachelijk is dat; die timeupdate updatet niet elke frame
			#setInterval is ook methode voor SMPTE frameseeking test
			#nativedom.addEventListener('timeupdate', ->
			#	if(typeof endframe!= 'undefined' && endframe)
			#		console.log(nativedom.currentTime)
			#		if(nativedom.currentTime >= endframe/25)
			#			nativedom.pause()
			#)
			if(typeof endframe!= 'undefined' && endframe)
				
				#console.log("doe iets")
				setInterval(->
					timecode=nativedom.currentTime
					#console.log(timecode)
					if(timecode>=endframe/25)
						nativedom.pause()
				, 20)
				#20: ms ; 25fps is 40ms
			#klein beetje vertraging insteken
			setTimeout(->
				jvideo.show()
				nativedom.play()
			,500)
				
			

	pause:	() ->
			nativedom.pause()

	

	
