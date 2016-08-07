// Intitialize Server
var express = require('express'),http=require('http');
var app = express();
var router = express.Router();
var moment = require('moment');

// Load Script
var crypto = require('crypto');
var md5sum = crypto.createHash('md5');
var bodyParser= require('body-parser');

var aircraftDetails = '';
var finalEmitPackage = [];

var flightInfo= require(process.cwd() + '/flightData/flights');
	aircraftDetails=flightInfo.getFlightDetails();

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
	for(var x=0; x<aircraftDetails.length; x++){
		aircraftDetails[x].itenary=flightTimeSpliter(aircraftDetails[x]);
	}
	setCurrentAirportFLight();
}

function flightTimeSpliter(flightData){
	var arrTime = moment(flightData.startTime,'HH:mm');
	var itenary={}
	itenary.landingTimeStart=moment(arrTime);
	itenary.landingTimeEnd=moment(arrTime).add(5, 'm');
	itenary.taxiTimeStart=moment(arrTime).add(5, 'm');
	itenary.taxiTimeEnd=moment(arrTime).add(10, 'm');
	itenary.deBoardingStart=moment(arrTime).add(10, 'm');
	itenary.deBoardingEnd=moment(arrTime).add(50, 'm');
	itenary.boardingStart=moment(arrTime).add(50, 'm');
	itenary.boardingEnd=moment(arrTime).add(110, 'm');
	itenary.taxitakeOffTimeStart=moment(arrTime).add(110, 'm');
	itenary.taxitakeOffTimeEnd=moment(arrTime).add(115, 'm');
	itenary.takeOffTimeStart=moment(arrTime).add(115, 'm');
	itenary.takeOffTimeEnd=moment(arrTime).add(120, 'm');
	return itenary;
}

function setCurrentAirportFLight(){
	var curTime=moment().format('HH:mm');
	for(var x=0; x<aircraftDetails.length; x++){
		var airCraft=aircraftDetails[x];
			var curTime=moment('HH:mm');
			var st=moment(airCraft.startTime,'HH:mm');
			var et=moment(airCraft.endTime,'HH:mm');
			if(st.isBefore() && et.isAfter())
			{
				if(moment(airCraft.itenary.landingTimeStart).isBefore() && moment(airCraft.itenary.landingTimeEnd).isAfter()){
					console.log( airCraft.airline + " : Landing");
					sendPackage(airCraft,"Landing");
				}
				else if(moment(airCraft.itenary.taxiTimeStart).isBefore() && moment(airCraft.itenary.taxiTimeEnd).isAfter()){
					console.log( airCraft.airline + " : Landed Taxing");
					sendPackage(airCraft,"Landed Taxing");
				}
				else if(moment(airCraft.itenary.deBoardingStart).isBefore() && moment(airCraft.itenary.deBoardingEnd).isAfter()){
					console.log( airCraft.airline + " : Deboarding");
					sendPackage(airCraft,"Deboarding");
				}
				else if(moment(airCraft.itenary.boardingStart).isBefore() && moment(airCraft.itenary.boardingEnd).isAfter()){
					console.log( airCraft.airline + " : Boarding");
					sendPackage(airCraft,"Boarding");
				}
				else if(moment(airCraft.itenary.taxitakeOffTimeStart).isBefore() && moment(airCraft.itenary.taxitakeOffTimeEnd).isAfter()){
					console.log( airCraft.airline + " : Takeoff Taxing");
					sendPackage(airCraft,"Takeoff Taxing");
				}
				else if(moment(airCraft.itenary.takeOffTimeStart).isBefore() && moment(airCraft.itenary.takeOffTimeEnd).isAfter()){
					console.log( airCraft.airline + " : Takeoff");
					sendPackage(airCraft,"Takeoff");
				}
			}
		}
	console.log(" airCraft details to push" + JSON.stringify(finalEmitPackage));
  	io.sockets.emit('airportDetails',finalEmitPackage);
}

function sendPackage(airCraftDetails,status){
	var sendObj={
		flightNo:airCraftDetails.flightNo,
		operator:airCraftDetails.operator,
		airCraftSerial:airCraftDetails.serialNo,
		airCraftLogo:airCraftDetails.logo,
		aircraftImg:airCraftDetails.img,
		destination:airCraftDetails.destination,
		status:status,
		arrival:airCraftDetails.startTime,
		origin:airCraftDetails.origin,
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






