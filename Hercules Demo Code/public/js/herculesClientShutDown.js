//Called when Browser is closed or Manually Logged Out

function logout()
{
  // object with parameters for Server Update
  var serviceStopObj= new Object();
  // Appending renamed Object. Will be split while Loading the dashboard
  var tempObject=[];  
  for( obj in localMappingObjects)
  {
    var objtemp=obj+"+"+localMappingObjects[obj];
    tempObject.push(objtemp);
  }
  serviceStopObj.key=localStorage.getItem("status_key");
  serviceStopObj.userName=localStorage.getItem("hercules_username")
  serviceStopObj.userPref=activeHeaders;
  serviceStopObj.userType=localStorage.getItem("hercules_user_type")
  serviceStopObj.userRename=tempObject;
  // Socket event to update parameters
  socket.emit('serviceStop',serviceStopObj);
  // Wipe localstorage data
  localStorage.removeItem("hercules_status_key");
  localStorage.removeItem("hercules_username");
  localStorage.removeItem("hercules_user_type");
  //Disconnect Socket
  socket.disconnect();
  // Redirect to index page
  window.location.href="/";
}