
/**
 * Module dependencies.
 */

var express = require('express');
var redis = require("redis"),
		client = redis.createClient();
client.on("error", function (err) {
    console.log("Error " + err);
});
		
var app = module.exports = express.createServer();
var sockjs = require('sockjs');
var sockjs_opts = {sockjs_url: "http://cdn.sockjs.org/sockjs-0.1.min.js"};

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
		
});



