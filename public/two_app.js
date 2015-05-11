var express = require('express'),http=require('http');
var app = express();
var server = app.listen(3050);
var router = express.Router();

var crypto = require('crypto');
var md5sum = crypto.createHash('md5');
var bodyParser= require('body-parser');
var couchbase = require('couchbase');

var Stomp = require('stomp-client');
var client = new Stomp('127.0.0.1', 61613, ' ', ' ');
var io = require('socket.io').listen(server);

var destination = '/topic/oneT';
var serverError = false;
var serverMessage = "Server Running";
var headers=[];

app.use(bodyParser()); 


router.use(function(req, res, next) {

	// log each request to the console
	//console.log(req.method, req.url);

	// continue doing what we were doing and go to the route
	next();	
});
app.use('/', router);
app.use(express.static(__dirname + '/public'));

app.get('/*', function(req, res, next){ 
  res.setHeader('Last-Modified', (new Date()).toUTCString());
  next(); 
});

router.get('/', function(req, res) {
	res.sendfile('index.html');	
});

router.get('/about', function(req, res) {
	res.sendfile('index.html');	
});

router.get('/test', function(req, res) {
	res.sendfile('public/hercules3.html');	
});

router.get('/register', function(req, res) {
	res.sendfile('register.html');	
});


router.get('/hercules', function(req, res) {
	res.sendfile('hercules.html');	
});

router.post('/reg',function(req, res) {
	console.log('processing Register request');
	var username = req.body.username;
		var password = req.body.password;
		var user_id = crypto.createHash('md5').update(username).digest('hex');
		var db = new couchbase.Connection({ host:'localhost:8091', bucket:'default'},function(err) {
  if (err) {
    // Failed to make a connection to the Couchbase cluster.
    console.log("Couchbase Server Inactive");
    res.send("Servers Not Reachable");
   // throw err;
    
  }});
		var user_data = {
    			"uname": username,
    			"userPref": "None",
    			"upwd": password 
			};
		db.set(user_id,user_data,function(err, result) { 
			console.log(err);
			console.log(result);
			res.send("valid");
			res.end();
		});
});

router.post('/login',function(req, res) {
		console.log('processing Log-in request');
		var username = req.body.username;
		var password = req.body.password;
		var user_id = crypto.createHash('md5').update(username).digest('hex');
		var user_data = {
    			"uname": username,
    			"upwd": password,
    			"doctype":"user"
			};
			var db = new couchbase.Connection({ host:'localhost:8091', bucket:'default'},function(err) {
  if (err) {
    // Failed to make a connection to the Couchbase cluster.
    console.log("Couchbase Server Inactive");
    res.send("Servers Not Reachable");
   // throw err;
    
  }});
		db.get(user_id,function(err, result) { 
			console.log(err);
			//console.log(result.value.upwd);
			if(typeof err == 'undefined')
			{
				if(result.value.upwd == password)
				{
					var key=Date.now()+user_id;
					var user_key = crypto.createHash('md5').update(key).digest('hex');
					console.log(result.value.userPref);
					res.send(user_key);
				}
				else
				{
					res.send("invalid_info");
				}
			}
			else
			{
				res.send("invalid_info");
			}
		res.end();
		});
});

/*
io.sockets.on('connection',function(socket){
	console.log('a new user connected');
	socket.on('message',function(msg){
		console.log('message recieved is'+msg);
		io.sockets.emit('firstHeadResponse',headers);});
	});

/*/

io.sockets.on('connection',function(socket){
	socket.on('serviceStart',function(msg){
		//add additional authentication modules
		console.log('User '+ msg +' connected:');
		var initRespMsg={header:headers,headerObj:onjMeta};
		io.sockets.emit('initRespMessage',initRespMsg);
	});

	socket.on('serviceStop',function(msg){
		console.log('User '+ msg +' disconnected:');
		console.log(msg.key);
		console.log(" name is "+msg.userName);
		console.log(msg.userPref);
		/*var user_id="";
		var db = new couchbase.Connection({ host:'localhost:8091', bucket:'default'},function(err) {
			user_id = crypto.createHash('md5').update(msg.userName).digest('hex');
		});
		db.get(user_id,function(err, result) { 
			console.log(err);
			//console.log(result.value.upwd);
			if(typeof err == 'undefined')
			{
				var pass=result.value.upwd;
				var userPref=msg.userPref;
				var user_data = {
    			"uname": msg.userName,
    			"upwd": pass,
    			"userPref":userPref,
    			"doctype":"user"
			}
				db.set(user_id,user_data,function(err, result) { 
			});
			}

	});*/
	});
});





client.connect(function(sessionId) {
	
	serverError="Server Running";
    client.subscribe(destination, function(body, headers) {
    		getHeader(body);
      broadcastMethod(body,headers);
  		});
    });

function getHeader(headData)
{
	var jsonObject = JSON.parse(headData);
	//console.log(jsonObject);
	jsonObject.doctype="record";
	testingStrip(jsonObject);
	//console.log("on meta open is \n" +onjMeta);
	//console.log("on meta one is \n" +onjMeta["List_NBA_For_Account"]);
	//console.log("on meta two is \n" +onjMeta["Opportunity"]);
	//console.log(" the array is "+ onjMeta);
	//console.log(JSON.stringify(onjMeta["List_NBA_For_Account"],null,4));
	/*for(var s=0;s < onjMeta.length ; s++)
	{
		var val= onjMeta[s];
		console.log(" First hierarchy " + val);
		if(typeof(onjMeta[val]) == "object")
		{				
			console.log(" second hierarchy " +  onjMeta[val]);
			
		}
	}*/
	//headerPrinter(onjMeta);
	stripHeaders(jsonObject);
	//console.log(headers);
	
}
/*
function headerPrinter(headerObj)
{
	for(var s=0;s < headerObj.length ; s++)
	{
		var val= onjMeta[s];
		console.log(val);
		if(typeof(onjMeta[val]) == "object")
		{	
			console.log(" the object to shift is "+onjMeta[val]);			
			//headerPrinter2(onjMeta[val]);
		}
	}
}


function headerPrinter2(header)
{
	for(var s=0;s < header.length ; s++)
	{
		var val= header[s];
		console.log(val);
		if(typeof(onjMeta[val]) == "object")
		{	
		//	console.log(" the object to shift is "+onjMeta[val]);			
			//headerPrinter3(header[val]);
		}
	}
}
*/

var onjMeta=[];
var title="";
var objMeta=[];

function testingStrip(stripObject)
{
	
	for(var obj in stripObject)
	{
		console.log(" obj :" + obj);
		if(onjMeta.indexOf(obj) == -1)
		{
			if(typeof(stripObject[obj]) == 'object')
        	{
        		title = obj;
				nextLevel(stripObject[obj]);
        	}
        	else
        	{
        		onjMeta.push(obj);
        	}
		}
	}
	//onjMeta.push({"base":objMeta});
}	
	
	function nextLevel(stripObject)
	{
		if(typeof(stripObject) == "object")
		{
			//console.log(" the strip "+ stripObject + " for title " + title);
			if(stripObject.length >1)
			{
				//console.log("strip search");
				var localVal=stripObject[0];
				//console.log(Object.getOwnPropertyNames(localVal));
				addObjOnTitle(title,localVal);
				for(obj in localVal)
				{
					//console.log(Object.getOwnPropertyNames(obj));
					//console.log(" the obj is "+ obj + " type is "+ typeof(localVal[obj]));
					if(typeof(localVal[obj])== "object")
					{
						title=obj;
						nextLevel(localVal[obj]);
					}
				}
			}
			else
			{
				//console.log(Object.getOwnPropertyNames(stripObject));
				//console.log("title is "+title);
				addObjOnTitle(title,stripObject);    
			}
		}
	}

function addObjOnTitle(searchTitle,addObject)
{
	tempArray=[];
	var tempTitle=searchTitle;
	for(obj in addObject)
			{
				console.log(" Did push :"+obj+" For Key :"+searchTitle);
				tempArray.push(obj);
			}
	var foo={};
	foo[tempTitle]=tempArray;
	onjMeta.push(foo);
	/*console.log("#########################");
	var a = searchArray.indexOf(searchTitle);
	console.log(a);
	if(a != -1)
	{
		searchArray[searchTitle]=[];
		for(obj in addObject)
			{
				console.log(" Did push :"+obj+" For Key :"+searchTitle);
				searchArray[searchTitle].push(obj);
			}
	}
	else
	{	
		console.log("not found " + searchTitle);
		for(var sa=0; sa<searchArray.length ; sa++)
		{
			var val=searchArray[sa];
			console.log(typeof(val) + "  -:-" + val);
			//addObjOnTitle(searchArray[sa],searchTitle,addObject);
		}
	}*/
}
	
	/*for(var sa=0; sa<searchArray.length ; sa++)
	{
		if(searchArray[sa] == searchTitle)
		{
			console.log(" found sa"+ searchArray[sa])
			searchArray[searchTitle]=[];
			for(obj in addObject)
			{
				searchArray[searchTitle].push(obj);
			}
		}
	}
	for(var sa=0; sa<searchArray.length; sa++)
	{
		var a = fruits.indexOf("Apple");
			//findTitle(searchArray[sa],searchTitle);
		
	}*/

function stripHeaders(stripObject)
{
	for(var obj in stripObject)
	{
		if(headers.indexOf(obj) == -1)
		{
			if(isNaN(obj))
    		{
				headers.push(obj);
			}
		}
		if(stripObject.hasOwnProperty(obj))
		{
			
    		var val=stripObject[obj];
    		if(typeof val == 'object')
    		{
    			stripHeaders(val);
    		}
    	}
    }
}


function broadcastMethod(body,headers)
{
	io.emit('dataMessage',body);
	/*var acc_id=jsonObject.Account_ID;
	var db = new couchbase.Connection({ host:'localhost:8091', bucket:'default'},function(err) {});
		db.set(acc_id,jsonObject,function(err, result) { 
			console.log(err);
			console.log(result);
			io.emit('respMessage',jsonObject);
		});*/
	
	//console.log("In broadcastmethod");
	//console.log("body \n"+body);
	//console.log("headers"+headers);

	//update Couch DB
	//use Timestamp as id
	//pass message
	//var jsonObject = JSON.parse(body);
	//io.emit('respMessage',jsonObject);

}

process.on('uncaughtException', function(err) {
	serverError=true;
	serverMessage="ActiveMQ Server is unreachable";
  console.log('Caught exception: ' + err);
  //console.log("ActiveMQ Server Down")
});

/*
setTimeout(function() {
  console.log('This will still run.');
}, 500);
*/





