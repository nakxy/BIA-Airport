//Show search Panel
function showSearchPanel()
        {
                $('#searchBarID').toggle('slow');
                var dashHeight=$("#herculesDash").css("margin-top");
                if(dashHeight == "120px")
                {
                                 $('#herculesDash').animate({'margin-top':'180px'}, 'slow');
                }
                else
                {
                        $('#herculesDash').animate({'margin-top':'120px'}, 'slow');
                }
                
        }



// Search records based on Local Data
        function searchRecords(searchId,searchString)
        {
                searchRecordData.length=0;
                console.log("searchString:"+searchString);
                console.log("searchRecords:" +searchRecordData);
                if(searchString)
                {
                        console.log("entered");
                        var searchTempArray={};
                        searchTempArray=searchId.split(".");
                        var searchTerm= searchTempArray[1];
                        for(var rs=0;rs<localRecordData.length;rs++)
                        {
                                searchKey(localRecordData[rs],searchTerm,searchString);
                                if(searchFlag == true)
                                {
                                        searchRecordData.push(localRecordData[rs]);
                                        searchFlag=false;
                                }
                        }
                        console.log("search recods is "+ searchRecordData);
                        renderTableBody(searchRecordData,"search")
                }
                else
                {
                    $('#herculesTable > tbody').empty();
                        for(var ldo=0; ldo < localDataObjects.length ; ldo++)
                        {
                                renderTableBody(localDataObjects[ldo], "page");
                        }
                }       
        }

         var searchFlag=false;

         function searchKey(recordData,searchTerm,localSearchString)
        {
                for(searchObj in recordData)
                {
                        var value = recordData[searchObj];
                        if (typeof value === 'object') 
                        {
                                //console.log(" call searchKey "+ recordData[searchObj] + " Search key :" +searchTerm);
                                searchKey(value,searchTerm,localSearchString);
                        }       
                        else if(searchObj == searchTerm)
                        {
                                //console.log("found id with value="+ recordData[searchTerm]);
                                var searchItem=recordData[searchTerm].toLowerCase();
                                var searchedItem=localSearchString.toLowerCase();
                                if(searchItem.search(searchedItem) != -1 ) 
                                {
                                        console.log("Found Record With Value"+ recordData[searchTerm] + " Search Value "+ localSearchString);
                                        //add record 
                                        searchFlag=true;
                                }
                        } 
                }
                 
        }
        
        // Display Search Data
        function searchRecordDisplay(displayRecord)
        {
        	var tbodyData="";
            tbodyData='<tr>';
            for(var b=0; b<activeHeaders.length; b++)
                  {
                      resultArray = [];
                      parentObject="Base";
                    returnValurForHeader(displayRecord,activeHeaders[b]);
                  if(resultArray.length == 1)
                  {
                    tbodyData+='<td onclick="selRecord(\''+ displayRecord.Account_ID +'\');">'+ resultArray[0] +'</td>';
                  }
                  else
                  {
                       tbodyData+='<td><select>';
                       for( var ab=0; ab<resultArray.length; ab++)
                       {
                           tbodyData+='<option value="'+ resultArray[ab] +'">'+ resultArray[ab] +'</option>';
                       }
                       tbodyData+="</select></td>";
                  }
                 }
                tbodyData+="</tr>";
                $("#herculesTable").append($(tbodyData));
        }

        