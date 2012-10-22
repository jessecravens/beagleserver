/**
 * Module dependencies.
 */
var express = require('express')
  , routes = require('./routes')
  , connect = require('connect')
  , mongoose = require('mongoose')
  , fs = require('fs')
  , io = require('socket.io')
  , useragent = require('useragent')
  , gm = require('googlemaps');

var db = mongoose.createConnection('localhost', 'html5-tests');

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('yo');
});

// May want to use a Nested Schema?
// var imageSchema = new mongoose.Schema({
//     obj: { data: Buffer, contentType: String }
// })

var imageSchema = new mongoose.Schema({
  name:    	String,
  contentType: String,
  binary:  Buffer
})

// Image model
var Image = db.model('Image', imageSchema);

// Clients is a list of users who have connected
var clients = [];
var currentClient;

///////////////////////////////////////////////////////////////////// SEND() UTILITY
function send(message) { 
  clients.forEach(function(client) {
      client.send(message);
  });
}

var app = express.createServer();
var store  = new express.session.MemoryStore;

// HTML Configuration
	// app.configure(function(){
	//   app.use(express.static(__dirname + '/public'));
	// 
	//   // disable layout
	//   app.set("view options", {layout: false});
	// 
	//   // make a custom html template
	//   app.register('.html', {
	//     compile: function(str, options){
	//       return function(locals){
	//         return str;
	//       };
	//     }
	//   });
	// });
	// 
	// app.configure('development', function(){
	//   app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	// });
	// 
	// app.configure('production', function(){
	//   app.use(express.errorHandler());
	// });

// JADE Configuration ////////////////////////////////////////////////////////////////
	app.configure(function(){
	  app.set('views', __dirname + '/views');
	  app.set('view engine', 'jade');
	  app.use(express.bodyParser({uploadDir:'./uploads'}));
	  app.use(express.methodOverride());
	  app.use(express.cookieParser());
	  app.use(express.session({ secret: 'something', store: store }));
	  // app.use(function (req, res) {
	  //   res.end('<h2>Hello, your session id is ' + req.sessionID + '</h2>');
	  // });

	  app.use(app.router);
	  app.use(express.static(__dirname + '/public'));
	});

	app.configure('development', function(){
	  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
	});

	app.configure('production', function(){
	  app.use(express.errorHandler()); 
	});

// Jade Routes ////////////////////////////////////////////////////////////////////////
	
	app.get('/', routes.index);
    app.get('/example1', routes.example1);
	app.get('/example2', routes.example2);
	app.get('/example3', routes.example3);

// Img upload ////////////////////////////////////////////////////////////////////////

	app.post('/file-upload', function(req, res, next) {
	    console.log(req.body);
	    console.log(req.files.file.path);
	    console.log('req.files: ' , req.files);
	    res.send('File uploaded at: '  + req.files.file.size + ' bytes');

		var img = new Image;

		//  img.obj.data = fs.readFileSync(req.files.file.path);
		//  img.obj.contentType = req.files.file.type;
		//  img.save(function (err, img) {
		//	  console.log(img);	
		//    if (err) throw err;
		//  }

		img.name = req.files.file.name;
		img.contentType = req.files.file.type;
		img.binary = fs.readFileSync(req.files.file.path);

		//console.log('img: ' , img);
		img.save(function (err, img) {
		  	console.log(img);	
			if (err) throw err;
		});

	});

// API server ////////////////////////////////////////////////////////////////////////

// HTML Routes
	// app.get('/', function(req, res){
	//   res.render("index.html");
	// });
	// app.get('/index.html', function(req, res){
	//   res.render("index.html");
	// });
	// app.get('/scaffolding.html', function(req, res){
	//   res.render("scaffolding.html");
	// });
	// app.get('/base-css.html', function(req, res){
	//   res.render("base-css.html");
	// });
	// app.get('/components.html', function(req, res){
	//   res.render("components.html");
	// });
	// app.get('/javascript.html', function(req, res){
	//   res.render("javascript.html");
	// });
	// app.get('/less.html', function(req, res){
	//   res.render("less.html");
	// });
	// app.get('/download.html', function(req, res){
	//   res.render("download.html");
	// });
	// app.get('/examples.html', function(req, res){
	//   res.render("examples.html");
	// });

app.listen(process.env.PORT || 3333);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

///////////////////////////////////////////////////////////////////// SOCKET.IO SERVER
// var sio = io.listen(app, {"heartbeats": false, "transports": ['websocket'], "close timeout": 100});
// var sio = io.listen(app, {"heartbeats": false, "close timeout": 100});
var sio = io.listen(app);
//console.log(sio.settings);

// var parseCookie = require('connect').utils.cookieParser;
// console.log("parseCookie: " , parseCookie);

//var parseCookie = require('connect').cookieParser;

// var parseCookie = require('connect').utils.parseCookie;

// // var conn = require('connect');
// // console.log("conn: " , conn)
// // console.log("parseCookie: " , parseCookie); 

// sio.set('authorization', function (data, accept) {
//     // check if there's a cookie header
//     if (data.headers.cookie) {

//     	console.log("data.headers.cookie " , data.headers.cookie);
    	
//         // if there is, parse the cookie
//         // console.log("parseCookie: " , parseCookie)
//         //data.cookie = parseCookie('secret-phrase');	
        
        
//         data.cookie = parseCookie(data.headers.cookie);
//         console.log("data.cookie : " + data.cookie);
//         // note that you will need to use the same key to grad the
//         // session id, as you specified in the Express setup.
//         data.sessionID = data.cookie['express.sid'];

//         console.log("data.sessionID: " , data.sessionID);

//     } else {
//        // if there isn't, turn down the connection with a message
//        // and leave the function.
//        return accept('No cookie transmitted.', false);
//     }
//     // accept the incoming connection
//     accept(null, true);
// });



///////////////////////////////////////////////////////////////////// SOCKET.IO WEB SOCKETS
sio.sockets.on('connection', function(client) {
  // For each connection made add the client to the array of clients.
  console.log('server connection EVENT FIRED');
  console.log('CLIENT connected'); 
  console.log('CLIENT ID: ' + client.id + ', TRANSPORT MECHANISM: ' + sio.transports[client.id].name);

///////////////////////////////////////////////////////////////////// BUILD CLIENTS LIST
  clients.push(client);
  console.log(clients.length);

  send(JSON.stringify({"clients": clients.length}));

  // log each clients id
  clients.forEach(function(client) {
    // console.log('CLIENT ID: ' + client.id);
    // console.log(client);
  });


  // We declare that the first message contains the SID.
  // This is where we handle the first message.
  client.once('message', function(sid) {

  	console.log("getting a session on the first message")
    store.get(sid, function(err, session) {
      if (err || !session) {
        // Do some error handling, bail.
        return;
      }

      // Any messages following are your chat messages.
      // client.on('message', function(message) {
      //   if (message.email === session.email) {
      //     socket.broadcast(message.text);
      //   }
      // });


	  client.on('disconnect', function () {
	 	console.log('disconnect EVENT FIRED');
		// console.log(clients.length)
		var index = clients.indexOf(client.id);
		// console.log(index)
		// clients.splice(index, 1);
		// console.log(clients.length);
	  });

	  client.on('geo', function(data) {
		console.log('geo MESSAGE received from: ' + client.id);
		currentClient = client.id;
		//console.log(data);
		var loc = data.lat + "," + data.long
		//console.log(loc)
		gm.reverseGeocode(loc, function(err, data){

		  var city = data.results[0].address_components[2].long_name;
		  //console.log(city);
		  //console.log("client within gm : " , client);
		  //console.log("this within gm : " , this);
		  var state = data.results[0].address_components[4].long_name;
		  var loc = city + ", " + state; 
		  send(JSON.stringify({ "loc": loc, "clientId":  currentClient}));
		});
	  });
    });
  });


});