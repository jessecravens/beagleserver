/**
 * Module dependencies.
 */
var express = require('express')
  , routes = require('./routes')

// Beaglebone Access
require('bonescript');

ledPin = bone.P8_3;
ledPin2 = bone.P8_4;

setup = function() {
    pinMode(ledPin, OUTPUT);
    pinMode(ledPin2, OUTPUT);
};

var app = express.createServer();
var store  = new express.session.MemoryStore;

// JADE Configuration ////////////////////////////////////////////////////////////////

	app.configure(function(){
	  app.set('views', __dirname + '/views');
	  app.set('view engine', 'jade');
	  app.use(express.bodyParser());
	  app.use(express.methodOverride());
	  app.use(express.cookieParser());
	  app.use(express.session({ secret: 'something', store: store }));
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

	app.post('/motion', function(req, res, next) {
	    
	  console.log(req.body['eventType']);

	    res.send('Motion data collected for '  + req.body['eventType'] + ' event');

	    if (req.body['eventType'] == "motionstart"){
	    	digitalWrite(ledPin2, HIGH);
	    }
	    else if (req.body['eventType'] == "motionend") {
	    	digitalWrite(ledPin, HIGH);
	    }

	});	

app.listen(process.env.PORT || 3333);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);