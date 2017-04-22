//---------------------------------------Variables Declarations---------------------------------------------------//
var express = require('express'),
  app     = express();
var key;
var myConstants = require('./constants.js');
var ptemplate = require('./project_template.js');
var myError = require('./error.js');
var myErrorConst = require('./errorconst.js');
var unam = myConstants.JIRA_ID;
var password = myConstants.JIRA_PASSWORD;
var buffer = new Buffer(unam + ':' + password);
var base64String = buffer.toString('base64');
var authorization = 'Basic ' + base64String ;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var jiraURI = myConstants.JIRA_BASE_URL;
var JIRA_TIMEOUT = myConstants.JIRA_TIMEOUT;
var bodyParser = require('body-parser');
app.use(bodyParser.json());
var project_url;

console.log("In Jira_app.js");

//------------------------------------------------Declarations done for variables--------------------------------------//

//------------------------------------------------Cloudant-------------------------------------------------------------//
var number_of_templates;
var db;
var Cloudant = require('cloudant');
var id;
var fileToUpload;
var db;
var dbCredentials = {
  dbName : 'jiraprojectarea'
};

/*function initDBConnection() {
    //When running on Bluemix, this variable will be set to a json object
    //containing all the service credentials of all the bound services
    if (process.env.VCAP_SERVICES) {
        var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
        // Pattern match to find the first instance of a Cloudant service in
        // VCAP_SERVICES. If you know your service key, you can access the
        // service credentials directly by using the vcapServices object.
        for (var vcapService in vcapServices) {
            if (vcapService.match(/cloudant/i)) {
                dbCredentials.url = vcapServices[vcapService][0].credentials.url;
            }
        }
    } else { //When running locally, the VCAP_SERVICES will not be set

        // When running this app locally you can get your Cloudant credentials
        // from Bluemix (VCAP_SERVICES in "cf env" output or the Environment
        // Variables section for an app in the Bluemix console dashboard).
        // Alternately you could point to a local database here instead of a
        // Bluemix service.
        // url will be in this format: https://username:password@xxxxxxxxx-bluemix.cloudant.com
        dbCredentials.url = "https://a12f4a70-1ebe-42a5-9a5d-989cb785866a-bluemix:2eaeb6d74bcbdc35ff7038d222b7c7d340d3bc5839e2007f87ebddc9a6ddeb6b@a12f4a70-1ebe-42a5-9a5d-989cb785866a-bluemix.cloudant.com" ;
    }

    cloudant = require('cloudant')(dbCredentials.url);
  db = cloudant.use(dbCredentials.dbName);
} 

initDBConnection();*/
function initDBConnection() {

var username = 'ef85e4f5-3782-40ce-9b74-76a4b8529304-bluemix';
var password = '1c90ed7397f56148dd6a3497136b4a1c2d8c41ec6725460fd5b8c41e21b9b242';
var cloudant = Cloudant({account:username, password:password});


        db = cloudant.use(dbCredentials.dbName);

};

initDBConnection();

//--------------------------------------------------------------------------Cloudant---------------------------------------------------------------------//

//--------------------------------------------------------------------------MAIN FUNCTION TO BE EXPORTED----------------------------------------------------------------------//  
module.exports = {
                   jirapacreation:function(reqBody,callback)
                    {
                     console.log("JIRA PROJECT AREA CREATION METHOD STARTED: "+JSON.stringify(reqBody));
                     var adminName = reqBody.admin_id;
                     var projectname = reqBody.project_name;
                     var uname = reqBody.username;
                     var resp1 = jiracreateadmingroup(adminName,projectname,uname,callback); 

                     //var result = {"authorization":authorization,"jiraURI":jiraURI,"JIRA_TIMEOUT":JIRA_TIMEOUT,"project_name":projectname,"project_url":jiraURI,"project_id":project_id,"scheme_id":scheme_id,"admin_group":admin_group,"dev_group":dev_group,"adminName":adminName,"projectname":projectname}
                  //callback(null,"jira_app"); 
                    },
                     wbs:function(reqBody)
                      {
                        var templates = [ ];
                        db.find({selector:{Service:'WebApp'}}, function(er, result) 
                        {
                        if (er) {
                           throw er;
                                }
                        console.log("wbs for jira_app: "+JSON.stringify(reqBody));
                        console.log('Found %d documents', result.docs.length);
                        for (var i = 0; i < result.docs.length; i++) 
                        {
                         templates = result.docs[i].Template;
                         number_of_templates = result.docs[i].Template.length;
                        }
                        ptemplate.createissue(reqBody.authorization,templates,reqBody.project_id,reqBody.jiraURI,reqBody.JIRA_TIMEOUT,reqBody.adminName,reqBody.dev_group);
                        }); 
                      },

//---------------------------------------------Main Rollback of Jira Tool-----------------------------------------------------//
//---------------------------------------------Main Rollback of Jira Tool-----------------------------------------------------//
                       jirapacompensation:function(reqBody)
                       {
                        console.log("jirapacompensation method started: "+JSON.stringify(reqBody));
                        console.log("Detected early project creation. Will delete the project.");
                        type="project";
                        rollback_pa(reqBody.data.adminName,reqBody.data.projectname,type,reqBody.data.project_id,callback)
                        console.log("Detected early project creation. Will delete the permission scheme.");
                        type="permissionscheme";
                        rollback_pa(reqBody.data.adminName,reqBody.projectname,type,reqBody.data.scheme_id,callback);
                        console.log("Detected early project creation. Will delete the admin group.");
                        type="group";
                        rollback_group(reqBody.data.adminName,reqBody.data.projectname,type,reqBody.data.admin_group,callback);
                        console.log("Detected early project creation. Will delete the dev group.");
                        rollback_group(reqBody.data.adminName,reqBody.data.projectname,type,reqBody.data.dev_group,callback);   
                       }
  };
//---------------------------------------------------------------------------END OF MAIN FUNCTION------------------------------------------------------------------------------//  
//----------------------------------------CREATE ADMIN GROUP WITH BLUEGROUP- ------------------------------------------------------------------------------------------------------------------//
 
 function jiracreateadmingroup(adminName,projectname,uname,callback)
 {
   var request = require('request');
  var admin_group = "cn=admin_"+projectname+",ou=memberlist,ou=ibmgroups,o=ibm.com"
  request({
      headers:{'Authorization': authorization,
      'Content-Type': 'application/json'
         },
      uri:jiraURI+'/rest/api/2/group',
      method: "POST",
      body: JSON.stringify({"name" : admin_group,"users":{"size":"1","items":[{"name":adminName}],}}),
        timeout: JIRA_TIMEOUT

        },function(err,res,body){
                                  if (err===null){
                          if (res.statusCode===200 || res.statusCode===201){
                                  var resJSON = JSON.parse(body);
                        console.log("ADMIN GROUP CREATED");
                        jiracreatedevgroup(adminName,projectname,uname,admin_group,callback)
                           }else{
                                 console.log("Error occurred while creating the project in Jira: "+res.statusCode+": "+JSON.stringify(res));
                                  var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.JIRA_GROUP_CREATE_ERR,"PROBLEM WHILE CREATING ADMIN GROUP IN JIRA");
                                  console.log(JSON.stringify(error));
                                  //callback(error,null);
                                }
                                  }else{
                                    console.log("Error occurred while creating the project in GitLab: "+res.statusCode+": "+JSON.stringify(res));
                                    var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.JIRA_GROUP_CREATE_ERR,"PROBLEM WHILE CREATING ADMIN GROUP IN JIRA");
                                    console.log(JSON.stringify(error));
                                   // callback(error,null);
                                       }
          }
            );  
 }
//-----------------------------------------ADMIN GROUP CREATED WITH BLUEGROUP--------------------------------------------------------------//
//-----------------------------------------DEV GROUP CREATION WITH BLUEGROUP-------------------------------------------------------------------------------------------------------------------//
function jiracreatedevgroup(adminName,projectname,uname,admin_group,callback)
 {
   
  var request = require('request');
  var dev_group = "cn=dev_"+projectname+",ou=memberlist,ou=ibmgroups,o=ibm.com"
  request({
      headers:{'Authorization': authorization,
      'Content-Type': 'application/json'
         },
      uri:jiraURI+'/rest/api/2/group',
      method: "POST",
      body: JSON.stringify({"name" : dev_group,"users":{"size":"1","items":[{"name":adminName}],}}),
        timeout: JIRA_TIMEOUT
        },function(err,res,body){
                                  if (err===null){
                          if (res.statusCode===200 || res.statusCode===201){
                                  var resJSON = JSON.parse(body);
                        console.log("DEV GROUP CREATED");
                        jiracreateuser(adminName,projectname,uname,admin_group,callback)
                        
                           }else{
                                  var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.JIRA_GROUP_CREATE_ERR,"PROBLEM WHILE CREATING DEV GROUP IN JIRA");
                                  console.log(JSON.stringify(error));
                                  type="group";
                                  rollback_group(adminName,projectname,type,admin_group)
                                  //callback(error,null);
                                }
                                  }else{
                                    var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.JIRA_GROUP_CREATE_ERR,"PROBLEM WHILE CREATING DEV GROUP IN JIRA");
                                    console.log(JSON.stringify(error));
                                    type="group";
                                    rollback_group(adminName,projectname,type,admin_group)
                                    //callback(error,null);
                                       }
          }
            );  
 }
//-----------------------------------------DEV GROUP CREATED WITH BLUEGROUP---------------------------------------------------------------------------------------------------------------------//

//---------------------------------------------Create User---------------------------------------------------------------//
function jiracreateuser(adminName,projectname,uname,admin_group,callback)
 {
   
  var request = require('request');
  var dev_group = "cn=dev_"+projectname+",ou=memberlist,ou=ibmgroups,o=ibm.com"
  request({
      headers:{'Authorization': authorization,
      'Content-Type': 'application/json'
         },
      uri:jiraURI+'/rest/api/2/user',
      method: "POST",
      body: JSON.stringify({ "name": adminName,
    "emailAddress": adminName,
    "displayName": adminName}),
        timeout: JIRA_TIMEOUT
        },function(err,res,body){
                                  if (err===null){
                          if (res.statusCode===200 || res.statusCode===201){
                                  var resJSON = JSON.parse(body);
                        console.log("User Created CREATED");
                        createpermissionscheme(adminName,projectname,uname,admin_group,dev_group,callback)
                        
                           }else{
                                   createpermissionscheme(adminName,projectname,uname,admin_group,dev_group,callback)
                                }
                                  }else{
                                    createpermissionscheme(adminName,projectname,uname,admin_group,dev_group,callback)
                                       }
          }
            );  
 }
//---------------------------------------------User created---------------------------------------------------------------//

//--------------------------------------CREATE PROJECT FUNCTION----------------------------------------------------------------------------------------------------------------------//
function createproject(adminName,projectname,uname,scheme_id,admin_group,dev_group,callback)
{
    
     var ke =  projectname.toUpperCase(); 
     key = "A"+ ke.substr(1);


    console.log("project key is "+key); 
   var request = require('request');
  request({
      
       headers:{'Authorization': authorization,
      'Content-Type': 'application/json'
                 },
      uri:jiraURI+'/rest/api/2/project',
      method: "POST",
      body: JSON.stringify({"key": key,
          "name":projectname,
          "projectTypeKey":"Software",
          "projectTemplateKey":"com.pyxis.greenhopper.jira:gh-scrum-template",
          "description":projectname,
          "lead":adminName,
          "url": encodeURI(jiraURI),
          "assigneeType":"PROJECT_LEAD" }),
                 timeout: JIRA_TIMEOUT
        },function(err,res,body){
                                  if (err===null){
                          if (res.statusCode===200 || res.statusCode===201){
                                                                 var resJSON = JSON.parse(body);
                                                       console.log("Project created");
                                                       console.log(resJSON)
                                                                 var project_id = (resJSON.id);
                                                               assign_scheme_project(adminName,projectname,uname,project_id,scheme_id,admin_group,dev_group,callback);                                                             
                            }else{
                                    var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.JIRA_PROJECT_CREATE_ERR,"PROBLEM WHILE CREATING PROJECT IN JIRA");
                                    console.log(JSON.stringify(error));
                                    console.log("Error occurred while creating the project in Jira"+JSON.stringify(res));
                                    type="group";
                                     rollback_group(adminName,projectname,type,admin_group);
                                     rollback_group(adminName,projectname,type,dev_group);
                                     type="permissionscheme";
                                     rollback_pa(adminName,projectname,type,scheme_id);
                                     //callback(error,null);
                                    
                                  }
                              }else{
                                  var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.JIRA_PROJECT_CREATE_ERR,"PROBLEM WHILE CREATING PROJECT IN JIRA");
                                  console.log(JSON.stringify(error));
                                   console.log("Error occurred while creating the project in Jira"+JSON.stringify(res));
                                   type="group";
                                 rollback_group(adminName,projectname,type,admin_group);
                                 type="group";
                                 rollback_group(adminName,projectname,type,dev_group);
                                 type="permissionscheme";
                                 rollback_pa(adminName,projectname,type,scheme_id);
                                 //callback(error,null);
                               
                                    }
                                 }
          );
};
//------------------------------------------------------PROJECT CREATED-------------------------------------------------------------------------//

//---------------------------------------------------------------CREATE PERMISSION SCHEME FOR PROJECT--------------------------------------------------------------------------------------//
function createpermissionscheme(adminName,projectname,uname,admin_group,dev_group,callback)
{
var request = require('request');
request({
  headers:{'Authorization': authorization,
      'Content-Type': 'application/json'
        },
      uri:jiraURI+'/rest/api/2/permissionscheme',
      method: "POST",
      body: JSON.stringify({
        "name": "PermissionScheme_"+projectname,
                "description": "description",
                "permissions": [ {
                "holder": {
                "type": "group",
                "parameter": admin_group
                           },
                "permission": "ADMINISTER_PROJECTS"
                   },
                {
                "holder": {
                "type": "group",
                "parameter": dev_group
                          },
                "permission": "BROWSE_PROJECTS"
                   },
                   {
                "holder": {
                "type": "group",
                "parameter": admin_group
                          },
                "permission": "BROWSE_PROJECTS"
                   },
                 {
                 "holder": {
                  "type": "group",
                  "parameter": dev_group
                           },
                 "permission": "VIEW_DEV_TOOLS"
                   },
                    {
                 "holder": {
                  "type": "group",
                  "parameter": admin_group
                           },
                 "permission": "VIEW_DEV_TOOLS"
                   },
            {
                "holder": {
                "type": "group",
                "parameter": dev_group
                          },
                "permission": "ASSIGNABLE_USER"
            },
             {
                "holder": {
                "type": "group",
                "parameter": admin_group
                          },
                "permission": "ASSIGNABLE_USER"
            },
            {
                "holder": {
                 "type": "group",
                "parameter": dev_group
                          },
                "permission": "ASSIGN_ISSUES"
           },
            {
                "holder": {
                 "type": "group",
                "parameter": admin_group
                          },
                "permission": "ASSIGN_ISSUES"
           },
           {
            "holder": {
            "type": "group",
                "parameter": dev_group
                       },
            "permission": "CLOSE_ISSUES"
                       },
                        {
            "holder": {
            "type": "group",
                "parameter": admin_group
                       },
            "permission": "CLOSE_ISSUES"
                       },
                        {
                "holder": {
                 "type": "group",
                "parameter": admin_group
                          },
                "permission": "ASSIGN_ISSUES"
           },
           {
            "holder": {
            "type": "group",
                "parameter": admin_group
                       },
            "permission": "CLOSE_ISSUES"
                       },
           {
                "holder": {
                 "type": "group",
                "parameter": dev_group
                          },
                "permission": "CREATE_ISSUES"
            },
            {
                "holder": {
                 "type": "group",
                "parameter": admin_group
                          },
                "permission": "CREATE_ISSUES"
            },
            {
                "holder": {
                 "type": "group",
                "parameter": admin_group
                          },
                 "permission": "DELETE_ISSUES"
            },
            {
                "holder": {
                "type": "group",
                "parameter": dev_group
                          },
                "permission": "EDIT_ISSUES"
            },
             {
                "holder": {
                 "type": "group",
                "parameter": admin_group
                          },
                 "permission": "DELETE_ISSUES"
            },

            {
                "holder": {
                "type": "group",
                "parameter": admin_group
                          },
                "permission": "EDIT_ISSUES"
            },
            {
                 "holder": {
                 "type": "group",
                "parameter": dev_group
                           },
                "permission": "LINK_ISSUES"
            },
              {
                 "holder": {
                 "type": "group",
                "parameter": admin_group
                           },
                "permission": "LINK_ISSUES"
            },
            {
                "holder": {
                 "type": "group",
                "parameter": dev_group
                          },
                 "permission": "MODIFY_REPORTER"
            },
             {
                "holder": {
                 "type": "group",
                "parameter": admin_group
                          },
                 "permission": "MODIFY_REPORTER"
            },
           {
                "holder": {
                "type": "group",
                "parameter": dev_group
                          },
                "permission": "MOVE_ISSUES"
           
           },
           {
                "holder": {
                 "type": "group",
                "parameter": dev_group
                          },
                "permission": "RESOLVE_ISSUES"
           
           },
           {
                "holder": {
                 "type": "group",
                "parameter": dev_group
                          },
                 "permission": "SCHEDULE_ISSUES"
           },
           {
                "holder": {
                 "type": "group",
                "parameter": dev_group
                           },
                 "permission": "SET_ISSUE_SECURITY"
           },
           {
                "holder": {
                "type": "group",
                "parameter": dev_group
                          },
                 "permission": "TRANSITION_ISSUES"
           },
            {
                "holder": {
                "type": "group",
                "parameter": admin_group
                          },
                "permission": "MOVE_ISSUES"
           
           },
           {
                "holder": {
                 "type": "group",
                "parameter": admin_group
                          },
                "permission": "RESOLVE_ISSUES"
           
           },
           {
                "holder": {
                 "type": "group",
                "parameter": admin_group
                          },
                 "permission": "SCHEDULE_ISSUES"
           },
           {
                "holder": {
                 "type": "group",
                "parameter": admin_group
                           },
                 "permission": "SET_ISSUE_SECURITY"
           },
           {
                "holder": {
                "type": "group",
                "parameter": admin_group
                          },
                 "permission": "TRANSITION_ISSUES"
           },
           {
                 "holder": {
                "type": "group",
                "parameter": admin_group
                           },
                 "permission": "MANAGE_WATCHERS"
           },
           {
                "holder": {
                "type": "group",
                "parameter": dev_group
                          },
                "permission": "VIEW_VOTERS_AND_WATCHERS"
            },
            {
                 "holder": {
                "type": "group",
                "parameter": dev_group
                           },
               "permission": "ADD_COMMENTS"
             },
             {
                "holder": {
                "type": "group",
                "parameter": admin_group
                          },
                "permission": "DELETE_ALL_COMMENTS"
             },
            {
                "holder": {
                "type": "group",
                "parameter": admin_group
                          },
                "permission": "DELETE_OWN_COMMENTS"
            },
            {
                "holder": {
                 "type": "group",
                "parameter": admin_group
                          },
                "permission": "EDIT_ALL_COMMENTS"
            },
            {
                "holder": {
                 "type": "group",
                "parameter": dev_group
                          },
                 "permission": "EDIT_OWN_COMMENTS"
            },
            {
                "holder": {
                "type": "group",
                "parameter": dev_group
                         },
                 "permission": "CREATE_ATTACHMENTS"
            },
            {
                "holder": {
                 "type": "group",
                "parameter": admin_group
                          },
                "permission": "DELETE_ALL_ATTACHMENTS"
            },
            {
                "holder": {
                "type": "group",
                "parameter": admin_group
                          },
               "permission": "DELETE_OWN_ATTACHMENTS"
            },
            {
                "holder": {
                "type": "group",
                "parameter": admin_group
                          },
                "permission": "DELETE_ALL_WORKLOGS"
            },
            {
                "holder": {
                 "type": "group",
                "parameter": admin_group
                         },
                "permission": "DELETE_OWN_WORKLOGS"
            },
            {
                 "holder": {
                 "type": "group",
                "parameter": admin_group
                           },
                 "permission": "EDIT_ALL_WORKLOGS"
            },
            {
                "holder": {
                "type": "group",
                "parameter": dev_group
                          },
                 "permission": "EDIT_OWN_WORKLOGS"
            },
            {
                "holder": {
                "type": "group",
                "parameter": dev_group
                          },
                "permission": "WORK_ON_ISSUES"
            },
    
       ],

   }),
        
  timeout: JIRA_TIMEOUT
    },function(err,res,body){
                if (err===null){
        if (res.statusCode===200 || res.statusCode===201){
                    var resJSON = JSON.parse(body);
          console.log("Permission schema created");
          var scheme_id = resJSON.id;
          console.log(scheme_id);
          createproject(adminName,projectname,uname,scheme_id,admin_group,dev_group,callback);
        }else{
          
            var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.JIRA_SCHEME_CREATE_ERR,"PROBLEM WHILE CREATING PERMISSION SCHEME IN JIRA");
            console.log(JSON.stringify(error));
             console.log("Error occurred while creating the permissionscheme in Jira"+JSON.stringify(res));
            type="group";
            rollback_group(adminName,projectname,type,admin_group);
            rollback_group(adminName,projectname,type,dev_group);
            //callback(error,null);
             }
         }else{
               var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.JIRA_SCHEME_CREATE_ERR,"PROBLEM WHILE CREATING PERMISSION SCHEME IN JIRA");
               console.log(JSON.stringify(error));
                console.log("Error occurred while creating the permission in Jira"+JSON.stringify(res));
               type="group";
               rollback_group(adminName,projectname,type,admin_group);
               rollback_group(adminName,projectname,type,dev_group);
               //callback(error,null);
              }
           }
  );
};
//------------------------------------------------------------PERMISSION SCHEME CREATED----------------------------------//
//------------------------------------------------------------ASSIGN PERMISSION SCHEME TO PROJECT----------------------------------------------------------------------------------//
function assign_scheme_project(adminName,projectname,uname,project_id,scheme_id,admin_group,dev_group,callback)
{
var request = require('request');
request({
    headers:{'Authorization': authorization,
    'Content-Type': 'application/json'
             },
       uri:jiraURI+'/rest/api/2/project/'+project_id+'/permissionscheme',
       method: "PUT",
     body: JSON.stringify({"id": scheme_id,
           }),
     timeout: JIRA_TIMEOUT
     },function(err,res,body){
                if (err===null){
        if (res.statusCode===200 || res.statusCode===201){
                    var resJSON = JSON.parse(body);
          console.log("Project assigned to scheme");

           assign_user_to_group(adminName,projectname,uname,project_id,scheme_id,admin_group,dev_group,callback)
          
        }else{
          var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.JIRA_SCHEME_ASSIGN_ERR,"PROBLEM WHILE ASSIGNING PERMISSION SCHEME TO PROJECT IN JIRA");
          console.log(JSON.stringify(error));
          type="group";
          rollback_group(adminName,projectname,type,admin_group);
          rollback_group(adminName,projectname,type,dev_group);
          type="permissionscheme";
          rollback_pa(adminName,projectname,type,scheme_id);
          type="project";
          rollback_pa(adminName,projectname,type,project_id);
          //callback(error,null);
        }
          }else{
            var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.JIRA_SCHEME_ASSIGN_ERR,"PROBLEM WHILE ASSIGNING PERMISSION SCHEME TO PROJECT IN JIRA");
            console.log(JSON.stringify(error));
            type="group";
            rollback_group(adminName,projectname,type,admin_group);
            type="group";
            rollback_group(adminName,projectname,type,dev_group);
            type="permissionscheme";
            rollback_pa(adminName,projectname,type,scheme_id);
            type="project";
            rollback_pa(adminName,projectname,type,project_id);
            //callback(error,null);
      }
    }
  );
};

//--------------------------------------------------------PERMISSION ASSIGNED TO SCHEME-------------------------------------//
//---------------------------------------------------------ASSIGN USER TO ADMIN ROLE-------------------------------------//
function assign_user_to_group(adminName,projectname,uname,project_id,scheme_id,admin_group,dev_group,callback)
{
  var request = require('request');
request({
    headers:{'Authorization': authorization,
    'Content-Type': 'application/json'
             },
       uri:jiraURI+'/rest/api/2/group/user?groupname='+admin_group,
       method: "POST",
     body: JSON.stringify({"name": uname,
           }),
     timeout: JIRA_TIMEOUT
     },function(err,res,body){
                if (err===null){
        if (res.statusCode===200 || res.statusCode===201){
                    var resJSON = JSON.parse(body);
          console.log("User assigned to admin group");
          assign_user_to_group1(adminName,projectname,uname,project_id,scheme_id,admin_group,dev_group,callback);
          
        }else{
          console.log("Error occurred while assigning user: "+JSON.stringify(res));
          type="group";
          rollback_group(adminName,projectname,type,admin_group);
          rollback_group(adminName,projectname,type,dev_group);
          type="permissionscheme";
          rollback_pa(adminName,projectname,type,scheme_id);
          type="project";
          rollback_pa(adminName,projectname,type,project_id);
         // callback("error",null);
        }
          }else{
            console.log("Error occurred while assigning user: "+JSON.stringify(res));
            type="group";
            rollback_group(adminName,projectname,type,admin_group);
            type="group";
            rollback_group(adminName,projectname,type,dev_group);
            type="permissionscheme";
            rollback_pa(adminName,projectname,type,scheme_id);
            type="project";
            rollback_pa(adminName,projectname,type,project_id);
            //callback(error,null);
      }
    }
  );


}
function assign_user_to_group1(adminName,projectname,uname,project_id,scheme_id,admin_group,dev_group,callback)
{
  var request = require('request');
request({
    headers:{'Authorization': authorization,
    'Content-Type': 'application/json'
             },
       uri:jiraURI+'/rest/api/2/group/user?groupname='+dev_group,
       method: "POST",
     body: JSON.stringify({"name": uname,
           }),
     timeout: JIRA_TIMEOUT
     },function(err,res,body){
                if (err===null){
        if (res.statusCode===200 || res.statusCode===201){
                    var resJSON = JSON.parse(body);
          console.log("User assigned to dev group");
          assign_user_to_group2(adminName,projectname,uname,project_id,scheme_id,admin_group,dev_group,callback);
          
        }else{
          console.log("Error occurred while assigning user: "+res.statusCode+": "+JSON.stringify(res));
          type="group";
          rollback_group(adminName,projectname,type,admin_group);
          rollback_group(adminName,projectname,type,dev_group);
          type="permissionscheme";
          rollback_pa(adminName,projectname,type,scheme_id);
          type="project";
          rollback_pa(adminName,projectname,type,project_id);
         // callback("error",null);
        }
          }else{
            console.log("Error occurred while assigning user: "+res.statusCode+": "+JSON.stringify(res));
            type="group";
            rollback_group(adminName,projectname,type,admin_group);
            type="group";
            rollback_group(adminName,projectname,type,dev_group);
            type="permissionscheme";
            rollback_pa(adminName,projectname,type,scheme_id);
            type="project";
            rollback_pa(adminName,projectname,type,project_id);
            //callback(error,null);
      }
    }
  );

}
function assign_user_to_group2(adminName,projectname,uname,project_id,scheme_id,admin_group,dev_group,callback)
{
  var request = require('request');
  request({
    headers:{'Authorization': authorization,
    'Content-Type': 'application/json'
             },
       uri:jiraURI+'/rest/api/2/group/user?groupname='+dev_group,
       method: "POST",
     body: JSON.stringify({"name": adminName,
           }),
     timeout: JIRA_TIMEOUT
     },function(err,res,body){
                if (err===null){
        if (res.statusCode===200 || res.statusCode===201){
                    var resJSON = JSON.parse(body);
          console.log("User assigned");
          var result = {"authorization":authorization,"jiraURI":jiraURI,"JIRA_TIMEOUT":JIRA_TIMEOUT,"project_name":projectname,"project_url":jiraURI,"project_id":project_id,"scheme_id":scheme_id,"admin_group":admin_group,"dev_group":dev_group,"adminName":adminName,"projectname":projectname}
          //callback(null,result);
          var response = "jira_app";
          return callback(result);
            }else{
          console.log("Error occurred while assigning user: "+res.statusCode+": "+JSON.stringify(res));
          type="group";
          rollback_group(adminName,projectname,type,admin_group);
          rollback_group(adminName,projectname,type,dev_group);
          type="permissionscheme";
          rollback_pa(adminName,projectname,type,scheme_id);
          type="project";
          rollback_pa(adminName,projectname,type,project_id);
          //callback("error",null);
        }
          }else{
            console.log("Error occurred while assigning user: "+res.statusCode+": "+JSON.stringify(res));
            type="group";
            rollback_group(adminName,projectname,type,admin_group);
            type="group";
            rollback_group(adminName,projectname,type,dev_group);
            type="permissionscheme";
            rollback_pa(adminName,projectname,type,scheme_id);
            type="project";
            rollback_pa(adminName,projectname,type,project_id);
            //callback(error,null);
      }
    }
  );
  }
//---------------------------------------Assign user part done-------------------------------------------------------//

//--------------------------------------------------------FUNCTIONS TO ROLLBACK------------------------------------------------------------------------------------------------------------//
function rollback_pa(adminName,projectname,type,type_id)
{
var request = require('request');
request({
    headers:{'Authorization': authorization,
    'Content-Type': 'application/json'
             },
       uri:jiraURI+'/rest/api/2/'+type+'/'+type_id,
       method: "DELETE",
    
     timeout: JIRA_TIMEOUT
     },function(err,res,body){  
     if (err===null){   
          console.log(type+ " deleted");
        }else{
         var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.ROLLBACK_ERR,"PROBLEM WHILE DELETING " + type+" IN JIRA");
         console.log(JSON.stringify(error));
         //callback(error,null);
        }                         
      } 
  );
}
function rollback_group(adminName,projectname,type,type_id,callback)
{
var request = require('request');
request({
    headers:{'Authorization': authorization,
    'Content-Type': 'application/json'
             },
       uri:jiraURI+'/rest/api/2/'+type+'?groupname='+type_id,
       method: "DELETE",
     timeout: JIRA_TIMEOUT
     },function(err,res,body){
      if (err===null){
                    console.log("Group deleted"); 
                    }else{
                    var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.ROLLBACK_ERR,"PROBLEM WHILE DELETING GROUP IN JIRA");
                    console.log(JSON.stringify(error));
                    //callback(error,null);
                    }               
                            } 
  );
}
//---------------------------------------------------------ROLLBACK DONE-----------------------------------------------------------------------------------------------------------------//
