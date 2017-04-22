var express = require('express'),
    app     = express();
var cfenv = require("cfenv");
var appEnv = cfenv.getAppEnv();
var async = require('async');
var create_epic_flag = "true";
var create_story_flag = "true";
var create_task_flag = "true";
var epicname,storyname,taskname;
var epicid,storyid,taskid,epic_key,en,sn,tn;
var length;
var x;
module.exports = {
createissue:function(authorization,templates,projectid,jiraURI,JIRA_TIMEOUT,adminName,devgroup)
    {   
x=0;
global.processItems = function(x){
   if( x < templates.length ) {
      create_epic(authorization,jiraURI,JIRA_TIMEOUT,projectid,adminName,templates[x].Epic,templates[x].Story,templates[x].Task); 
   }
};
processItems(x);
   
    }
};
//-------------------------------------create epic---------------------------------------------------//
function create_epic(authorization,jiraURI,JIRA_TIMEOUT,projectid,adminName,epic,story,task)
{
    if(epic === epicname){
     create_story(authorization,jiraURI,JIRA_TIMEOUT,projectid,adminName,story,task)
    }else if(epic != epicname)
    {
      epicid = "null";
    epicname = epic;
    var request = require('request');
    if(create_epic_flag == "true")
    {
        request({
                headers:{'Authorization': authorization,
                    'Content-Type': 'application/json'
                },
                uri:jiraURI+'/rest/api/2/issue',
                method: "POST",
                body:  JSON.stringify({
                    "fields":
                    {
                        "project": { "id": projectid },
                        "summary": epicname,
                        "issuetype": {"id": "10000" },
                        "assignee": {"name": adminName },
                        "reporter": {"name": adminName },
                        "description": "description",
                        "customfield_10007": epicname,
                    }
                }),
                timeout: JIRA_TIMEOUT,
            },
            function(err,res,body){
                //console.log("In response handling part");
                if (err===null){
                    if (res.statusCode===200 || res.statusCode===201){
                        var resJSON = JSON.parse(body);
                        epicid = resJSON.id;
                       // console.log("main: "+epicname);
                        console.log("Epic name: "+epicname);
                        if(epicid != "null"){
                        create_story(authorization,jiraURI,JIRA_TIMEOUT,projectid,adminName,story,task)}
                    }else{
                        console.log("Error occurred while creating the epic in Jira:  "+JSON.stringify(res));
                    }
                }else{
                    console.log("Error occurred while creating the epic in Jira: "+JSON.stringify(res));
                }
            }
        );
      }
    }
}

//-------------------------------------epic created---------------------------------------------------//

//-------------------------------------create story----------------------------------------------------//
function create_story(authorization,jiraURI,JIRA_TIMEOUT,projectid,adminName,story,task)
{
  if(story == storyname){
    console.log("same story");
    console.log("task sent: "+task);
   create_task(authorization,jiraURI,JIRA_TIMEOUT,projectid,adminName,task);
  }
   else if(story != storyname){
      storyname = story;
      storyid = "null";
    var request = require('request');
        request({
                headers:{'Authorization': authorization,
                    'Content-Type': 'application/json'
                },
                uri:jiraURI+'/rest/api/2/issue',
                method: "POST",
                body: JSON.stringify({ "fields": {
                    "project": {
                        "id": projectid
                    },
                    "summary": storyname,
                    "issuetype": {
                        "name": "Story"
                    },
                    "assignee": {
                        "name": adminName
                    },
                    "customfield_10005": epic_key
                } }),
                timeout: JIRA_TIMEOUT

            },function(err,res,body,callback){
                if (err===null){
                    if (res.statusCode===200 || res.statusCode===201){
                        var resJSON = JSON.parse(body);
                        storyid = resJSON.id;
                        console.log("Story name: "+storyname);
                        create_task(authorization,jiraURI,JIRA_TIMEOUT,projectid,adminName,task); 
                    }else{
                        console.log("Error occurred while creating the story in Jira:"+JSON.stringify(res));
                    }
                }else{
                    console.log("Error occurred while creating the story in Jira:  "+JSON.stringify(res));
                }
            }
        ); 
        }     
}
//-------------------------------------story created----------------------------------------------------//

//-------------------------------------link epic and story-----------------------------------------------//
function epic_story(authorization,jiraURI,JIRA_TIMEOUT)
{
   //console.log("epic story linking start");
   var request = require('request');
   request({
      headers:{'Authorization': authorization,
      'Content-Type': 'application/json'
         },
      uri:jiraURI+'/rest/api/2/issueLink',
      method: "POST",
      body:  JSON.stringify({ 
     "type":
     {"name":"Relates"},
     "inwardIssue":{"id":storyid},"outwardIssue":{"id":epicid}
      }),
        timeout: JIRA_TIMEOUT

        },function(err){
                                  if (err===null){
                            console.log("epic and story linked");
                            story_task(authorization,jiraURI,JIRA_TIMEOUT);
                           }else{
                                 console.log("Error occurred while linking story to epic: "+res.statusCode+": "+JSON.stringify(res));
                                }
          }
            ); 
}
//-------------------------------------epic and story linked----------------------------------------------//

//--------------------------------------create task-------------------------------------------------------//
function create_task(authorization,jiraURI,JIRA_TIMEOUT,projectid,adminName,task)
{
  console.log("task entery");
  if(taskname === task || task === "null"){
    console.log("same task");
  epic_story(authorization,jiraURI,JIRA_TIMEOUT);
  }else if(taskname != task && task != "null"){
      taskname = task;
      console.log("different task");
      taskid = "null";
  var request = require('request');
  request({
      headers:{'Authorization': authorization,
      'Content-Type': 'application/json'
         },
      uri:jiraURI+'/rest/api/2/issue',
      method: "POST",
      body:  JSON.stringify({ "fields": {
        "project": {
            "id": projectid
        },
        "summary": taskname,
        "issuetype": {
            "name": "Task"
        },
        "assignee": {
            "name": adminName
        },
        "customfield_10005": epic_key
   } }),
        timeout: JIRA_TIMEOUT

        },function(err,res,body,callback){
                                  if (err===null){
                          if (res.statusCode===200 || res.statusCode===201){
                                  var resJSON = JSON.parse(body);
                                  taskid = resJSON.id;
                                  console.log("Task name: "+taskname);
                                   
                                    epic_task(authorization,jiraURI,JIRA_TIMEOUT);

                           }else{
                                 console.log("Error occurred while creating the task in Jira: : "+JSON.stringify(res));
                                }
                                  }else{
                                    console.log("Error occurred while creating the task in Jira: "+JSON.stringify(res));
                                       }
          }
            ); 
}
}
//--------------------------------------task created-------------------------------------------------------//

//---------------------------------------epic and task linking---------------------------------------------//
function epic_task(authorization,jiraURI,JIRA_TIMEOUT)
{
var request = require('request');
   request({
      headers:{'Authorization': authorization,
      'Content-Type': 'application/json'
         },
      uri:jiraURI+'/rest/api/2/issueLink',
      method: "POST",
      body:  JSON.stringify({ 
      "type":
     {"name":"Relates"},
     "inwardIssue":{"id":taskid},"outwardIssue":{"id":epicid}
 }),
        timeout: JIRA_TIMEOUT

        },function(err){
                                  if (err===null){
                                    console.log("epic and task linked");
                                    epic_story(authorization,jiraURI,JIRA_TIMEOUT)
                        }else{
                                 console.log("Error occurred while linking epic to task: : "+JSON.stringify(res));
                                }
                              
          }
            );  
}
//-------------------------------------------story task linking----------------------------------------------------//
function story_task(authorization,jiraURI,JIRA_TIMEOUT)
{
  var request = require('request');
   request({
      headers:{'Authorization': authorization,
      'Content-Type': 'application/json'
         },
      uri:jiraURI+'/rest/api/2/issueLink',
      method: "POST",
      body: JSON.stringify({ 
      "type":
     {"name":"Relates"},
     "inwardIssue":{"id":taskid},"outwardIssue":{"id":storyid}
 }),
        timeout: JIRA_TIMEOUT

        },function(err,res,body){
                                  if (err===null){
                                    console.log("story and task linked");
                                     x++; 
                                     processItems(x);
                           }else{
                                 console.log("Error occurred while linking story to task: "+res.statusCode+": "+JSON.stringify(res));
                                }
          }
            ); 
}
//--------------------------------------------story linked to task---------------------------------------------------//