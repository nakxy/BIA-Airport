// Intitialize Server
var express = require('express'),http=require('http');
var app = express();
var router = express.Router();
var moment = require('moment');

// Load Script
var crypto = require('crypto');
var md5sum = crypto.createHash('md5');
var bodyParser= require('body-parser');

var aircraftDetails = [];
var finalEmitPackage = [];
 var a1={
		airline:"Air India Express",
		serialNo:"VT-AXE",
		img:"VT-AXE.jpeg",
		logo:"Air_India_Express_Logo.png",
		itenary:[{
			gateId:"1",
			startTime:"02:59",
			endTime:"05:31",
			landingTimeStart:"03:00",
			landingTimeEnd:"03:10",
			taxiTimeStart:"03:11",
			taxiTimeEnd:"03:19",
			deBoardingStart:"03:20",
			deBoardingEnd:"04:20",
			boardingStart:"04:21",
			boardingEnd:"05:10",
			taxitakeOffTimeStart:"05:11",
			taxitakeOffTimeEnd:"05:20",
			takeOffTimeStart:"05:21",
			takeOffTimeEnd:"05:30"
		},
		{
			gateId:"2",
			flightNo:"AI-101",
			destination:"Sharjah",
			startTime:"20:00",
			endTime:"23:30",
			landingTimeStart:"20:00",
			landingTimeEnd:"20:10",
			taxiTimeStart:"20:10",
			taxiTimeEnd:"20:20",
			deBoardingStart:"20:20",
			deBoardingEnd:"21:20",
			boardingStart:"21:20",
			boardingEnd:"22:10",
			taxitakeOffTimeStart:"22:10",
			taxitakeOffTimeEnd:"22:20",
			takeOffTimeStart:"22:20",
			takeOffTimeEnd:"23:30"
		}]
	};
	aircraftDetails.push(a1);


	var a2={
		airline:"Emirates",
		serialNo:"A6-EWC",
		img:"A6-EWC.jpg",
		logo:"Emirates_Logo.png",
		itenary:[{
			gateId:"3",
			startTime:"01:00",
			endTime:"03:30",
			landingTimeStart:"01:00",
			landingTimeEnd:"01:10",
			taxiTimeStart:"01:10",
			taxiTimeEnd:"01:20",
			deBoardingStart:"01:20",
			deBoardingEnd:"02:20",
			boardingStart:"02:20",
			boardingEnd:"03:00",
			taxitakeOffTimeStart:"03:00",
			taxitakeOffTimeEnd:"03:20",
			takeOffTimeStart:"03:20",
			takeOffTimeEnd:"03:30"
		}]
	};

	aircraftDetails.push(a2);

console.log(moment().format('HH:mm'));

var server = app.listen(3000);
var io = require('socket.io').listen(server);

// To get body of a Request
app.use(bodyParser()); 
updateGlobalTimer();
setInterval(updateGlobalTimer, 60000);


function updateGlobalTimer ()
{
	finalEmitPackage.length=0;
	console.log("global timer called");
	//get local time
	//get itenary
	//compare and build response
	// eit response

	var curTime=moment().format('HH:mm');
	for(var x=0; x<aircraftDetails.length; x++){
		var airCraft=aircraftDetails[x];
		for(var i=0;i<airCraft.itenary.length; i++){
			var curTime=moment('HH:mm');
			var st=moment(airCraft.itenary[i].startTime,'HH:mm');
			var et=moment(airCraft.itenary[i].endTime,'HH:mm');
			if(st.isBefore()&&et.isAfter())
			{
				if(moment(airCraft.itenary[i].landingTimeStart,'HH:mm').isBefore() && moment(airCraft.itenary[i].landingTimeEnd,'HH:mm').isAfter()){
					console.log( airCraft.airline + " : Landing");
					sendPackage(airCraft.itenary[i],airCraft.logo, airCraft.serialNo,"Landing");
				}
				else if(moment(airCraft.itenary[i].taxiTimeStart,'HH:mm').isBefore() && moment(airCraft.itenary[i].taxiTimeEnd,'HH:mm').isAfter()){
					console.log( airCraft.airline + " : landed taxing");
					sendPackage(airCraft.itenary[i],airCraft.logo, airCraft.serialNo,"landed taxing");
				}
				else if(moment(airCraft.itenary[i].deBoardingStart,'HH:mm').isBefore() && moment(airCraft.itenary[i].deBoardingEnd,'HH:mm').isAfter()){
					console.log( airCraft.airline + " : deboarding");
					sendPackage(airCraft.itenary[i],airCraft.logo, airCraft.serialNo,"deboarding");
				}
				else if(moment(airCraft.itenary[i].boardingStart,'HH:mm').isBefore() && moment(airCraft.itenary[i].boardingEnd,'HH:mm').isAfter()){
					console.log( airCraft.airline + " : boarding");
					sendPackage(airCraft.itenary[i],airCraft.logo, airCraft.serialNo,"boarding");
				}
				else if(moment(airCraft.itenary[i].taxitakeOffTimeStart,'HH:mm').isBefore() && moment(airCraft.itenary[i].taxitakeOffTimeEnd,'HH:mm').isAfter()){
					console.log( airCraft.airline + " : takeoff taxing");
					sendPackage(airCraft.itenary[i],airCraft.logo, airCraft.serialNo,"takeoff taxing");
				}
				else if(moment(airCraft.itenary[i].takeOffTimeStart,'HH:mm').isBefore() && moment(airCraft.itenary[i].takeOffTimeEnd,'HH:mm').isAfter()){
					console.log( airCraft.airline + " : takeoff");
					sendPackage(airCraft.itenary[i],airCraft.logo, airCraft.serialNo,"Takeoff");
				}
			}
		}
	}
	console.log(" airCraft details to push" + JSON.stringify(finalEmitPackage));
  	io.sockets.emit('airportDetails',finalEmitPackage);

}

function sendPackage(airCraftDetails,logo,serial,status){
	var sendObj={
		flightNo:airCraftDetails.flightNo,
		airCraftSerial:serial,
		airCraftLogo:logo,
		destination:airCraftDetails.destination,
		status:status,
		arrival:airCraftDetails.startTime,
		departure:airCraftDetails.endTime,
		gate:airCraftDetails.gateId
	}
	finalEmitPackage.push(sendObj);
}
// Routes for Hercules

router.use(function(req, res, next) {
	next();	
});
app.use('/', router);
app.use(express.static(__dirname + '/public'));

app.get('/*', function(req, res, next){ 
  res.setHeader('Last-Modified', (new Date()).toUTCString());
  next(); 
});


router.get('/', function(req, res) {
	res.sendfile('public/adminConsole.html');	
});

io.sockets.on('connection', function(socket){
  console.log('a user connected');
  io.sockets.emit('airportDetails',finalEmitPackage);
});

process.on('uncaughtException', function(err) {
	serverError=true;
	serverMessage="DTFS Server is unreachable";
    console.log('Caught exception: ' + err);
});






