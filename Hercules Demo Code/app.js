var express = require('express'),http=require('http');
var app = express();
var server = app.listen(3070);
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

var adminGroup=[];
var superGroup=[];
var teamGroup=[];


var adminActions=["AssignTeam"," AssignPriority"];
var superActions=[" ScheduleToTeammate"," CallCustomer "];
var teamActions=["SendMail"," GetAccountDetails", "GetDocuments", "GetKnowledgeContent"];

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
	res.sendfile('public/index.html');	
});

router.get('/about', function(req, res) {
	res.sendfile('public/index.html');	
});

router.get('/test', function(req, res) {
	console.log("hello test");
	res.sendfile('public/hercules3.html');	
});

router.get('/terms', function(req, res) {
	res.sendfile('terms.html');	
});

router.get('/register', function(req, res) {
	res.sendfile('public/register.html');	
});

router.get('/hercules', function(req, res) {
	res.sendfile('public/hercules3.html');	
});

router.post('/reg',function(req, res) {
	console.log('processing Register request');
	var username = req.body.username;
		var password = req.body.password;
		var usertype = req.body.usertype;
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
    			"usertype":usertype,
    			"upwd": password 
			};
		db.set(user_id,user_data,function(err, result) { 
			//console.log(err);
			//console.log(result);
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
    			"Hercules_Service_Doctype":"User"
			};
			var db = new couchbase.Connection({ host:'localhost:8091', bucket:'default'},function(err) {
  if (err) {
    // Failed to make a connection to the Couchbase cluster.
    console.log("Couchbase Server Inactive");
    res.send("Servers Inactive");
   // throw err;
    
  }
  else if(headers.length == 0)
  {
  	res.send("Servers Inactive");
  }
  else
  {
  	db.get(user_id,function(err, result) { 
			//console.log(err);
			//console.log(result.value.upwd);
			if(typeof err == 'undefined')
			{
				if(result.value.upwd == password)
				{
					var key=Date.now()+user_id;
					var user_key = crypto.createHash('md5').update(key).digest('hex');
					//console.log(result.value.userPref);
					res.send(user_key+"-"+result.value.usertype);
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
  		}
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
function createDbConnection()
{
	var db = new couchbase.Connection({ host:'localhost:8091', bucket:'default'},function(err) {});
	return db;
}

io.sockets.on('connection',function(socket){
	socket.on('serviceStart',function(msg){

		console.log("socket id is "+socket.id);
		console.log("user of socket is"+msg.user_type);
		if(msg.user_type == "admin")
		{
			var adminObj = {};
			adminObj[msg.user_name] = socket.id;
			adminGroup.push(adminObj);
			socket.join('adminChannel');
		}
		else if(msg.user_type == "super")
		{
			var superObj = {};
			superObj[msg.user_name] = socket.id;
			superGroup.push(superObj);
			socket.join('superChannel');
		}
		else 
		{
			var teamObj = {};
			teamObj[msg.user_name] = socket.id;
			teamGroup.push(teamObj);		
			socket.join('teamChannel');
		}
		console.log("admin group is:"+JSON.stringify(adminGroup));
		console.log("team group is:"+JSON.stringify(teamGroup));
		console.log("super group is:"+JSON.stringify(superGroup));
		//add additional authentication modules
		var user_pref_data=" ";
		console.log('User '+ msg.user_name +' connected:');
		var dbConnection=createDbConnection();
		var start_user_id = "user_pref_"+crypto.createHash('md5').update(msg.user_name).digest('hex');
		var initRespMsg="";
		dbConnection.get(start_user_id,function(err, result){
			if(typeof err != 'undefined')
			{
				initRespMsg={header:headers,headerObj:onjMeta,userPref:"None",user_rename_data:"None"};
			}
			else
			{
				user_pref_data=result.value.userPref;
				user_rename_data=result.value.userRename;
				console.log("userPref is :"+user_pref_data);
				initRespMsg={header:headers,headerObj:onjMeta,userPref:user_pref_data,userRename:user_rename_data};
				console.log(initRespMsg);
			}
			
			io.to(socket.id).emit('initRespMessage',initRespMsg);
			io.to('adminChannel').emit('userMessage','User logged in: '+ msg.user_name); 
			//io.sockets.emit('initRespMessage',initRespMsg);
		});
		
	});

	socket.on('serviceStop',function(msg){
		//console.log('User '+ msg +' disconnected:');
		//console.log(msg.key);
		//console.log(" name is "+msg.userName);
		//console.log(" user pref is " +msg.userPref);
		io.to('adminChannel').emit('userMessage','User logged out: '+ msg.userName); 
		console.log(JSON.stringify(msg));
		console.log("the renamed values are " +msg.userRename);
		var user_type=msg.userType;
		var user_id="";
		user_id = "user_pref_"+crypto.createHash('md5').update(msg.userName).digest('hex');

		var db = new couchbase.Connection({ host:'localhost:8091', bucket:'default'},function(err) {
			//console.log(err);
		});
		var socketHash="";
		if(user_type == "admin")
		{
			for(var socObj=0; socObj<adminGroup.length; socObj++)
			{

				console.log("soc is:"+socObj);
				console.log("soc value is:"+adminGroup[socObj]);
				var socVal=adminGroup[socObj]
				for(obj in socVal)
				{
					if(obj == msg.userName)
					{
						console.log("soc value is:"+obj);
						console.log("soc hash is:"+socVal[obj]);
						socketHash=socVal[obj];
						adminGroup.splice(obj, 1);
					}
				}
			}
		}
		else if(user_type == "super")
		{
			for(var socObj=0; socObj<superGroup.length; socObj++)
			{
				var socVal=superGroup[socObj]
				for(obj in socVal)
				{
					if(obj == msg.userName)
					{
						socketHash=socVal[obj];
						superGroup.splice(obj, 1);
					}
				}
			}
		}
		else
		{
			for(var socObj=0; socObj<teamGroup.length; socObj++)
			{
				var socVal=teamGroup[socObj]
				for(obj in socVal)
				{
					if(obj == msg.userName)
					{
						console.log("soc value is:"+obj);
						console.log("soc hash is:"+socVal[obj]);
						socketHash=socVal[obj];
						teamGroup.splice(obj, 1);
					}
				}
			}
		}
		socket.leave(socketHash);
		console.log("admin group is:"+JSON.stringify(adminGroup));
		console.log("team group is:"+JSON.stringify(teamGroup));
		console.log("super group is:"+JSON.stringify(superGroup));
		var user_pref_data = {
    			"uname": msg.userName,
    			"userPref":msg.userPref,
    			"userRename":msg.userRename,
    			"Hercules_Service_Doctype":"User_Pref"
    		};
		db.set(user_id,user_pref_data,function(err, result) { 
			//console.log(err);
			//console.log(result.value.upwd);
			});
		});
		
		socket.on('actionTaken',function(msg){
			console.log(" action taken for msg:"+msg);
			console.log(" usertype : " + msg.userType);
			console.log(" user: " +msg.userName);
			console.log(" record : " + msg.recordID);
			console.log(" Action : " +msg.userAction);
			console.log(socket.id);
			var socketID=socket.id;
			//
			io.to(socket.id).emit('activityMessageResponse','Service Activated');
			io.to('adminChannel').emit('activityMessage','User: '+ msg.userName +' took action :'+msg.userAction+' on Record: '+msg.recordID); 
			if(msg.userType == "admin")
			{
				console.log("Take Admin Action");
			}
			else if(msg.userType == "super")
			{
				console.log("Take Super Action");
			}
			else
			{
				console.log("Take Teammate Action");
			}




		});
			// get user type
			// search in type group
			// get socket id
			// push response to the socket using : io.sockets.socket(socketid).emit('response');

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
	onjMeta.length=0;
	var jsonObject = JSON.parse(headData);
	//console.log(jsonObject);
	testingStrip(jsonObject);
	stripHeaders(jsonObject);
	//console.log(headers);
	
	
}


var onjMeta=[];
var title="";
var objMeta=[];

function testingStrip(stripObject)
{
	
	for(var obj in stripObject)
	{
		//console.log(" obj :" + obj);
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
				//console.log(" Did push :"+obj+" For Key :"+searchTitle);
				tempArray.push(obj);
			}
	var foo={};
	foo[tempTitle]=tempArray;
	onjMeta.push(foo);
}

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
	var jsonObject = JSON.parse(body);
	var acc_id=jsonObject.Account_ID;
	var recordDate = new Date();
	var adminData={Hercules_Service_Doctype:"Record",Hercules_Service_Headers:onjMeta, Hercules_Service_CreateDate:recordDate, Hercules_Service_Data:jsonObject, Hercules_Service_RecordStatus:"New",headerObj:onjMeta,Hercules_Service_RedordActions:adminActions};
	var teamData={Hercules_Service_Doctype:"Record",Hercules_Service_Headers:onjMeta, Hercules_Service_CreateDate:recordDate, Hercules_Service_Data:jsonObject, Hercules_Service_RecordStatus:"New",headerObj:onjMeta,Hercules_Service_RedordActions:teamActions};
	var superData={Hercules_Service_Doctype:"Record",Hercules_Service_Headers:onjMeta, Hercules_Service_CreateDate:recordDate, Hercules_Service_Data:jsonObject, Hercules_Service_RecordStatus:"New",headerObj:onjMeta,Hercules_Service_RedordActions:superActions};
	io.to('teamChannel').emit('dataMessage',teamData); 
	io.to('adminChannel').emit('dataMessage',adminData); 
	io.to('superChannel').emit('dataMessage',superData); 
	io.to('adminChannel').emit('infoMessage','Record Delivered :'+ acc_id); 
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





