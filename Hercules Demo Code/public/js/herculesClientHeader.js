 function setCounter()
       {
          notificationCounter++;
        messageCounter++;
        $("#notificationPanel").html(notificationCounter);
        $("#messagePanel").html(messageCounter);
        document.title = "("+notificationCounter+") PayPal Hercules";
       }

               function selectPage(pageNo)
        {
          pageNumber=pageNo;
          $( "li" ).removeClass( "active" );
          var pageID="#page"+pageNo;
          $(pageID).addClass( "active" );
          renderTableBody("none","page");
        }
    
    $(document).ready(function(){
      $('#pagePrevSetID').click(function() {
        alert("pressed previous");
      });
      $('#pageNextSetID').click(function() {
        alert("pressed next");
      });
    });


function renderHeader(headerOptions,mappingFlag)
        {
          var embeddedKey="";
          for(obj in headerOptions)
          {
            if(!(typeof(headerOptions[obj]) == 'object'))
            {
             console.log(headerOptions[obj]);
                	var localVariable="Base."+headerOptions[obj];
                	var localVariableObject={};
                	localVariableObject[localVariable]=headerOptions[obj];
                	localMappingActiveHeader.push(localVariableObject);
              $("#configContent").append('<div class="input-group"><span class="input-group-addon"><input type="checkbox" onclick="setHeaderCol(\''+ localVariable +'\');" "name="' + headerOptions[obj] + '" id="' + localVariable + '"></span><input type="text"  class="form-control" for="id' + headerOptions[obj] + '" value="' + headerOptions[obj] + '" /></div>');
               $("#searchPanelContent").append('<label>'+ headerOptions[obj] +'</label><div class="input-group input-group-sm"><input type="text" class="form-control"  id="ida' + localVariable +'" placeholder="' + headerOptions[obj] + '"/><span class="input-group-btn"><button class="btn btn-default" type="button" onclick="setreplacePanelheaders(\''+ localVariable +'\');">Go!</button></span></div>');
                if(mappingFlag == "None")
                {
                  localMappingObjects[localVariable]=headerOptions[obj]
                }
            }
          }
          for(obj in headerOptions)
          {
            if(typeof(headerOptions[obj]) == 'object')
            {
              var val=headerOptions[obj]
              for(localobj in val)
              {
                console.log(" teo "+ localobj);
                embeddedKey=localobj;
                $("#configContent").append('<div class="input-group spacing"><span class="input-group-addon" >' + localobj + '</span></div>');

                var tempObj=val[localobj];
                for(temp in tempObj)
                {
                	var localComplexVariable=localobj+"."+tempObj[temp];
                	var localComplexVariableObject={};
                	localComplexVariableObject[localComplexVariable]=tempObj[temp];
                	localMappingActiveHeader.push(localComplexVariableObject);
                 $("#configContent").append('<div class="input-group spacing"><span class="input-group-addon"><input type="checkbox" onclick="setHeaderCol(\''+ localComplexVariable +'\');" "name="' + tempObj[temp] + '" id="' + localComplexVariable + '"></span><input type="text"  class="form-control" for="id' + localComplexVariable + '" value="' + tempObj[temp] + '" /></div>');  
                   $("#searchPanelContent").append('<label>'+ tempObj[temp] +'</label><div class="input-group input-group-sm"><input type="text" class="form-control"  id="ida' + localComplexVariable +'" placeholder="' + tempObj[temp] + '"/><span class="input-group-btn"><button class="btn btn-default" type="button" onclick="setreplacePanelheaders(\''+ localComplexVariable +'\');">Go!</button></span></div>');
                  
                  if(mappingFlag == "None")
                  {
                    localMappingObjects[localComplexVariable]=tempObj[temp];
                  } 
                   
                }
              }
            }
          }
          
          console.log(JSON.stringify(localMappingActiveHeader));
          for(obj in localMappingActiveHeader)
          {
          	testobj=localMappingActiveHeader[obj];
          	for(var key in testobj) {
    			console.log("key is "+key+" value is "+testobj[key]);
				}
          	
      		}

          if(localStorage.getItem("active_headers") != "")
          {
          var tempActiveHeader=localStorage.getItem("active_headers")
          if(tempActiveHeader)
          {
            activeHeaders=tempActiveHeader.split(",");
          }
          
          console.log("length is :"+activeHeaders.length)
          if(activeHeaders.length > 1)
          {
         	 for(var i=0; i<activeHeaders.length; i++)
          	{
           		 document.getElementById(activeHeaders[i]).checked = true;
           		//console.log(" active header "+ activeHeaders[i]);
          	}
      	}
    	  }
          renderTableHeaders();
        }

        // Render Table Header

        function renderTableHeaders()
        {
          $("#herculesTable").remove();
          //alert(activeHeaders);
          var startTable='<table id="herculesTable" class="table table-hover" ><thead style="bottom:0"><tr class="info">';
          var tdContent=""
         // activeHeaders=localStorage.getItem("active_headers").split(",");
          //console.log("active headers are :" +activeHeaders);
          for(var t=0;t<activeHeaders.length;t++)
          {
            tdContent=tdContent+"<th id=" + activeHeaders[t]+">";
            var tempheader=activeHeaders[t];
            tdContent=tdContent+localMappingObjects[tempheader];
            tdContent=tdContent+"</th>";
          }
          var endtable='</thead></tr><tbody></tbody></table>';
          var table=startTable+tdContent+endtable;
          $("#herculesDash").append(table);
          for(var ldo=0; ldo < localDataObjects.length ; ldo++)
          {
            renderTableBody(localDataObjects[ldo], "normal");
          }
          initialSetHeaderCol();
        }


        



      

        

        // Initialize Headers

        function initialSetHeaderCol()
        {
        	$( "#searchBarContentID" ).empty();
        	for(val in activeHeaders)
        	{
        		var headerObj=activeHeaders[val];
        		$("#searchBarContentID").append('<input style="margin-left:5px;margin-right:5px;border:1px solid #0079c1;text-align:center;border-radius:" type="text" id="ids' + headerObj +'" placeholder="' + localMappingObjects[headerObj] + '" onKeyUp="searchRecords(this.id,this.value);"/>');
        	}	
        }



        // Renaming Function

        function setreplacePanelheaders(replacedName)
        {
          var textId="ida"+replacedName;
          var textVal=document.getElementById(textId).value;
          if(!textVal)
          {
            var tempReplacedName={};
            tempReplacedName=replacedName.split('.');
            localMappingObjects[replacedName]=tempReplacedName[1];
          renderTableHeaders();
          }
          else
          {
            
          localMappingObjects[replacedName]=textVal;
          renderTableHeaders();
        }
        }

      

        // Inital Header Setting

        function setHeaderCol(headerObj)
        {
          if(activeHeaders.indexOf(headerObj) == -1)
          {
            activeHeaders.push(headerObj);
           // localMappingObjects.push({headerObj:headerObj});
          }
          else
          {
            var removeIndex=activeHeaders.indexOf(headerObj);
            activeHeaders.splice(removeIndex,1);
          }

          localStorage.removeItem("active_headers");
          localStorage.setItem("active_headers",activeHeaders);
          console.log(localStorage.getItem("active_headers"));
          renderTableHeaders();
          initialSetHeaderCol();
        }