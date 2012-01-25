class @Video
	#concept of frame is unknown to html5 video; everything in seconds->milliseconds
	jvideo=nativedom=begintime=endtime=''
	readytoplay=playrequested=fullwin=false
	visiblestuff=''
	oriwidth=oriheight=0
	constructor:	(@video, @starttime, @stoptime)->
		jvideo=$('video').first()
		#jvideo.hide(); moet werken op ipad!!
		jvideo.css({opacity:0})
		nativedom=$('video').first().get(0)
		jvideo.attr('src', video)
		nativedom.load()
		

		begintime=starttime
		endtime=stoptime
		_this=this
		#zonder klik lukt de echte fullscreen niet
		###jvideo.click ->
			if(nativedom.webkitSupportsFullscreen)
				nativedom.webkitEnterFullScreen()###
		

		settimerange= ->
			
			nativedom.currentTime=begintime/1000
				#duur in ms
			

			#hoe belachelijk is dat; die timeupdate updatet niet elke frame
			#setInterval is ook methode voor SMPTE frameseeking test
			#nativedom.addEventListener('timeupdate', ->
			#	if(typeof endframe!= 'undefined' && endframe)
			#		console.log(nativedom.currentTime)
			#		if(nativedom.currentTime >= endframe/25)
			#			nativedom.pause()
			#)
			#nativedom.play()
			###console.log('endtime is: '+endtime)
			console.log('duration is: '+nativedom.duration*1000)###
			if(endtime<nativedom.duration*1000)
				
				#console.log("doe iets")
				eenint=	setInterval(->
						timecode=nativedom.currentTime
						#console.log(timecode)
						if(timecode>=endtime/1000)
							_this.pause()
							console.log('endtime reached')
							clearInterval(eenint)
					, 20)
				#20: ms ; 25fps is 40ms

		
		initialize= ->
			oriwidth=nativedom.videoWidth
			oriheight=nativedom.videoHeight
			if(typeof begintime== 'undefined' || (!begintime))
				begintime=0 
			if(typeof endtime== 'undefined' || (!endtime))
				endtime=nativedom.duration * 1000

			
			
			if(fullwin)
				if(nativedom.videoWidth/nativedom.videoHeight>$(window).width()/$(window).height())
					nativedom.width=$(window).width()
					#anders kiest hij kleinste - 'auto'?
					nativedom.height=nativedom.width*oriheight/oriwidth
					console.log('width wins')
					console.log (oriwidth+"/"+oriheight+"  vs   "+$(window).width()+"/"+$(window).height())
				else
					console.log('height wins')
					console.log (oriwidth+"/"+oriheight+"  vs   "+$(window).width()+"/"+$(window).height())
					nativedom.height=$(window).height()
					nativedom.width=nativedom.height*oriwidth/oriheight
				#assume parents of video don't take win estate
				visiblestuff=$(':visible').not(jvideo.parents())
				(visiblestuff.not(jvideo)).hide()
				
			#seeking van zodra metadata loaded werkt niet op ios; en blijkbaar bestaat hier geen event voor-> pollen
			###deviceAgent = navigator.userAgent.toLowerCase()
			agentID = deviceAgent.match(/(iphone|ipod|ipad)/) gewoon voor alle agents zo doen
			if(agentID)###
			myinterval=setInterval(->
				ranges=nativedom.seekable
				nrranges=ranges.length
				i=0
				while i< nrranges
					console.log("seekable from: "+ranges.start(i)*1000+" to: "+ranges.end(i)*1000 )
					if(begintime>=ranges.start(i) && begintime<=ranges.end(i)*1000)
						clearInterval(myinterval)
						settimerange()
						readytoplay=true
						#console.log('playrequested is: '+playrequested)
						if(playrequested)
							_this.play()
						
						break
					i++
			,20)




			###else
				console.log(nativedom.seekable)
				settimerange()###
			
			


		nativedom.addEventListener('loadedmetadata', initialize)
		
		
		###enableplaying= ->
				readytoplay=true
				if(playrequested)
					_this.play()
				console.log('data loaded')

		nativedom.addEventListener('loadeddata', enableplaying)	###
		hidestuff=->
			#jvideo.hide()
			jvideo.css({opacity:0})
		nativedom.addEventListener('seeking', hidestuff)
		showstuff=->
			#jvideo.show()
			jvideo.css({opacity:1})
		nativedom.addEventListener('seeked', showstuff)



		reset= ->
			_this.toOriginalSize()
			nativedom.removeEventListener('loadedmetadata', initialize)
		#	nativedom.removeEventListener('loadeddata', enableplaying)
			nativedom.removeEventListener('pause', reset)
			nativedom.removeEventListener('seeking', hidestuff)
			nativedom.removeEventListener('seeked', showstuff)

		nativedom.addEventListener('pause', reset)

	

	play:	() -> 	
				
			#klein beetje vertraging insteken; NEE: beter met event
			###setTimeout(->
				jvideo.show()
				nativedom.play()
			,500)###
			#beter canplay of loadeddata?
			playrequested=true
			if(readytoplay)
				#jvideo.show()
				nativedom.play()
				jvideo.removeAttr("controls") #voor de ipad heb je controls nodig om te beginnen, daarna verwijder je die
			
	onplay: (functie)->
		nativedom.addEventListener('play',functie)			
				
	onplaying: (functie)->		
		nativedom.addEventListener('playing',functie)
	pause:	() ->
			nativedom.pause()
			#console.log(this.getCurrentTime())

	goToStart: () ->
			nativedom.currentTime=begintime/1000

	goToEnd: () ->
			nativedom.currentTime=endtime/1000
	
	goToTime: (msec) ->
			if (msec>begintime)
				if(msec<endtime)
					nativedom.currentTime=msec/1000
				else nativedom.currentTime=endtime/1000
			else nativedom.currentTime=begintime/1000

	

	startFullWindow: ->
		fullwin=true
	toOriginalSize: ->
		if(fullwin)
			nativedom.width=oriwidth
			nativedom.height=oriheight
			if(visiblestuff)
				visiblestuff.show()

	getCurrentTime: ->
		nativedom.currentTime*1000
	
	
			
	
		 
		 	
		 	
 
			

	

	
