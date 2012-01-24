
/**
 * Variablen in het geheugen.
 * Zou eigenlijk in een DB moeten staan voor persistentie
 */
var playingOnFirstScreen = {}; //houdt bij wie er wat op het eerste scherm aant spelen is
var shareditems = new Array(); //houdt de gedeelde items bij.

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
 * Module dependencies.
 */

var express = require('express');
var redis = require("redis"),
		client = redis.createClient();
client.on("error", function (err) {
    console.log("Error " + err);
});


var pubnub  = require("pubnub");
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


// Configuration

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

// Routes

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



app.post('/posts/playingonfirstscreen', function(request, response) {
	var now = new Date();
	playingOnFirstScreen[request.body.username] = {
			url: request.body.url,
			startdate: now
	}
    console.log("[" + now + "] " + request.body.username + " is playing " + request.body.url + " on the first screen.");
    
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("ok");
    response.end();
});


app.post('/posts/share', function(request, response) {
	var playObject = playingOnFirstScreen[request.body.username];
	if(playObject != null && playObject.url == request.body.url){
		var now = new Date();
		var endTime = now.getTime() - playObject.startdate.getTime();
		var startTime = 0;
		
		//checken of het een benidorm basterds shotje is:
		var benidormShot = checkBenidormBastardsShotlist(endTime, request.body.url);
		if(benidormShot !== false){
			startTime = benidormShot.start;
			endTime = benidormShot.end;
		}else{
			startTime = endTime - 1000*10; //20 seconden aftrekken
			if(startTime < 0)
				startTime = 0;
		}

		console.log(request.body.username + " shares " + request.body.url + " from " + startTime + " to " + endTime + " milliseconds, with comment: " + request.body.comment)
	
		//toevoegen aan lokale shareditems (zodat nieuwe clients die kunnen opvragen):
		shareditems.push({
			user: request.body.username,
			title: request.body.title,
			url: request.body.url,
			starttime: startTime,
			endtime: endTime,
			comment: request.body.comment
		});
		
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

});

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

app.get('/getshareditems', function(request, response) {
    response.writeHead(200, {'content-type': 'text/json' });
    response.write( JSON.stringify(shareditems) );
    response.end('\n');
});

app.get('/getwhatsplayingonfirstscreen', function(request, response) {
	var playObject = playingOnFirstScreen[request.query.username];
	
    response.writeHead(200, {'content-type': 'text/json' });
    if(playObject != null)
    	response.write( JSON.stringify(playObject) );
    else
    	response.write( JSON.stringify("nothings-playing") );
    response.end('\n');
});




/*
//listen for remote button post
//
//en post naar pubnub
app.post('/', function(req, res){
    console.log(req.body.user);
		console.log(req.body.video);
		client.hmset("vid:2", "starttime", "44455362", "user", req.body.user, "video", req.body.video);
    network.publish({
            channel  : "vtm",
            message  : {"video" : req.body.video},
            callback : function(info){
                if (!info[0]) console.log("Failed Message Delivery")

                console.log(info);
            }
    });
		
});

*/





