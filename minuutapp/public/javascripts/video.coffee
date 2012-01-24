class @Video
	#concept of frame is unknown to html5 video; everything in seconds->milliseconds
	jvideo=nativedom=begintime=endtime=''
	readytoplay=playrequested=fullwin=false
	visiblestuff=''
	oriwidth=oriheight=0
	constructor:	(@video, @starttime, @stoptime)->
		jvideo=$('video').first()
		#jvideo.hide(); moet werken op ipad!!
		nativedom=$('video').first().get(0)
		jvideo.attr('src', video)
		nativedom.load()
		

		begintime=starttime
		endtime=stoptime
		_this=this
		#zonder klik lukt de echte fullscreen niet
		jvideo.click ->
			if(nativedom.webkitSupportsFullscreen)
				nativedom.webkitEnterFullScreen()
			
		#*: testje over hoe andere member functions oproepen
		
		initialize= ->
			oriwidth=nativedom.videoWidth
			oriheight=nativedom.videoHeight
			#*:rest testje		
			#	_this.toOriginalSize()

			#verhuisd naar boven de loadedmetadata listener
			#jvideo.bind 'click',(event) ->
			#	console.log('klikkerdeklik')
	 			#dit werkt enkel op klik (kan je niet forceren)
				#eens je fullscreen bent, zit jvideo niet meer vanboven-> escape
				#if(nativedom.webkitDisplayingFullscreen)
				#	nativedom.webkitExitFullscreen()
		
				#else
			
			#	nativedom.webkitEnterFullScreen()
			
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
				


			if(typeof begintime!= 'undefined' && begintime)
				#console.log(nativedom.currentTime)
				#console.log(beginframe/25)
				nativedom.currentTime=begintime/1000
				#duur in ms
			else 
				begintime=0 

			#hoe belachelijk is dat; die timeupdate updatet niet elke frame
			#setInterval is ook methode voor SMPTE frameseeking test
			#nativedom.addEventListener('timeupdate', ->
			#	if(typeof endframe!= 'undefined' && endframe)
			#		console.log(nativedom.currentTime)
			#		if(nativedom.currentTime >= endframe/25)
			#			nativedom.pause()
			#)
			if(typeof endtime!= 'undefined' && endtime)
				
				#console.log("doe iets")
				setInterval(->
					timecode=nativedom.currentTime
					#console.log(timecode)
					if(timecode>=endtime/1000)
						_this.pause()
				, 20)
				#20: ms ; 25fps is 40ms
			else 
				endtime=nativedom.duration * 1000
				console.log('duration is: '+endtime)

		nativedom.addEventListener('loadedmetadata', initialize)
		
		
		enableplaying= ->
				readytoplay=true
				if(playrequested)
					_this.play()
				console.log('data loaded')

		nativedom.addEventListener('loadeddata', enableplaying)	





		reset= ->
			_this.toOriginalSize()
			nativedom.removeEventListener('loadedmetadata', initialize)
			nativedom.removeEventListener('loadeddata', enableplaying)
			nativedom.removeEventListener('pause', reset)

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
				jvideo.show()
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
	
	
			
	
		 
		 	
		 	
 
			

	

	
