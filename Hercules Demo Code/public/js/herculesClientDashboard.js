 // Render Recrod Row for "Normal" or Search type
 function renderTableBody(recordData,dashType)
        {

          if( dashType =="search")
          {
          	 $('#herculesTable > tbody').empty();
            if( recordData.length > 0 )
            {
            for(var rsi=0; rsi<recordData.length;rsi++)
            {
          	  console.log(" number of records :"+recordData.length);
              console.log("==== record ====");
              console.log("record is :"+ JSON.stringify(recordData[rsi]));
              searchRecordDisplay(recordData[rsi]);
                }
                
            }
          
            else
            {
            	 $('#herculesTable > tbody').empty();
              console.log("################ not found ################");
              var tbodyData='<tr><td colspan="3"><span class="label label-default">No Record Found</span></td></tr>';
                $("#herculesTable").prepend($(tbodyData));
            }
          }
          else
          {
            pageIndexGenerator();
            $('#herculesTable > tbody').empty();
            var optr=(pageNumber*10)-10;
            console.log("old optr is "+optr);
            for(var ldr=optr; ldr<optr+10; ldr++)
            {
              console.log("Page number:"+pageNumber);
              console.log("optr is "+optr);
              var tbodyData="";
              if(localDataObjects[ldr] != undefined)
              {
                //console.log("record number:"+ldr);
                //console.log("record data:"+localDataObjects[ldr].Hercules_Service_Data);
                //console.log("record status:"+localDataObjects[ldr].Hercules_Service_RecordStatus);
                var selectCounter=0;
                var dataObject=localDataObjects[ldr].Hercules_Service_Data;
                  var recordStatus=localDataObjects[ldr].Hercules_Service_RecordStatus;
                  var tbodyData="";
                  if(recordStatus == "New")
                  {
                    tbodyData='<tr>';
                }
                  else
                  {
                    tbodyData='<tr style="border:3px solid #FF6600;">';
                     //\''+ recordData +'\'
                  }
                  for(var b=0; b<activeHeaders.length; b++)
                  {
                      resultArray = [];
                      parentObject="Base";
                    returnValurForHeader(dataObject,activeHeaders[b]);
                  //console.log(resultArray);
                  if(resultArray.length == 1)
                  {
                //  tbodyData+='<td onclick="selRecord(\''+ recordData.Hercules_Service_Data.Account_ID +'\');">'+ resultArray[0] +'</td>';
                    tbodyData+='<td onclick="selRecord(\''+ localDataObjects[ldr].Hercules_Service_Data.Account_ID +'\');">'+ resultArray[0] +'</td>';
                    }
                   else
                   {
                   	   var idSelect='SelectId-'+ ldr +'-column-'+selectCounter;
                       tbodyData+='<td><select id="'+ idSelect +'" onchange="syncRecordRow(\''+ idSelect +'\')">';
                       selectCounter++;
                       for( var ab=0; ab<resultArray.length; ab++)
                       {
                           tbodyData+='<option value="'+ resultArray[ab] +'">'+ resultArray[ab] +'</option>';
                       }
                       tbodyData+="</select></td>";
                     }
                    }
                    tbodyData+="</tr>";
              }
              $("#herculesTable").append($(tbodyData));
            }
          }
              
        }

        //Select record for Display
         function selRecord(recordModalDataID)
        {
           $("#modelRecordContent").empty();
           $("#modelRecordTitle").empty();
          var recordID="Record Details : "+recordModalDataID;
          $("#modelRecordContent").append("Data for ID: "+recordModalDataID);
          $("#modelRecordTitle").append(recordID);
          $('#myModal').modal('show');
          for(var lo=0; lo < localDataObjects.length ; lo++)
          {
            if(localDataObjects[lo].Hercules_Service_Data.Account_ID ==  recordModalDataID)
            {
               displayModelContent(localDataObjects[lo].Hercules_Service_Data);
               populateActions(localDataObjects[lo].Hercules_Service_RedordActions);
               break;
            }
          }
        }

        // Display Record Details
        
        function displayModelContent(contentRecord)
        {
          for(contentObj in contentRecord)
          {
            if(typeof(contentRecord[contentObj]) != "object")
            {
              $("#modelRecordContent").append("</br>"+contentObj+" : "+contentRecord[contentObj]);
            }
            else
            {
              displayModelContent(contentRecord[contentObj]);
            }
          }
        }


        // Render Pagination for records  
        function pageIndexGenerator()
        {
          $("#pageIndexId").empty();
          var pages=localDataObjects.length;
          //console.log(pages);
          var pi=1;
          var pageTag='<ul  id="pageSetID" class="pagination" > <li><a style="color:orange;" href="#" id="pagePrevSetID">&laquo;</a></li>';
          
          for(var qi=1; qi<=localDataObjects.length; qi=qi+5)
          {
            //console.log(" page number is "+ pi);
            if(pi == pageNumber)
            {
              pageTag=pageTag+'<li class="active" id="page'+pi+'" onclick="selectPage(\''+ pi +'\');" ><a  style="color:orange;"  href="#">'+pi+'</a></li>';
            }
            else
            {
              pageTag=pageTag+'<li id="page'+pi+'" onclick="selectPage('+pi +');" ><a  style="color:orange;"  href="#">'+pi+'</a></li> ';
            }
            pi++;
          }
          pageTag=pageTag+'<li><a style="color:orange;" href="#" id="pageNextSetID">&raquo;</a></li></ul>';
          $('#pageIndexId').append(pageTag);
        }

        // Search Function

        
        var parentObject="Base";
         

         // return value for Keys functions
      
        function returnValurForHeader(dataObj,objKey)
        {
          //console.log("########################-- Finish --########################");
            var splitKey={};
            splitKey=objKey.split(".");
          localKey=splitKey[1];
          localKeyParent=splitKey[0];
          //console.log(" The search items are "+objKey);
          callValueReturn(dataObj,localKeyParent,localKey);
        }

        function callValueReturn(localObject,localParentObject,localKey)
        {
         // console.log("called on :"+localObject+" : "+localParentObject+" : "+localKey);
          for(objLocal in localObject)
          {
            var tempValue=localObject[objLocal];
        if (typeof tempValue === 'object') 
              {
                if(isNaN(objLocal)) 
                {
                  parentObject=objLocal;
                }
                if((typeof(tempValue.length) != "undefined")&&( tempValue.length>1)&&( typeof(tempValue) === 'object'))
                {
                  callArrayReturn(tempValue,localParentObject,localKey);
                }
                else 
                {
                  callValueReturn(tempValue,localParentObject,localKey);
                }
                //
            }
            else
            {
              if((objLocal == localKey) &&(localParentObject == parentObject))
                 {
                    resultArray.push(localObject[objLocal]);
                 }
            }
          }
            
    }
                
      // Recursive function to get values of keys  

        function callArrayReturn(tempValueLocal,localParent,localKey)
        {
          //console.log(" Local Parent is :"+localParent+" local key :"+localKey);
         // console.log("\n localParent:"+localParent+" localKey:"+localKey);
          var tempParent=parentObject;
          for(var v=0;v<tempValueLocal.length;v++)
          {
            for(tempObject in tempValueLocal[v])
            {
              var tempValue=tempValueLocal[v][tempObject];
              if(typeof(tempValue) == "object")
              {
                //console.log(" the obj is "+ localParent + " **** "+localKey);
                parentObject=tempObject;
                callValueReturn(tempValue,localParent,localKey);
              }
              else
              {
                if((tempObject == localKey) && (localParent == tempParent))
                  {
                      resultArray.push(tempValueLocal[v][tempObject]);
                  }
              }
            }
        }
    }

    // Row Sync Function
    function syncRecordRow(selectID)
    {
      //alert(selectID);
      var idTrimed=selectID.slice(0, - 1);
      var selOption= document.getElementById(selectID).selectedIndex;
      var selectedtags = $('select[id^="'+idTrimed+'"]');
      $('select[id^="'+idTrimed+'"]').each(function(){
        $(this).prop('selectedIndex', selOption);
    });
    }

    // Set Actions for records based on Data Sent by Server
    function populateActions(tempActionData)
    {
      $("#recordActionID").empty();
      var appendAction="";
      for(var items=0; items<tempActionData.length; items++)
      {
        appendAction+="<option value="+tempActionData[items]+">"+tempActionData[items]+"</option>";
      }
      $("#recordActionID").append(appendAction);
      }