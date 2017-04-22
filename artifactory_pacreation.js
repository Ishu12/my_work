var sync = require('synchronize');
var	fiber = sync.fiber;
var	await = sync.await;
var	defer = sync.defer;
var express = require('express');
var  app     = express();
var http= require('https');
var request = require('request');
var myConstants = require('./constants.js');
var syncRequest = require('sync-request');
var myError = require('./error.js');
var myErrorConst = require('./errorconst.js');
var authorization =  myConstants.ARTIFACTORY_APIKEY;
// var step = 0;
var bodyParser = require('body-parser');
app.use(bodyParser.json());
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// var repotype = "generic";
// var url;




module.exports = {
 artifactory_pacreation:function(reqBody, callback){
  console.log("ARTIFACTORY PROJECT AREA CREATION METHOD STARTED: "+JSON.stringify(reqBody));
  var adminName = reqBody.admin_id;
  var project_name = reqBody.project_name;

  var resp1 = artifactory_pacreation(project_name,authorization,adminName,project_name,callback);
  var url = myConstants.ARTIFACTORY_BASE_URL+"/artifactory";
 }
  };


//This Function Creates a Project Area in Artifactory
function artifactory_pacreation(project_name,authorization,adminName,project_name,callback)
{
  console.log("Project Area is getting Created");
  adminName = adminName;
  project_name = project_name;
  var repotype = "generic";
  request({
           headers:
                  {
                   'X-JFrog-Art-Api': authorization,
             'Content-Type': 'application/json'
                   },
           method: "PUT",
           body: JSON.stringify({"key":project_name,"rclass" : "local", "packageType" : repotype }),
           uri:myConstants.ARTIFACTORY_BASE_URL+'/artifactory/api/repositories/'+project_name,
           timeout:myConstants.ARTIFACTORY_TIMEOUT
            },function(err,res,body){
                           if (err===null)
                            {
                          if (res.statusCode===200 || res.statusCode===201)
                          {
                            console.log("Project created");
                              for(var i = 0 ; i < 2 ; i ++)
                               {
                                if(i===0)
                                 {
                                 var grouptype = "Admin-";
                                 var body = {"description" : "This Group belongs to Project Admins" };
                                 artifactory_pagroupcreation(project_name,authorization,grouptype,body,adminName,callback);
                                 }else{
                                 var grouptype = "Dev-";
                                 var body = {"description" : "This Group belongs to Project Developers" };
                                 artifactory_pagroupcreation(project_name,authorization,grouptype,body,adminName,callback);
                                 };
                                 };
                               
                                var admingroup = "Admin-"+project_name;
                                var devgroup = "Dev-"+project_name;
                                console.log("admingroup--->"+admingroup);
                                console.log("devgroup--->"+devgroup);
                                console.log("---pa_permission_scheme_creation is now called---");
                                console.log("project create result : "+res);
                                artifactory_pa_permission_scheme_creation(project_name,authorization,admingroup,devgroup,project_name,callback);
                                var grouptype = "Admin-";
                                artifactory_user_existence_check(project_name,authorization,adminName,grouptype,callback)
                      
                        }else{
                          var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.ARTIFACTORY_PROJECT_CREATE_ERR,JSON.stringify(res));
                          console.log(JSON.stringify(error));
                          callback(error,null);
                        }     
                  }else{
                            var error = myError.seterror(myErrorConst.SERVICE_RUNTIME_EXCEPTION,myErrorConst.ARTIFACTORY_PROJECT_CREATE_ERR,JSON.stringify(err));
                            console.log(JSON.stringify(error));
                            callback(error,null);
                            
                        };                           
                                  });
};

//This Function Deletes a Project Area in Artifactory
function artifactory_padeletion(project_name,authorization,adminName,project_name,callback)
{
  console.log("Project Area is getting Deleted");
  adminName = adminName;
  project_name = project_name;
  request({
           headers:
                  {
                   'X-JFrog-Art-Api': authorization,
             'Content-Type': 'application/json'
                   },
           method: "DELETE",
           uri:myConstants.ARTIFACTORY_BASE_URL+'/artifactory/api/repositories/'+project_name,
           timeout:myConstants.ARTIFACTORY_TIMEOUT
            },function(err,res,body){
                           if (err===null)
                            {
                          if (res.statusCode===200 || res.statusCode===201)
                          {
                            console.log("Project Deleted");
                      
                        }else{
                          var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.ARTIFACTORY_PROJECT_DELETION_ERR,JSON.stringify(res));
                          console.log(JSON.stringify(error));
                          callback(error,null);
                        }     
                  }else{
                            var error = myError.seterror(myErrorConst.SERVICE_RUNTIME_EXCEPTION,myErrorConst.ARTIFACTORY_PROJECT_DELETION_ERR,JSON.stringify(err));
                            console.log(JSON.stringify(error));
                            callback(error,null);
                            
                        };                           
                                  });
};

//This Function creates a permission scheme for a Project Area in Artifactory and assigns admins to that scheme.
function artifactory_pa_permission_scheme_creation(project_name,authorization,admingroup,devgroup,project_name,callback)
{
  console.log("Permission Scheme for the project area is getting Created");
  //adminName = adminName;
  project_name = project_name;
  request({
           headers:
                  {
                   'X-JFrog-Art-Api': authorization,
             'Content-Type': 'application/json'
                   },
           method: "PUT",
           body: JSON.stringify({"repositories": [project_name],"principals": {
                                                                              "groups":{
                                                                                       [admingroup]:["d","w","n", "r"],
                                                                                       [devgroup]:["m","r","n"]
                                                                                      }
                                                                               
    }}),
           uri:myConstants.ARTIFACTORY_BASE_URL+'/artifactory/api/security/permissions/PermissionScheme-'+project_name,
           timeout:myConstants.ARTIFACTORY_TIMEOUT
            },function(err,res,body){
                           if (err===null)
                            {
                          if (res.statusCode===200 || res.statusCode===201)
                          {
                            console.log("Project Permission Scheme Created");
                            var url = myConstants.ARTIFACTORY_BASE_URL+"/artifactory";
                            callback(url);
                      
                        }else{
                          var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.ARTIFACTORY_PA_PERMISSION_SCHEME_CREATION_ERR,JSON.stringify(res));
                          console.log(JSON.stringify(error));
                          console.log("---ROLLING BACK PROJECT AREA CREATION---");
                          artifactory_padeletion(project_name,authorization,adminName,project_name,callback);
                          console.log("---ROLLING BACK PROJECT AREA PERMISSION SCHEME CREATION---");
                          artifactory_pa_permission_scheme_deletion(project_name,authorization,adminName,project_name,callback);
                        }     
                  }else{
                          var error = myError.seterror(myErrorConst.SERVICE_RUNTIME_EXCEPTION,myErrorConst.ARTIFACTORY_PA_PERMISSION_SCHEME_CREATION_ERR,JSON.stringify(err));
                          console.log(JSON.stringify(error));
                          console.log("---ROLLING BACK PROJECT AREA CREATION---");
                          artifactory_padeletion(project_name,authorization,adminName,project_name,callback);
                          console.log("---ROLLING BACK PROJECT AREA PERMISSION SCHEME CREATION---");
                          artifactory_pa_permission_scheme_deletion(project_name,authorization,adminName,project_name,callback);
                           for(var i = 0 ; i < 2 ; i ++)
                               {
                                if(i===0)
                                 {
                                 var grouptype = "Admin-";
                                 var body = {"description" : "This Group belongs to Project Admins" };
                                 artifactory_pagroupdeletion(project_name,authorization,grouptype,callback);
                                 }else{
                                 var grouptype = "Dev-";
                                 var body = {"description" : "This Group belongs to Project Developers" };
                                 artifactory_pagroupdeletion(project_name,authorization,grouptype,callback);
                                 };
                                 };
                        };                           
                                  });
};

//This Function deletes a permission scheme for a Project Area in Artifactory
function artifactory_pa_permission_scheme_deletion(project_name,authorization,adminName,project_name,callback)
{
  console.log("Permission Scheme for the project area is getting Deleted");
  adminName = adminName;
  project_name = project_name;
  request({
           headers:
                  {
                   'X-JFrog-Art-Api': authorization,
             'Content-Type': 'application/json'
                   },
           method: "DELETE",
           uri:myConstants.ARTIFACTORY_BASE_URL+'/artifactory/api/security/permissions/PermissionScheme-'+project_name,
           timeout:myConstants.ARTIFACTORY_TIMEOUT
            },function(err,res,body){
                           if (err===null)
                            {
                          if (res.statusCode===200 || res.statusCode===201)
                          {
                            console.log("Project Permission Scheme Deleted");
                      
                        }else{
                          var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.ARTIFACTORY_PA_PERMISSION_SCHEME_DELETION_ERR,JSON.stringify(res));
                          console.log(JSON.stringify(error));
                        }     
                  }else{
                            var error = myError.seterror(myErrorConst.SERVICE_RUNTIME_EXCEPTION,myErrorConst.ARTIFACTORY_PA_PERMISSION_SCHEME_DELETION_ERR,JSON.stringify(err));
                            console.log(JSON.stringify(error));
                            
                        };                           
                                  });
};

function artifactory_pagroupcreation(project_name,authorization,grouptype,body,adminName,callback)
{
  console.log("Group for Project Area is getting Created");
  var options2 = 
    { 
    headers:
                 {
                  'X-JFrog-Art-Api': authorization,
            'Content-Type': 'application/json'
                   },
    body: JSON.stringify(body),
    };

        Data = syncRequest('PUT',myConstants.ARTIFACTORY_BASE_URL+'/artifactory/api/security/groups/'+grouptype+project_name,options2);
    Data1 = JSON.stringify(Data);
    console.log("----Group Created----");

};

//This Function deletes a group for a Project Area in Artifactory
function artifactory_pagroupdeletion(project_name,authorization,callback)
{
  console.log("Group for Project Area is getting Deleted")
  request({
          headers:
                 {
                  'X-JFrog-Art-Api': authorization,
                  'Content-Type': 'application/json'
                   },
           method: "DELETE",
           uri:myConstants.ARTIFACTORY_BASE_URL+'/artifactory/api/security/groups/'+grouptype+project_name,
           timeout:myConstants.ARTIFACTORY_TIMEOUT
            },function(err,res,body){
                           if (err===null)
                            {
                         if (res.statusCode===200 || res.statusCode===201)
                         {
                           console.log("Project Groups Deleted ");
                      
                       }else{
                         var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.ARTIFACTORY_GROUP_DELETION_ERR,JSON.stringify(res));
                         console.log(JSON.stringify(error));
                         callback(error,null);
                       }     
                 }else{
                           var error = myError.seterror(myErrorConst.SERVICE_RUNTIME_EXCEPTION,myErrorConst.ARTIFACTORY_GROUP_DELETION_ERR,JSON.stringify(err));
                           console.log(JSON.stringify(error));
                           artifactory_padeletion(project_name,authorization,callback);
                       };                           
                                  });
  };



//This function checks of the user already exists in Artifactory or not
function artifactory_user_existence_check(project_name,authorization,adminName,grouptype,callback)
{
  console.log("User Existence Check in progress");
  adminName = adminName;
  project_name = project_name;
  var group_name = grouptype + project_name
  var options = {
           headers:
                  {
                   'X-JFrog-Art-Api': authorization,
             'Content-Type': 'application/json'
                   },
           method: "GET",
           body: JSON.stringify({"email" : adminName, "password" : adminName }),
           timeout:myConstants.ARTIFACTORY_TIMEOUT
            };
           options['uri'] = encodeURI(myConstants.ARTIFACTORY_BASE_URL+'/artifactory/api/security/users/'+adminName);
           request(options,function(err,res,body){
                  if (err===null)
                    {
                      if (res.statusCode===200 || res.statusCode===201)
                        {
                          console.log("===Update User===");
                          artifactory_user_update(project_name,authorization,adminName,grouptype,body,callback)
                                            
                        }else if (res.statusCode===404){
                        
                          console.log("----User doesnot Exist----")
                          artifactory_new_user_assignment(project_name,authorization,adminName,grouptype,callback)
                        
                        }else{
                            
                            var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.ARTIFACTORY_USER_EXISTENCE_CHECK_ERROR,JSON.stringify(res));
                            console.log(JSON.stringify(error));
                            callback(error,null);
                             }     
                  }else{
                            var error = myError.seterror(myErrorConst.SERVICE_RUNTIME_EXCEPTION,myErrorConst.ARTIFACTORY_USER_EXISTENCE_CHECK_ERROR,JSON.stringify(err));
                            console.log(JSON.stringify(error));
                            callback(error,null);
                            
                        };                           
});
};


//This function creates a new user and assigns him/her to the admin group of the project he/she has created
function artifactory_new_user_assignment(project_name,authorization,adminName,grouptype,callback)
{
  console.log("User is getting assigned to the Admin Group");
  adminName = adminName;
  project_name = project_name;
  var group_name = grouptype + project_name
  var step = 0;
  var options = {
           headers:
                  {
                   'X-JFrog-Art-Api': authorization,
             'Content-Type': 'application/json'
                   },
           method: "PUT",
           body: JSON.stringify({"email" : adminName, "password" : adminName ,"internalPasswordDisabled": true,"groups" : [group_name]}),
           timeout:myConstants.ARTIFACTORY_TIMEOUT
            };
           options['uri'] = encodeURI(myConstants.ARTIFACTORY_BASE_URL+'/artifactory/api/security/users/'+adminName);
           request(options,function(err,res,body){
                  if (err===null)
                    {
                      if (res.statusCode===200 || res.statusCode===201)
                        {
                          console.log("===User is assigned to the Admin Group===");
                          step =1;

                        }else{
                            var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.ARTIFACTORY_NEW_USER_CREATION_ERROR,JSON.stringify(res));
                            console.log(JSON.stringify(error));
                            callback(error,null);
                        }     
                    }else{
                            var error = myError.seterror(myErrorConst.SERVICE_RUNTIME_EXCEPTION,myErrorConst.ARTIFACTORY_NEW_USER_CREATION_ERROR,JSON.stringify(err));
                            console.log(JSON.stringify(error));
                            callback(error,null);
                            
                        };                           
});
};





//This function updates the groups of the user and also assigns him/her to the admin group of the project he/she has created
function artifactory_user_update(project_name,authorization,adminName,grouptype,body,callback)
{
  console.log("User group is getting Updated");
  adminName = adminName;
  project_name = project_name;
  var group_name= '';
  var group_name2 = grouptype + project_name
  var existing_group = JSON.parse(body).groups;
  if (existing_group == undefined)
  {
    group_name = [group_name2];
    console.log(group_name)
  }else{
    existing_group.push(group_name2)
    group_name = existing_group
  }
  var options = {
           headers:
                  {
                   'X-JFrog-Art-Api': authorization,
                   'Content-Type': 'application/json'
                   },
           method: "PUT",
           body: JSON.stringify({"email" : adminName, "password" : adminName ,"internalPasswordDisabled": true,"groups" : group_name}),
           timeout:myConstants.ARTIFACTORY_TIMEOUT
            };
           options['uri'] = encodeURI(myConstants.ARTIFACTORY_BASE_URL+'/artifactory/api/security/users/'+adminName);
           request(options,function(err,res,body){
                        if (err===null)
                          {
                            if (res.statusCode===200 || res.statusCode===201)
                              {
                                  console.log("===User Group is Updated===");
                                            
                               }else{
                                  var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.ARTIFACTORY_USER_UPDATE_ERROR,JSON.stringify(res));
                                  console.log(JSON.stringify(error));
                                  callback(error,null);
                          }     
                          }else{
                                  var error = myError.seterror(myErrorConst.SERVICE_RUNTIME_EXCEPTION,myErrorConst.ARTIFACTORY_USER_UPDATE_ERROR,JSON.stringify(err));
                                  console.log(JSON.stringify(error));
                                  callback(error,null);
                            
                        };                           
                                  });
};

//This functions deletes the newly created user in case of Rollback
function artifactory_new_user_delete(project_name,authorization,adminName,grouptype,body,callback)
{
  console.log("User is getting Deleted");
  adminName = adminName;
  var options = {
           headers:
                  {
                   'X-JFrog-Art-Api': authorization,
                   'Content-Type': 'application/json'
                   },
           method: "DELETE",
           timeout:myConstants.ARTIFACTORY_TIMEOUT
            };
           options['uri'] = encodeURI(myConstants.ARTIFACTORY_BASE_URL+'/artifactory/api/security/users/'+adminName);
           request(options,function(err,res,body){
                        if (err===null)
                          {
                            if (res.statusCode===200 || res.statusCode===201)
                              {
                                  console.log("===User is Deleted===");
                                            
                               }else{
                                  var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.ARTIFACTORY_NEW_USER_DELETION_ERROR,JSON.stringify(res));
                                  console.log(JSON.stringify(error));
                                  callback(error,null);
                          }     
                          }else{
                                  var error = myError.seterror(myErrorConst.SERVICE_RUNTIME_EXCEPTION,myErrorConst.ARTIFACTORY_NEW_USER_DELETION_ERROR,JSON.stringify(err));
                                  console.log(JSON.stringify(error));
                                  callback(error,null);
                            
                        };                           
                                  });
};