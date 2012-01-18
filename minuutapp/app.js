
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
    script: 'remote'
  });
});

app.get('/eerstescherm', function(req, res){
  console.log(req.query);
  res.render('eerstescherm', {
    script: 'eerstescherm'
  });
});


// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}


//listen for remote button post
//

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



