
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , mongoose = require('mongoose')
  , fs = require('fs');

var db = mongoose.createConnection('localhost', 'html5-tests');

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('yo');
});


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

	// app.post('/', function(req, res, next){

	//   // connect-form adds the req.form object
	//   // we can (optionally) define onComplete, passing
	//   // the exception (if any) fields parsed, and files parsed
	//   req.form.complete(function(err, fields, files){
	//     if (err) {
	//       next(err);
	//     } else {
	//       console.log('\nuploaded %s to %s'
	//         ,  files.image.filename
	//         , files.image.path);
	//       res.redirect('back');
	//     }
	//   });

	//   // We can add listeners for several form
	//   // events such as "progress"
	//   req.form.on('progress', function(bytesReceived, bytesExpected){
	//     var percent = (bytesReceived / bytesExpected * 100) | 0;
	//     process.stdout.write('Uploading: %' + percent + '\r');
	//   });
	// });

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

	// app.post('/file-upload', function(req, res) {
	//     // get the temporary location of the file
	//     var tmp_path = req.files.file.path;
	//     // set where the file should actually exists - in this case it is in the "images" directory
	//     var target_path = './public/images/' + req.files.file.name;

	//     console.log(fs);
	//     // move the file from the temporary location to the intended location
	//     fs.rename(tmp_path, target_path, function(err) {
	//         if (err) throw err;
	//         // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
	//         fs.unlink(tmp_path, function() {
	//             if (err) throw err;
	//             res.send('File uploaded to: ' + target_path + ' - ' + req.files.file.size + ' bytes');
	//         });
	//     });
	// });


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