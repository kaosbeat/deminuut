
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
var network = pubnub.init({
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

var playingOnFirstScreen = {};

app.post('/posts/playingonfirstscreen', function(request, response) {
	var now = new Date();
	playingOnFirstScreen[request.body.username] = {
			movieurl: request.body.movieurl,
			startdate: now
	}
    console.log("[" + now + "] " + request.body.username + " is playing " + request.body.movieurl + " on the first screen.");
    
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("ok");
    response.end();
});


app.post('/posts/share', function(request, response) {
	var playObject = playingOnFirstScreen[request.body.username];
	if(playObject != null && playObject.movieurl == request.body.movieurl){
		var now = new Date();
		var playtimeInMilliseconds = now.getTime() - playObject.startdate.getTime();
		var beginTimeInMilliseconds = playtimeInMilliseconds - 1000*20; //20 seconden aftrekken
		
		var endFrame = 25/1000 * playtimeInMilliseconds;
		var beginFrame =  25/1000 * beginTimeInMilliseconds;
		console.log("sharing " + playObject.movieurl + " at " + endFrame + "frames, with comment: " + request.body.comment)
	}
	
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("ok");
    response.end();

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





