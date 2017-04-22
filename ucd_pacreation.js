var express = require('express');
var app = express();
var sync = require('synchronize');
var fiber = sync.fiber;
var await = sync.await;
var defer = sync.defer;
var http= require('https');
var request = require('request');
var myConstants = require('./constants.js');
var myError = require('./error.js');
var myErrorConst = require('./errorconst.js');
var syncRequest = require('sync-request');
var username = "PasswordIsAuthToken";
var password = myConstants.UCD_API_KEY;
var buffer = new Buffer(username + ':' + password);
var base64String = buffer.toString('base64');
var authorization = 'Basic ' + base64String ;
var no_of_environment = myConstants.NO_OF_ENVIRONMENT;
var bodyParser = require('body-parser');
app.use(bodyParser.json());
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
process.env.UV_THREADPOOL_SIZE = 128;

module.exports = {
 UCD_pacreation:function(reqBody, callback){
  console.log("UCD PROJECT AREA CREATION METHOD STARTED: "+JSON.stringify(reqBody));
  var adminName = reqBody.admin_id;
  var project_name = reqBody.project_name;
  console.log("details: "+JSON.stringify(reqBody));
 
  var resp1 = ucd_pacreation(project_name,authorization,adminName,project_name,callback);
  var project_url = myConstants.UCD_URL+"/#applications";
  
  }
  };



//This Function Creates a Project Area in UCD
function ucd_pacreation(project_name,authorization,adminName,project_name,callback)
{
  console.log("Project Area is getting Created");
  adminName = adminName;
  project_name = project_name;
  request({
           headers:
                  {
                   'Authorization': authorization,
                   'Content-Type': 'application/json'
                   },
           method: "PUT",
           body: JSON.stringify({
                                 "description": "Used fro testing purpose",
                                 "enforceCompleteSnapshots": "false",
                                 "name": project_name,
                                 "notificationScheme": "Default Notification scheme"
                                }),
           uri:myConstants.UCD_BASE_URL+'/cli/application/create',
           timeout:myConstants.UCD_TIMEOUT
            },function(err,res,body){
                           if (err===null)
                            {
                             if (res.statusCode===200 || res.statusCode===201)
                              {
                               var resJSON = JSON.parse(body);
                               console.log("Project created");
                               //console.log("project created details: "+resJSON);
                               //console.log(resJSON)
                               console.log("---ucd_pacreategroup is now called---");
                               ucd_pacreategroup(project_name,authorization,adminName,project_name,callback);
                               console.log("---ucd_pateamcreation is now called---");
                               ucd_pateamcreation(project_name,authorization,adminName,project_name,callback);
                      
                              }else{
                                var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.UCD_PROJECT_CREATE_ERR,JSON.stringify(res));
                                console.log(JSON.stringify(error));
                                callback(err,null);
                         
                              }     
                           }else{
                                var error = myError.seterror(myErrorConst.SERVICE_RUNTIME_EXCEPTION,myErrorConst.UCD_PROJECT_CREATE_ERR,JSON.stringify(err));
                                console.log(JSON.stringify(error));
                                callback(err,null);
                            
                           };                           
                           });
};


//This Function Creates a Team for Project Area in UCD
function ucd_pateamcreation(project_name,authorization,adminName,project_name,callback)
{
  console.log("Team for Project Area is getting Created");
  adminName = adminName;
  project_name = project_name;
  request({
           headers:
                  {
                   'Authorization': authorization,
                   'Content-Type': 'application/json'
                   },
           method: "PUT",
           uri:myConstants.UCD_BASE_URL+'/cli/team/create?team='+project_name,
           timeout:myConstants.UCD_TIMEOUT
            },function(err,res,body){
                           if (err===null)
                            {
                             if (res.statusCode===200 || res.statusCode===201)
                              {
                               var resJSON = JSON.parse(body);
                               console.log("Team for Project Area is created");
                               //console.log(resJSON)
                               console.log("---ucd_pa_addingteamtoapplication is now called---");
                               ucd_pa_addingteamtoapplication(project_name,authorization,adminName,project_name,callback);
                      
                              }else{
                                var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.UCD_TEAM_CREATE_ERR,JSON.stringify(res));
                                console.log(JSON.stringify(error));
                                callback(err,null);
                         
                              }     
                           }else{
                                var error = myError.seterror(myErrorConst.SERVICE_RUNTIME_EXCEPTION,myErrorConst.UCD_TEAM_CREATE_ERR,JSON.stringify(err));
                                console.log(JSON.stringify(error));
                                callback(err,null);
                            
                           };                           
                           });
};


//This Function Deletes a Team for Project Area in UCD
function ucd_pateamdeletion(project_name,authorization,adminName,project_name,callback)
{
  console.log("Team for Project Area is getting Deleted");
  adminName = adminName;
  project_name = project_name;
  request({
           headers:
                  {
                   'Authorization': authorization,
                   'Content-Type': 'application/json'
                   },
           method: "PUT",
           uri:myConstants.UCD_BASE_URL+'/cli/team/delete?team='+project_name,
           timeout:myConstants.UCD_TIMEOUT
            },function(err,res,body){
                           if (err===null)
                            {
                             if (res.statusCode===200 || res.statusCode===201 || res.statusCode===204)
                              {
                               
                               console.log("Team for Project Area is Deleted");
                                                     
                              }else{
                                var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.UCD_TEAM_DELETION_ERR,JSON.stringify(res));
                                console.log(JSON.stringify(error));
                                callback(err,null);
                         
                              }     
                           }else{
                                var error = myError.seterror(myErrorConst.SERVICE_RUNTIME_EXCEPTION,myErrorConst.UCD_TEAM_DELETION_ERR,JSON.stringify(err));
                                console.log(JSON.stringify(error));
                                callback(err,null);
                            
                           };                           
                           });
};


//This Function creates a group for Project Area in UCD
function ucd_pacreategroup(project_name,authorization,adminName,project_name,callback)
{
  console.log("Project Groups is getting Created");
  project_name = project_name;
  for(var i = 0 ; i < myConstants.NO_OF_GROUPS ; i++)
  {
  	if ( i === 0 )
  	{
  	  var role = "Application-Admin",
  	   prefix = "Admin-";
  	  var group = prefix.concat(project_name);
  	}else{
  		var role = "Deployer",
  	    prefix = "Dev-";
  	    var group = prefix.concat(project_name);
  	}
  request({
           headers:
                  {
                   'Authorization': authorization,
                   'Content-Type': 'application/json'
                   },
           method: "PUT",
           uri:myConstants.UCD_BASE_URL+'/cli/group/create?group='+group+'&authorizationRealm=IBM Bluegroups',
           timeout:myConstants.UCD_TIMEOUT
            },function(err,res,body){
                           if (err===null)
                            {
                             if (res.statusCode===200 || res.statusCode===201)
                              {
                               var resJSON = JSON.parse(body);
                               console.log("Groups for Team for Project Area has been created");
                               //console.log(resJSON)
                               
                      
                              }else{
                                var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.UCD_GROUP_CREATE_ERR,JSON.stringify(res));
                                console.log(JSON.stringify(error));
                                callback(err,null);
                         
                              }     
                           }else{
                                var error = myError.seterror(myErrorConst.SERVICE_RUNTIME_EXCEPTION,myErrorConst.UCD_GROUP_CREATE_ERR,JSON.stringify(err));
                                console.log(JSON.stringify(error));
                                callback(err,null);

                           };                           
                           });
};
};


//This Function Deletes a Group for Project Area in UCD
function ucd_padeletegroup(project_name,authorization,adminName,project_name,callback)
{
  console.log("Project Groups is getting Deleted");
  project_name = project_name;
  for(var i = 0 ; i < myConstants.NO_OF_GROUPS ; i++)
  {
  	if ( i === 0 )
  	{
  	  var role = "Application-Admin",
  	   prefix = "Admin-";
  	  var group = prefix.concat(project_name);
  	}else{
  		var role = "Deployer",
  	    prefix = "Dev-";
  	    var group = prefix.concat(project_name);
  	}
  request({
           headers:
                  {
                   'Authorization': authorization,
                   'Content-Type': 'application/json'
                   },
           method: "PUT",
           uri:myConstants.UCD_BASE_URL+'/cli/group/delete?group='+group,
           timeout:myConstants.UCD_TIMEOUT
            },function(err,res,body){
                           if (err===null)
                            {
                             if (res.statusCode===200 || res.statusCode===201 || res.statusCode===204)
                              {
                               var resJSON = JSON.parse(body);
                               console.log("Groups for Team for Project Area has been Deleted");
                               //console.log(resJSON)
                               
                      
                              }else{
                                var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.UCD_GROUP_DELETION_ERR,JSON.stringify(res));
                                console.log(JSON.stringify(error));
                                callback(err,null);
                         
                              }     
                           }else{
                                var error = myError.seterror(myErrorConst.SERVICE_RUNTIME_EXCEPTION,myErrorConst.UCD_GROUP_DELETION_ERR,JSON.stringify(err));
                                console.log(JSON.stringify(error));
                                callback(err,null);
                            
                           };                           
                           });
};
};


//This Function adds groups to a team for Project Area in UCD
function ucd_paaddgrouptoteam(project_name,authorization,adminName,project_name,group,callback)
{
  console.log("Project Groups is getting added to Project Teams");
  project_name = project_name;
    for(var i = 0 ; i < myConstants.NO_OF_GROUPS ; i++)
  {
  	if ( i === 0 )
  	{
  	  var role = "Application-Admin",
  	   prefix = "Admin-";
  	  var group = prefix.concat(project_name);
  	}else{
  		 var role = "Deployer",
  	    prefix = "Dev-";
  	   var group = prefix.concat(project_name);
  	}
    var options = {
           headers:
                  {
                   'Authorization': authorization,
                   'Content-Type': 'application/json'
                   },
           method: "PUT",
           uri:myConstants.UCD_BASE_URL+'/cli/teamsecurity/groups?team='+project_name+'&role='+role+'&group='+group,
           timeout:myConstants.UCD_TIMEOUT
            };
            console.log(options['uri'])
  request(options,function(err,res,body){
                           if (err===null)
                            {
                             if (res.statusCode===200 || res.statusCode===201 || res.statusCode===204)
                              {
                               
                               console.log("Groups to Team for Project Area has been added");
                               //project_url = myConstants.UCD_BASE_URL+"/#application";
                               i = i+1;
                               if(i == 3)
                               {
                                callback(project_url);
                               };
                                                     
                              }else{
                                var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.UCD_ADD_GROUP_TO_TEAM_ERR,JSON.stringify(res));
                                console.log(JSON.stringify(error));
                                callback(err,null);
                         
                              }     
                           }else{
                                var error = myError.seterror(myErrorConst.SERVICE_RUNTIME_EXCEPTION,myErrorConst.UCD_ADD_GROUP_TO_TEAM_ERR,JSON.stringify(err));
                                console.log(JSON.stringify(error));
                                ucd_padeletegroup(project_name,authorization,adminName,project_name,callback);
                                ucd_pateamdeletion(project_name,authorization,adminName,project_name,callback);
                                callback(err,null);
                                
                            
                           };                           
                           });
};
};


//This Function  a Team to an application for Project Area in UCD
function ucd_pa_addingteamtoapplication(project_name,authorization,adminName,project_name,callback)
{
  console.log("Linking of Team to Project Area is getting Created");
  adminName = adminName;
  project_name = project_name;
  request({
           headers:
                  {
                   'Authorization': authorization,
                   'Content-Type': 'application/json'
                   },
           method: "PUT",
           uri:myConstants.UCD_BASE_URL+'/cli/application/teams?application='+project_name+'&team='+project_name,
           timeout:myConstants.UCD_TIMEOUT
            },function(err,res,body){
                           if (err===null)
                            {
                             if (res.statusCode===200 || res.statusCode===201 || res.statusCode===204)
                              {
                               
                               console.log("Team to Project Area Linkage is Established");
                               
                               console.log("---ucd_pacreateenvironment is now called---");
                               ucd_pacreateenvironment(project_name,authorization,project_name,no_of_environment,callback);
                      
                              }else{
                                var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.UCD_ADD_TEAM_TO_APPLICATION_ERR,JSON.stringify(res));
                                console.log(JSON.stringify(error));
                                callback(err,null);
                         
                              }     
                           }else{
                                var error = myError.seterror(myErrorConst.SERVICE_RUNTIME_EXCEPTION,myErrorConst.UCD_ADD_TEAM_TO_APPLICATION_ERR,JSON.stringify(err));
                                console.log(JSON.stringify(error));
                                console.log("---Rolling Back the Team Creation---");
                                ucd_pateamdeletion(project_name,authorization,adminName,project_name,callback);
                                ucd_padeletegroup(project_name,authorization,adminName,project_name,callback);
                                callback(err,null);
                                
                           };                           
                           });
};


//This Function Creates 3 envirnoments for Project Area in UCD and binds it to the Application
function ucd_pacreateenvironment(project_name,authorization,project_name,no_of_environment,callback)
{
  console.log("Creation of Environment for Project Area and its linkage has Started");
  project_name = project_name;
  var var_ucd_pacreateenvironment = 0;
  for (var i = 0 ; i < no_of_environment ; i++)
  {
    if ( i === 0)
    {
      env_name = "Dev";
      env_color = "Pink";
    }else if(i === 1){
        env_name = "Test";
      env_color = "violet";
    }else{
      env_name = "Prod";
      env_color = "green";
      var_ucd_pacreateenvironment = 3;
    };
  try{
    var options2 = 
    { 
    headers:{
                   'Authorization': authorization,
                   'Content-Type': 'application/json'
                   },
                 };
   
    Data = syncRequest('PUT',myConstants.UCD_BASE_URL+'/cli/environment/createEnvironment?application='+project_name+'&name='+env_name+'&color='+env_color,options2);
    Data1 = JSON.stringify(Data);
    //console.log(Data)
    uri = myConstants.UCD_BASE_URL+'/cli/environment/createEnvironment?application='+project_name+'&name='+env_name+'&color='+env_color;

                              console.log("-------------value of i----------------------"+i);
                               console.log("Creation of Environment for Project Area and its linkage is Established");
                               if(var_ucd_pacreateenvironment === 3)
                               {
                                console.log("---ucd_paaddingteamtoenvironment is now called---");
                               var_ucd_pacreateenvironment++;
                               no_of_environment = 3;
                               ucd_pacreatecomponent(project_name,authorization,project_name,no_of_environment,callback);
                             }
                           
                              
                             }
                      catch(err)
                      {
                               // var error = myError.seterror(myErrorConst.SERVICE_RUNTIME_EXCEPTION,myErrorConst.UCD_ENVIRONMEMT_CREATE_ERR,JSON.stringify(err));
                                console.log(JSON.stringify(err));
                                ucd_padeletegroup(project_name,authorization,adminName,project_name,callback);
                                ucd_pateamdeletion(project_name,authorization,adminName,project_name,callback);
                                callback(err,null);
                                
                           };                           
                           
  };

};


//This Function binds the Team to the 3 environment in  UCD
function ucd_paaddingteamtoenvironment(project_name,authorization,project_name,no_of_environment,callback)
{
  console.log("Adding Environment to Team for Project Area  has Started");
  project_name = project_name;
 var var_ucd_paaddingteamtoenvironment = 0;
    for (var i = 0 ; i < no_of_environment ; i++)
  {
  	if ( i === 0)
  	{
  		env_name = "Dev";
  		
  	}else if(i === 1){
        env_name = "Test";
  		
  	}else{
  		env_name = "Prod";
  		var_ucd_paaddingteamtoenvironment = 3;
  		
  	};

  try{
    var options2 = 
    { 
    headers:{
                   'Authorization': authorization,
                   'Content-Type': 'application/json'
                   },
                 };
   
    Data = syncRequest('PUT',myConstants.UCD_BASE_URL+'/cli/environment/teams?application='+project_name+'&team='+project_name+'&environment='+env_name,options2);
    Data1 = JSON.stringify(Data);

                               	//var_ucd_paaddingteamtoenvironment = var_ucd_paaddingteamtoenvironment + 1;
                               console.log("Adding Environment to Team for Project Area is Established");
                               if(var_ucd_paaddingteamtoenvironment === 3)
                               {
                                console.log("---ucd_pacreatecomponent is now called---");
                               var_ucd_paaddingteamtoenvironment++;
                               ucd_pacreatecomponent(project_name,authorization,project_name,no_of_environment,callback);
                             }
                           }
                      catch(err)
                      {
                                console.log("---Rolling Back the Environment Creation---");
                                ucd_pacdeleteenvironment(project_name,authorization,project_name,no_of_environment,callback);
                                ucd_padeletegroup(project_name,authorization,adminName,project_name,callback);
                                ucd_pateamdeletion(project_name,authorization,adminName,project_name,callback);
                                ucd_pacdeleteenvironment(project_name,authorization,project_name,no_of_environment,callback);
                                callback(err,null);

                            
                           };                           
                           
};
};


//This Function Deletes an environment for Project Area in UCD
function ucd_pacdeleteenvironment(project_name,authorization,project_name,no_of_environment,callback)
{
  console.log("Deletion of Environment for Project Area  has Started");
  project_name = project_name;
  for (var i = 0 ; i < no_of_environment ; i++)
  {
  	if ( i === 0)
  	{
  		env_name = "Dev";
  		
  	}else if(i === 1){
        env_name = "Test";
  		
  	}else{
  		env_name = "Prod";
  		
  	};
  request({
           headers:
                  {
                   'Authorization': authorization,
                   'Content-Type': 'application/json'
                   },
           method: "DELETE",
           uri:myConstants.UCD_BASE_URL+'/cli/environment/deleteEnvironment?application='+project_name+'&environment='+env_name,
           timeout:myConstants.UCD_TIMEOUT
            },function(err,res,body){
                           if (err===null)
                            {
                             if (res.statusCode===200 || res.statusCode===201 || res.statusCode===204 )
                              {
                               
                               console.log("Creation of Environment for Project Area and its linkage is Established");
                               
                      
                              }else{
                                var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.UCD_ENVIRONMEMT_DELETE_ERR,JSON.stringify(res));
                                console.log(JSON.stringify(error));
                                callback(err,null);
                         
                              }     
                           }else{
                                var error = myError.seterror(myErrorConst.SERVICE_RUNTIME_EXCEPTION,myErrorConst.UCD_ENVIRONMEMT_DELETE_ERR,JSON.stringify(err));
                                console.log(JSON.stringify(error));
                                callback(err,null);
                           };                           
                           });
  };
 };


//This Function Creates a component for Project Area in UCD
 function ucd_pacreatecomponent(project_name,authorization,project_name,no_of_environment,callback)
{
  console.log("Creation of Component for Project Area  has Started");
  project_name = project_name;
  request({
           headers:
                  {
                   'Authorization': authorization,
                   'Content-Type': 'text/plain'
                   },
           method: "PUT",
           body: JSON.stringify({
                                   "name": project_name,
                                   "description": "Component to Deploy "+project_name,
                                   "importAutomatically": false,
                                   "useVfs": true,
                                   "sourceConfigPlugin": "File System (Versioned)",
                                   "defaultVersionType": "FULL",
                                   "properties": {
                                                 "FileSystemVersionedComponentProperties\/basePath": 
                                                 "/opt/newcomponent"
                                                 }
                                }),
           uri:myConstants.UCD_BASE_URL+'/cli/component/create',
           timeout:myConstants.UCD_TIMEOUT
            },function(err,res,body){
                           if (err===null)
                            {
                             if (res.statusCode===200 || res.statusCode===201)
                              {
                               
                               console.log("Creation of Component for Project Area is Established");
                               var resJSON = JSON.parse(body);
                               //console.log(resJSON)
                               console.log("---ucd_paaddingcomponenttoapplication is now called---");
                               ucd_paaddingcomponenttoapplication(project_name,authorization,project_name,no_of_environment,callback);
                      
                              }else{
                              	var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.UCD_COMPONENT_CREATE_ERR,JSON.stringify(res));
                                //console.log(JSON.stringify(error));
                                callback(err,null);
                         
                              }     
                           }else{
                                console.log("------Rollback-----------");
                           	    var error = myError.seterror(myErrorConst.SERVICE_RUNTIME_EXCEPTION,myErrorConst.UCD_COMPONENT_CREATE_ERR,JSON.stringify(err));
                                console.log(JSON.stringify(error));
                                ucd_pacdeleteenvironment(project_name,authorization,project_name,no_of_environment,callback);
                                ucd_padeletegroup(project_name,authorization,adminName,project_name,callback);
                                ucd_pateamdeletion(project_name,authorization,adminName,project_name,callback);
                                ucd_pacdeleteenvironment(project_name,authorization,project_name,no_of_environment,callback);
                                callback(err,null);
                           };                           
                           });
 

};


//This Function binds a component to an application for Project Area in UCD
function ucd_paaddingcomponenttoapplication(project_name,authorization,project_name,no_of_environment,callback)
{
  console.log("Linking of Component to Project Area  has Started");
  project_name = project_name;
  request({
           headers:
                  {
                   'Authorization': authorization,
                   'Content-Type': 'application/json'
                   },
           method: "PUT",
           uri:myConstants.UCD_BASE_URL+'/cli/application/addComponentToApp?application='+project_name+'&component='+project_name,
           timeout:myConstants.UCD_TIMEOUT
            },function(err,res,body){
                           if (err===null)
                            {
                             if (res.statusCode===200 || res.statusCode===201)
                              {
                               
                               console.log("Linkage of Component for Project Area is Established");
                               console.log("---ucd_paaddingcomponenttoteam is now called---");
                               ucd_paaddingcomponenttoteam(project_name,authorization,project_name,no_of_environment,callback);
                      
                              }else{
                              	var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.ARTIFACTORY_PROJECT_CREATE_ERR,JSON.stringify(res));
                                console.log(JSON.stringify(error));
                                callback(err,null);
                         
                              }     
                           }else{
                                var error = myError.seterror(myErrorConst.SERVICE_RUNTIME_EXCEPTION,myErrorConst.ARTIFACTORY_PROJECT_CREATE_ERR,JSON.stringify(err));
                                console.log(JSON.stringify(error));
                                ucd_pacdeleteenvironment(project_name,authorization,project_name,no_of_environment,callback);
                                ucd_padeletegroup(project_name,authorization,adminName,project_name,callback);
                                ucd_pateamdeletion(project_name,authorization,adminName,project_name,callback);
                                ucd_pacdeleteenvironment(project_name,authorization,project_name,no_of_environment,callback);
                                callback(err,null);
                           };                           
                           });
 

};


//This Function binds component to a team for Project Area in UCD
function ucd_paaddingcomponenttoteam(project_name,authorization,project_name,no_of_environment,callback)
{
  console.log("Linking of Component to Team has Started");
  project_name = project_name;
  request({
           headers:
                  {
                   'Authorization': authorization,
                   'Content-Type': 'application/json'
                   },
           method: "PUT",
           uri:myConstants.UCD_BASE_URL+'/cli/component/teams?component='+project_name+'&team='+project_name,
           timeout:myConstants.UCD_TIMEOUT
            },function(err,res,body){
              //console.log("response------>"+res)
                           if (err===null)
                            {
                             if (res.statusCode===200 || res.statusCode===201 || res.statusCode===204)
                              {
                               
                               console.log("Linkage of Component for Team is Established");
                               console.log("---ucd_pacreatecomponentprocess is now called---");
                               ucd_pacreatecomponentprocess(project_name,authorization,project_name,no_of_environment,callback);
                               
                      
                              }else{
                              	var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.UCD_ADD_COMPONENT_TO_TEAM_ERR,JSON.stringify(res));
                                console.log(JSON.stringify(error));
                                callback(err,null);
                         
                              }     
                           }else{
                                var error = myError.seterror(myErrorConst.SERVICE_RUNTIME_EXCEPTION,myErrorConst.UCD_ADD_COMPONENT_TO_TEAM_ERR,JSON.stringify(err));
                                console.log(JSON.stringify(error));
                                 ucd_pacdeleteenvironment(project_name,authorization,project_name,no_of_environment,callback);
                                ucd_padeletegroup(project_name,authorization,adminName,project_name,callback);
                                ucd_pateamdeletion(project_name,authorization,adminName,project_name,callback);
                                ucd_pacdeleteenvironment(project_name,authorization,project_name,no_of_environment,callback);
                                callback(err,null);
                            
                           };                           
                           });
 

};


//This Function creates a component process for Project Area in UCD
 function ucd_pacreatecomponentprocess(project_name,authorization,project_name,no_of_environment,callback)
{
  console.log("Creation of Component Process for Project Area  has Started");
  project_name = project_name;
  request({
           headers:
                  {
                   'Authorization': authorization,
                   'Content-Type': 'application/json'
                   },
           method: "PUT",
           body: JSON.stringify({
                                   "name": "Process-"+project_name,
                                   "component": project_name,
                                   "description": "New component process for command example",
                                   "defaultWorkingDir": "${p:resource\/work.dir}\/${p:component.name}",
                                   "takesVersion": "false",
                                   "processType":"Deployment",
                                   "requiredRoleId":"Application-Admin",
                                   "inventoryActionType": "ADD",
                                   "status": "Active",
                                   "configActionType": "ADD",
                                   "active": "true",
                                   "propDefs": [
                                               ],
                                   "rootActivity": {
                                                    "type": "graph",
                                                    "name": "GRAPH",
                                                    "edges": [
                                                              {
                                                              "to": "First Step",
                                                              "type": "ALWAYS",
                                                              "value": ""
                                                              },
                                                              {
                                                              "to": "Second Step",
                                                              "from": "First Step",
                                                              "type": "ALWAYS",
                                                              "value": ""
                                                              },
                                                              {
                                                              "to": "Third Step",
                                                              "from": "Second Step",
                                                              "type": "ALWAYS",
                                                              "value": ""
                                                              },
                                                              {
                                                              "to": "FINISH",
                                                              "from": "Third Step",
                                                              "type": "ALWAYS",
                                                              "value": ""
                                                              }
                                                              ],
                                                    "offsets": [
                                                              {
                                                              "name": "First Step",
                                                              "x": "-65",
                                                              "y": "90"
                                                              },
                                                              {
                                                              "name": "Second Step",
                                                              "x": "-70",
                                                              "y": "210"
                                                              },
                                                              {
                                                             "name": "FINISH",
                                                             "x": "-60",
                                                             "y": "450"
                                                             }
                                                             ],
                                                    "children": [
                                                             {
                                                              "allowFailure": false,
                                                              "useImpersonation": false,
                                                              "showHIdden": false,
                                                              "impersonationUseSudo": false,
                                                              "commandName": "Download Artifacts",
                                                              "pluginName": "IBM UrbanCode Deploy Versioned File Storage",
                                                              "pluginVersion": 18,
                                                              "type": "plugin",
                                                              "name": "First Step",
                                                              "children": [
                                                                          ],
                                                              "properties": {
                                                           
                                                                            }
                                                                            },
                                                              {
                                                               "allowFailure": false,
                                                               "useImpersonation": false,
                                                               "showHIdden": false,
                                                               "impersonationUseSudo": false,
                                                               "commandName": "Push Application",
                                                               "pluginName": "CloudFoundry",
                                                               "pluginVersion": 3,
                                                               "type": "plugin",
                                                               "name": "Second Step",
                                                               "children": [
                                                                           ],
                                                               "properties": {
           
                                                                             }
                                                                             },
                                                               {
                                                               "allowFailure": false,
                                                               "useImpersonation": false,
                                                               "showHIdden": false,
                                                               "impersonationUseSudo": false,
                                                               "commandName": "Start App",
                                                               "pluginName": "CloudFoundry",
                                                               "pluginVersion": 21,
                                                               "type": "plugin",
                                                               "name": "Third Step",
                                                               "children": [
                                                                           ],
                                                               "properties": {
          
                                                                             }
                                                                             },
                                                               {
                                                               "type": "finish",
                                                               "name": "FINISH",
                                                               "children": [
                                                                           ]
                                                                           }
                                                                           ]
                                                                           }
 }),
           uri:myConstants.UCD_BASE_URL+'/cli/componentProcess/create',
           timeout:myConstants.UCD_TIMEOUT
            },function(err,res,body){
                           if (err===null)
                            {
                             if (res.statusCode===200 || res.statusCode===201)
                              {
                               
                               console.log("Creation of Component Process for Project Area is Established");
                               var resJSON = JSON.parse(body);
                               //console.log(resJSON)
                               console.log("---ucd_pacreateapplicationprocess is now called---");
                               ucd_pacreateapplicationprocess(project_name,authorization,project_name,no_of_environment,callback);
                      
                              }else{
                              	var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.UCD_COMPONENT_PROCESS_CREATE_ERR,JSON.stringify(res));
                                console.log(JSON.stringify(error));
                                callback(err,null);
                         
                              }     
                           }else{
                                var error = myError.seterror(myErrorConst.SERVICE_RUNTIME_EXCEPTION,myErrorConst.UCD_COMPONENT_PROCESS_CREATE_ERR,JSON.stringify(err));
                                console.log(JSON.stringify(error));
                                 ucd_pacdeleteenvironment(project_name,authorization,project_name,no_of_environment,callback);
                                ucd_padeletegroup(project_name,authorization,adminName,project_name,callback);
                                ucd_pateamdeletion(project_name,authorization,adminName,project_name,callback);
                                ucd_pacdeleteenvironment(project_name,authorization,project_name,no_of_environment,callback);
                                callback(err,null);
                            
                           };                           
                           });
 

};


//This Function creates an application process for Project Area in UCD
function ucd_pacreateapplicationprocess(project_name,authorization,project_name,no_of_environment,callback)
{
  console.log("Creation of Application Process for Project Area  has Started");
  project_name = project_name;
  request({
           headers:
                  {
                   'Authorization': authorization,
                   'Content-Type': 'application/json'
                   },
           method: "PUT",
           body: JSON.stringify({
           	                    "name": "ApplicationProcess-"+project_name,
                                "application": project_name,
                                "description": "New application process for command example",
                                "inventoryManagementType": "AUTOMATIC",
                                "offlineAgentHandling": "PRE_EXECUTION_CHECK",
                                "rootActivity": {
                                                 "type": "graph",
                                                 "name": "GRAPH",
                                                 "edges": [
                                                           {
                                                            "to": "Deploy component",
                                                            "type": "ALWAYS",
                                                            "value": ""
                                                           },
                                                           {
                                                             "to": "FINISH",
                                                             "from": "Deploy component",
                                                             "type": "ALWAYS",
                                                             "value": ""
                                                            }
                                                           ],
                                                              "offsets": [
                                                            {
                                                              "name": "Deploy component",
                                                              "x": "-35",
                                                              "y": "210"
                                                            },
                                                            {
                                                              "name": "FINISH",
                                                              "x": "0",
                                                              "y": "420"
                                                            }
                                                            ],
                                                              "children": [
                                                             {
                                                              "componentName": project_name,
                                                              "failFast": "false",
                                                              "runOnlyOnFirst": "false",
                                                              "maxIteration": "-1",
                                                              "type": "componentEnvironmentIterator",
                                                              "name": "Deploy component",
                                                              "children": [
                                                             {
                                                              "componentName": project_name,
                                                              "status": "Active",
                                                              "type": "inventoryVersionDiff",
                                                              "name": "inventoryVersionCheck",
                                                              "children": [
                                                             {
                                                              "componentName": project_name,
                                                              "componentProcessName": "Process-"+project_name,
                                                              "allowFailure": false,
                                                              "properties": {
                                                              },
                                                              "type": "componentProcess",
                                                              "name": "",
                                                              "children": [
                                                                          ]
                                                               }
                                                              ]
                                                             }
                                                            ]
                                                           },
                                                          {
                                                              "type": "finish",
                                                              "name": "FINISH",
                                                              "children": [
                                                                          ]
                                                           }
                                                           ],
                                                              "propDefs": [
                                                           ]
                                                           }
                                   
 }),
           uri:myConstants.UCD_BASE_URL+'/cli/applicationProcess/create',
           timeout:myConstants.UCD_TIMEOUT
            },function(err,res,body){
                           if (err===null)
                            {
                             if (res.statusCode===200 || res.statusCode===201)
                              {
                               
                               console.log("Creation of Application Process for Project Area is Established");
                               var resJSON = JSON.parse(body);
                               //console.log(resJSON)
                               console.log("---ucd_paaddgrouptoteam is now called---");
                               ucd_paaddgrouptoteam(project_name,authorization,adminName,project_name,group,callback);
                      
                              }else{

                                var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.UCD_APPLICATION_PROCESS_CREATE_ERR,JSON.stringify(res));
                                console.log(JSON.stringify(error));
                                callback(err,null);
                         
                              }     
                           }else{
                                var error = myError.seterror(myErrorConst.SERVICE_RUNTIME_EXCEPTION,myErrorConst.UCD_APPLICATION_PROCESS_CREATE_ERR,JSON.stringify(err));
                                console.log(JSON.stringify(error));
                                 ucd_pacdeleteenvironment(project_name,authorization,project_name,no_of_environment,callback);
                                ucd_padeletegroup(project_name,authorization,adminName,project_name,callback);
                                ucd_pateamdeletion(project_name,authorization,adminName,project_name,callback);
                                ucd_pacdeleteenvironment(project_name,authorization,project_name,no_of_environment,callback);
                                callback(err,null);
                            
                           };                           
                           });
 

};

