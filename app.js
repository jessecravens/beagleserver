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

var db = mongoose.createConnection('localhost', 'imageAPI');

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('db opened' , db);
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

		img.name = req.files.file.name;
		img.contentType = req.files.file.type;
		img.binary = fs.readFileSync(req.files.file.path);

		img.save(function (err, img) {
		  	console.log(img);	
			if (err) throw err;
		});

	});

// API server ////////////////////////////////////////////////////////////////////////

app.get('/api', function (req, res) {  
  res.send('ImageAPI is running');  
});

app.get('/api/images', function (req, res){
  return Image.find(function (err, images) {
    if (!err) {
      return res.send(images);
    } else {
      return console.log(err);
    }
  });
});

app.get('/api/images/:id', function (req, res){
  return Image.findById(req.params.id, function (err, image) {
    if (!err) {
      return res.send(image);
    } else {
      return console.log(err);
    }
  });
});

// HTML Routes
	// app.get('/', function(req, res){
	//   res.render("index.html");
	// });
	// app.get('/index.html', function(req, res){
	//   res.render("index.html");
	// });

app.listen(process.env.PORT || 3333);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);