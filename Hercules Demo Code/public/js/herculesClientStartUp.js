// Active headers for Dashboard
	var activeHeaders =[];
	// Global headers to check Schema
    var globalheaders =" ";
    // Local data Repository. Removed on refresh
    var localDataObjects = [];
    // Local rename Repository
    var localMappingObjects = [];
    // Local Mapped Active Header ( optional )
    var localMappingActiveHeader = [];
    // Local Recod Data for faster loading
    var localRecordData=[];
    // Local Search Repository
    var searchRecordData=[];
    // Global Page Number 
    var pageNumber=1;
    // Global Notification Counter
    var notificationCounter=0;
    var messageCounter=0;
    // Initial Socet Connection
    var socket = io.connect();
    // Initialize connetion while page load, Create Socket
    var userType=localStorage.getItem("hercules_user_type");

    // First Client function to be called on page load
        function didLoad()
        {
          $('#navBarBtnId').empty(); 
          if(localStorage.getItem("hercules_status_key"))
          {
            // Authenticate user
          	user_details={
          	  status_key:localStorage.getItem("hercules_status_key"),
          	  user_name:localStorage.getItem("hercules_username"),
              user_type:localStorage.getItem("hercules_user_type")
            }
           // Start Socket Service
			     socket.emit('serviceStart',user_details);
           // Navigation Bar for Admin
           var navBarAdmin='<button class="navBtn" onclick="showDash();"> Home</button><button class="navBtn"> Previous</button><button class="navBtn" onclick="showConsole();"> Console</button><button class="navBtn" onclick="logout();"> Log Out </button>';
           // Navigation Bar for Others
           var navBarUser='<button class="navBtn"> Home</button><button class="navBtn"> Previous</button><button class="navBtn" onclick="logout();"> Log Out </button>';
           if(userType == "admin")
           {
             $('#navBarBtnId').append(navBarAdmin); 
           }
           else
           {
              $('#navBarBtnId').append(navBarUser); 
           }
          }
          else
          {
            // Redirect if Invalid Login
            window.location.replace("index.html");
          }
        }


        socket.on('initRespMessage',function(msg)
        {
          //console.log(msg);
          // Initialze Dashboard Headers
          localMappingHeader=msg.header;
          if(msg.header.length == 0)
          {
             // Redirect if Server Error
          	 window.location.replace("index.html");
          }
          else
          {
          	//console.log("User pref from db "+msg.userPref);
            localMappingObjects.length=0;
            var msgData=msg.userRename;
            if(msgData)
            {
              // Set Renamed Variable in Local Object
              for(var u=0;u<msgData.length;u++)
              {  
                var temp=[];
                temp=msgData[u].split("+");
                //console.log("k: "+temp[0]+ " s:"+temp[1]);
                localMappingObjects[temp[0]]=temp[1];
              }
            }
            // Reset Active Headers
         	  localStorage.removeItem("active_headers");
            if(msg.userPref != "None")
            {
              localStorage.setItem("active_headers",msg.userPref);
            }
            // To check Schema Change
          	globalheaders=msg.headerObj;
            // Set Rename variables or Standard Variables
            if(msgData)
            {
              renderHeader(msg.headerObj, "Present");
            }
            else
            {
              renderHeader(msg.headerObj, "None");
            }
          	
          }
        });
        
        // Socket action for Record Recieve Activity
         socket.on('infoMessage',function(msg)
        {
          var rowContents='<tr class="success"><td>'+msg+'</td></tr>';
          $("#herculesConsoleTable").prepend(rowContents);
        });

          // Socket action for Activity 
          socket.on('activityMessage',function(msg)
        {
          var rowContents='<tr class="success"><td>'+msg+'</td></tr>';
          $("#herculesConsoleActivitesTable").prepend(rowContents);
        });

           // Socket action for Record Action Response
          socket.on('activityMessageResponse',function(msg)
        {
          console.log(" server response for action taken :"+msg);
        });

          // Socket action for User Activity
          socket.on('userMessage',function(msg)
        {
          var rowContents='<tr class="success"><td>'+msg+'</td></tr>';
          $("#herculesConsoleUserTable").prepend(rowContents);
        });
          
         // Socket Function to populate the Dashboard 
        socket.on('dataMessage',function(msg)
        {
          	var localheaderData=msg.Hercules_Service_Headers;
          	console.log("globalheaders :" + globalheaders);
          	//console.log("localheaderData :" + localheaderData);
            // Check Schema
            /*
              Yes, reload headers, rerender Dashboard
              No, continue // create function to proceed
            */
          	 if(JSON.stringify(globalheaders) === JSON.stringify(localheaderData))
          	 {
          	 	console.log("Same Header");
          	 	localDataObjects.unshift(msg);
       			  localRecordData.push(msg.Hercules_Service_Data);
       			  setCounter();
              // Render Row in Dashboard 
       			  renderTableBody(msg,"normal");
          	 }
          	 else
          	 {
            /*
              Clear All data and Reset Local Variables
            */
          	 	console.log("different Header");
          	 	$('#templateModal').modal('show');
          	 	$('#modalTemplateChangeID').click(function(){ 
          	 		localDataObjects.length=0;
          	 		localRecordData.length=0;
          	 		localStorage.removeItem("active_headers");
          	 		localStorage.setItem("active_headers","");
          	 		localDataObjects.push(msg);
          	 		activeHeaders.length=0;
                localMappingObjects.length=0;
       			 	  localRecordData.push(msg.Hercules_Service_Data);
       			 	  globalheaders=msg.Hercules_Service_Headers;
       			 	$("#configContent").empty();
       			 	$("#searchPanelContent").empty();
       			 	$("#searchBarContentID").empty();
          			renderHeader(msg.Hercules_Service_Headers);
       			 	  renderTableBody(msg,"normal");
       			 	  notificationCounter=0;;
    				    messageCounter=0;
    				    setCounter();
    				  $('#templateModal').modal('hide');
          	 	});
          	 } 
        });