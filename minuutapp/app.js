
/**
 * hardcoded shotlist voor Benidorm Basterds 2x07:
 */
var benidormBasterdsShotlist = new Array();
benidormBasterdsShotlist.push({start:0, end:33920});
benidormBasterdsShotlist.push({start:33960, end:54160});
benidormBasterdsShotlist.push({start:54200, end:69480});
benidormBasterdsShotlist.push({start:69520, end:95880});
benidormBasterdsShotlist.push({start:95920, end:120520});
benidormBasterdsShotlist.push({start:120560, end:150120});
benidormBasterdsShotlist.push({start:150160, end:187240});
benidormBasterdsShotlist.push({start:187280, end:205960});
benidormBasterdsShotlist.push({start:206000, end:234280});
benidormBasterdsShotlist.push({start:234320, end:285160});

/**
 * Module dependencies:
 */
var express = require('express');
var redis = require("redis");
var _und = require("underscore"); //underscore gebruiken, maar blijkbaar is "_" al gebruikt 
var pubnub = require("pubnub");


/**
 * client voor Redis opvragen:
 */
var redisClient = redis.createClient();

/**
 * fouten van Redis naar console schrijven:
 */
redisClient.on("error", function (err) {
    console.log("Error " + err);
});

/**
 * Pubnub initialiseren (key is van Matthias):
 */
var pubnubNetwork = pubnub.init({
    publish_key   : "pub-7b2681ab-27d3-47dc-8278-15aa1d8bfb57",
    subscribe_key : "sub-6bee67b8-41be-11e1-99f4-754603d9dc6f",
    secret_key    : "",
    ssl           : false,
    origin        : "pubsub.pubnub.com"
});


//sockjs alternatief
/*var sockjs = require('sockjs');

var sockjs_opts = {sockjs_url: "http://cdn.sockjs.org/sockjs-0.2.min.js"};
var broadcast={}
var echo = sockjs.createServer(sockjs_opts);
echo.on('connection', function(conn) {
    broadcast[conn.id]=conn; //connecties bij houden
    conn.on('data', function(message) {
        conn.write(message);
        console.log(message)
        for(var id in broadcast){
          broadcast[id].write("got the stupid message")
        }
    });
    conn.on('close', function() {});
});*/
		
var app = module.exports = express.createServer();


/**
 * Configuration:
 */
app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(require('stylus').middleware({ src: __dirname + '/public' }));
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
	app.use(express.errorHandler()); 
});


/**
 * Routes:
 */
app.get('/', function(req, res){
	res.render('index', {
		script: 'index'
	});
});

app.get('/eerstescherm', function(req, res){
	console.log(req.query);
	res.render('eerstescherm', {
		script: 'eerstescherm'
	});
});

app.get('/pubnubtest', function(req, res){
	res.render('pubnubtest', {
		script: 'pubnubtest'
	});
});

/*app.get('/vidtest', function(req, res){
  res.render('vidtest', {
    script: 'vidtest'
  });
});*/

//indien sockjs
//echo.installHandlers(app, {prefix:'[/]echo'});

// Only listen on $ node app.js

if (!module.parent) {
	app.listen(3000);
	console.log("Express server listening on port %d", app.address().port);
}

/**
 * POSTs:
 */
app.post('/posts/playingonfirstscreen', function(request, response) {
	var now = new Date();
  
	redisClient.set(request.body.username, JSON.stringify({url:request.body.url, startdateMiliseconds: now.getTime()}), function(){
		console.log("stored first screen for: "+request.body.username);
	});
	redisClient.expire(request.body.username, 3600*2*1000); //voor de gein: expire op programma; duurt max. 2u
	
	console.log("[" + now + "] " + request.body.username + " is playing " + request.body.url + " on the first screen.");
    
	//"ok" terugsturen naar browser:
	response.writeHead(200, {"Content-Type": "text/plain"});
	response.write("ok");
	response.end();
});

app.post('/posts/share', function(request, response) {
	var playObject=null;
	redisClient.get(request.body.username, function(err, data){ 
		if( !data ) {console.log("nothing appears to be playing");}
		else{
			playObject=JSON.parse(data);
			if(playObject != null && playObject.url == request.body.url){
				var now = new Date();
				toenMiliseconds = playObject.startdateMiliseconds;
				var endTime = now.getTime() - toenMiliseconds;
				var startTime = 0;
        
				//checken of het een benidorm basterds shotje is:
				var benidormShot = checkBenidormBastardsShotlist(endTime, request.body.url);
				if(benidormShot !== false){
					startTime = benidormShot.start;
					endTime = benidormShot.end;
				}else{
					startTime = endTime - 1000*10; //10 seconden aftrekken
					if(startTime < 0)
						startTime = 0;
				}

				console.log(request.body.username + " shares " + request.body.url + " from " + startTime + " to " + endTime + " milliseconds, with comment: " + request.body.comment)
      
				redisClient.rpush("sharedlist", JSON.stringify({user: request.body.username, title: request.body.title,url: request.body.url,starttime: startTime, endtime: endTime,comment: request.body.comment}));
				//enkel laatste 20 overhouden, rest deleten we
				redisClient.ltrim("sharedlist", -20,-1); //laatste 20
        
		        //doorsturen naar geconnecteerde client via pubnub:
		        pubnubNetwork.publish({
		              channel: "newshareditems",
		              message: {
		                user: request.body.username,
		                title: request.body.title,
		                url: request.body.url,
		                starttime: startTime,
		                endtime: endTime,
		                comment: request.body.comment
		              }
		        });
			}
      
			response.writeHead(200, {"Content-Type": "text/plain"});
			response.write("ok");
			response.end();
	    }
	});//END redisClient.get
});

/**
 * Hulpfunctie om te checken of een tijdstip in een shot van Benidorm Bastards valt:
 * @param time: tijd in miliseconden.
 * @param moviename: naam om te controlere of het wel om Benidorm Bastards gaat.
 * @returns object:{start: startime in ms, end: endtime in ms}.
 */
function checkBenidormBastardsShotlist(time, moviename){
	if(moviename.indexOf("benidorm") == -1)
		return false;
	
	for(var i=0; i<benidormBasterdsShotlist.length; i++){
		var shot = benidormBasterdsShotlist[i];
		if(shot.start < time && time < shot.end){
			return shot;
		}
	}
	
	return false;
}

/**
 * GETs:
 */
app.get('/getshareditems', function(request, response) {
	redisClient.lrange("sharedlist", 0, -1, function(err, data){ //0->-1= entire list
    
		var itemlist = new Array();
		 _und.each(data, function(object){
			 itemlist.push(JSON.parse(object));
		 });
	
	    //items terugsturen naar de browser:
	    response.writeHead(200, {'content-type': 'text/json' });
	    response.write(JSON.stringify(itemlist)); 
	    response.end('\n');
  });
    
});

app.get('/getwhatsplayingonfirstscreen', function(request, response) {
	console.log("user: " + request.query.username)
	
	redisClient.get(request.query.username, function(err, data){ 
		response.writeHead(200, {'content-type': 'text/json' });
       
		if(data)
			response.write(data);
		else 
			response.write(JSON.stringify("nothings-playing")); //moet JSON zijn, anders doet $.getJSON() in de browser moeilijk
    
		response.end('\n');
	});
})

