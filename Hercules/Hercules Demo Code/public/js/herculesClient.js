// Client Animation Jquery Functions

// GLobal Variable to keep track of Panel Movements. Closure can be used to Hoist these Variables.

var searchFlag=0;
var configFlag=0;

		$(document).ready(function(){

      // Configuration Panel
			$('#configbtn').click(function() {
				if(configFlag == 0)
				{
   				$("#configPanelID").animate({left:'0px'}); configFlag=1;
          $("#herculesDash").animate({ marginLeft: '250px'});
   			}
   			else
   			{
   				$("#configPanelID").animate({left:'-200px'}); configFlag=0;
          $("#herculesDash").animate({ marginLeft: '50px'});
   			}

      // Search Panel
      });
			$("#searchbtn").click(function(){
				if(searchFlag == 0)
				{
   				$("#searchPanelID").animate({right:'0px'});searchFlag=1;
          $("#herculesDash").animate({ marginRight: '250px'});
   			}
   			else
   			{
   				$("#searchPanelID").animate({right:'-200px'});searchFlag=0;
          $("#herculesDash").animate({ marginRight: '50px'});
   			}
    					
    	});

      // Notification Counter Reset
      $('#notificationPanelID').click(function(){ 
          notificationCounter=0;
          $("#notificationPanel").html(" ");
          document.title = "PayPal Hercules";
    });
     
      // Admin Console show/hide method
      $('#consoleBtnId').click(function() {
         $("#consoleDivID").show();
         $("#activityDivID").hide();
         $("#userDivID").hide();
         $("#monitorDivID").hide();
      });

      // Admin Activity show/hide method
      $('#activityBtnId').click(function() {
        $("#activityDivID").show();
        $("#consoleDivID").hide();
        $("#userDivID").hide();
        $("#monitorDivID").hide();
      });

      // Admin Monitor show/hide method
      $('#monitorBtnId').click(function() {
        $("#consoleDivID").hide();
        $("#activityDivID").hide();
        $("#userDivID").hide();
        $("#monitorDivID").show();
      });

      // Admin Users Console show/hide method
        $('#userBtnId').click(function() {
        $("#consoleDivID").hide();
        $("#activityDivID").hide();
        $("#userDivID").show();
        $("#monitorDivID").hide();
      });
      
       $(window).bind("beforeunload", function() { 
          // If confirmation needed. please uncomment this
            //return confirm("Do you want to exit Dashboard"); 
          // else Call Logout in herculesClientShutDown.js
          logout();
         });
        });