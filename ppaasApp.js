var express = require('express'),http=require('http');
var app = express();
var server = app.listen(4047);
var router = express.Router();
var unirest = require('unirest');

var crypto = require('crypto');
var md5sum = crypto.createHash('md5');
var bodyParser= require('body-parser');
var couchbase = require('couchbase');

var options = {
  host: 'https://api.paypal.com',
  path: '/index.html'
};



app.use(bodyParser()); 
app.use('/', router);
app.use(express.static(__dirname + '/public'));

router.use(function(req, res, next) {

	// log each request to the console
	//console.log(req.method, req.url);

	// continue doing what we were doing and go to the route
	next();	
});
//app.use('/', router);
//app.use(express.static(__dirname + '/public'));



router.get('/', function(req, res) {
	unirest.get('https://www.googleapis.com/youtube/v3
	res.send('););	
});
