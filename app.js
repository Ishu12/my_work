var express = require('express'),
	app     = express();
var cfenv = require("cfenv");
var appEnv = cfenv.getAppEnv();
var jira_app = require('./jira_app.js');
var gitlab_app = require('./gitlab_app.js');
var jenkins_app = require('./jenkins_app.js');
var artifactory = require('./artifactory_pacreation.js');
var UCD = require('./ucd_pacreation.js');
var bodyParser = require('body-parser');
var callback = require('callback');
var async = require('async');
var creation_error = [{"STATUS":"FAIL"}];
app.use(bodyParser.json());
var async = require('async');



// CORS Settings
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
	next();
});
// CORS Settings

app.post("/toolchain", function(req, resp){
  var reqBody = req.body;
  console.log("In toolchain function: "+JSON.stringify(reqBody));
  var tools = reqBody.tools;
  var creation_error = [{"STATUS":"FAIL"}]; 
  x=0;
  
  //Recursive function
  global.processItems = function(x)
  {  	
   if( x < tools.length ) {
   	 console.log("Process started for tool: "+tools[x].tool);
   	  
         
          /*gitlab_creation(x,reqBody,tools,projects_url,creation_error);
          //callback(null,"1");	
         
         	 jenkins_creation(x,reqBody,tools,projects_url,creation_error);*/
         	 //callback(null,"2");
         	 
             var r1 = gitlab_creation(x,reqBody,tools,creation_error,resp,function(response1){
             	resp.write(JSON.stringify(response1));
             	var r2 = jenkins_creation(x,reqBody,tools,creation_error,resp,function(response2){
             	resp.write(JSON.stringify(response2));
             	 var r3 = jira_creation(x,reqBody,tools,creation_error,resp,function(response3){
                 resp.write(JSON.stringify(response3));
                 var r4 = artifactory_creation(x,reqBody,tools,creation_error,resp,function(response4){
                resp.write(JSON.stringify(response4));
                var r5 = ucd_creation(x,reqBody,tools,creation_error,resp,function(response5){
                resp.write(JSON.stringify(response5));
                
                
             });
         	 });
             });
             });

             	
             });
             
            
            


  
  
         	//callback(null,"3");
         
          /* artifactory_creation(x,reqBody,tools,projects_url,creation_error),
           //callback(null,"4");	
        
               ucd_creation(x,reqBody,tools,projects_url,creation_error)     */          //callback(null,"5");
        
   	  	
      }
  };
  //End Recursive function
  processItems(x);
});

global.gitlab_creation = function(x,req1Body,tools,creation_error,resp,callback)
{
	var Tools = [ ];
    var projects_url = [{"STATUS":"OK"},{"Tools":Tools}];
  //console.log("Gitlab Function");
  //console.log("Tools array: "+JSON.stringify(tools[x].tool));
  
  if (tools[x].tool === "GitLab")
  {
  	console.log("Hi Gitlab");
    req1Body.private_token = tools[x].private_token;
	var gitLabGroupId = gitlab_app.gitlabpacreation(req1Body,function(response)
	{
    console.log("gitLabGroupId: "+response);
    Tools.push({"Tool":"Gitlab","Link":response});
    console.log(projects_url);
    
     return callback(Tools);
	    });	
  }else{
  	console.log("Gitlab not selected");
  	 //jira_creation(x,req1Body,tools,creation_error,resp);
  	 return callback( );
  }
}

global.jenkins_creation = function(x,req1Body,tools,creation_error,resp,callback)
{
	//console.log("Jenkins Function");
    //console.log("Tools array: "+JSON.stringify(tools[x].tool));
    var Tools = [ ];
    var projects_url = [{"STATUS":"OK"},{"Tools":Tools}];
	if(tools[x].tool == "Jenkins")
	{
		console.log("Hi Jenkins");
		req1Body.private_token = tools[x].private_token;
	    var jenkinsJobName = jenkins_app.jenkinspacreation(req1Body,function(response){ 
	    console.log("jenkins app.js: " +JSON.stringify(response));
		Tools.push({"Tool":"Jenkins","Link":JSON.stringify(response.project_url)});
		return callback(Tools);
         });
	}
	else{
		console.log("Jenkins not slected");
		return callback( );
	}
}

global.jira_creation = function(x,req1Body,tools,creation_error,resp,callback)
{
	//console.log("Tools: "+JSON.stringify(Tools));
	var Tools = [ ];
   var projects_url = [{"STATUS":"OK"},{"Tools":Tools}];
	if( tools[x].tool == "Jira" )
	{
		console.log("Hi Jira");
		req1Body.username = tools[x].username;
		var jiraProjectId = jira_app.jirapacreation(req1Body,function(response){
	    console.info("jiraprojectid: "+JSON.stringify(response.project_url));
		console.log("app.js for jira project: "+JSON.stringify(response.project_url));
		Tools.push({"Tool":"Jira","Link":JSON.stringify(response.project_url)});
		console.log(JSON.stringify(Tools));
		//return resp.json("all done");
		return callback(Tools);
	    });
	}
	else{
		console.log("Jira not selected");
		return callback( );
	}
}

global.artifactory_creation = function(x,req1Body,tools,creation_error,resp,callback)
{
	//console.log("Artifactory Function");
    //console.log("Tools array: "+JSON.stringify(tools[x].tool));
    var Tools = [ ];
    var projects_url = [{"STATUS":"OK"},{"Tools":Tools}];
	if(tools[x].tool === "Artifactory")
	{
		console.log("Hi Artifactory");
		req1Body.username = tools[x].username;
	    var artifactoryProjectId = artifactory.artifactory_pacreation(req1Body,function(response){
		Tools.push({"Tool":"Artifactory","Link":JSON.stringify(response)})
		return callback(Tools);
		  });
	}else{
		console.log("Artifactory not selected")
		return callback( );
	}
}

global.ucd_creation = function(x,req1Body,tools,creation_error,resp,callback)
{
	//console.log("UCD Function");
    //console.log("Tools array: "+JSON.stringify(tools[x].tool));
    var Tools = [ ];
    var projects_url = [{"STATUS":"OK"},{"Tools":Tools}];
	if(tools[x].tool === "UCD")
	{
		console.log("Hi UCD");
		req1Body.username = tools[x].username;
		var UCDProjectId = UCD.UCD_pacreation(req1Body,function(response){
		Tools.push({"Tool":"UCD",Link:JSON.stringify(response)});
		return callback(Tools);
	});
		x++;
		if(x === tools.length-1)
             	{
             	 resp.end();	
             	}
             	processItems(x);
		

		
	}else{
		console.log("UCD not selected");
	    x++;
		if(x === tools.length)
             	{
             	 resp.end();	
             	}
             	processItems(x);
		return callback( );

	}

	//return_result(x,req1Body,tools,projects_url,creation_error);
}

global.return_result = function(x,req1Body,tools,creation_error,resp)
{

  	console.log("projects_url");
      //resp.json(projects_url);
  
}

app.post("/gitlabpacreation", function(req, resp){

	gitlab_app.gitlabpacreation(req, function(res){

		console.log("res="+res);
		resp.json(res);
	});
});

app.post("/jenkinspacreation", function(req, resp){

	jenkins_app.jenkinspacreation(req, function(res){

		console.log("res="+res);
		resp.json(res);
	});
});

app.post("/jirapacreation", function(req, resp){

	jira_app.jirapacreation(req, function(res){

		console.log("res="+res);
		resp.json(res);
	});
});

app.post("/artifactorypacreation", function(req, resp){

	artifactory.artifactory_pacreation(req, function(res){

		console.log("res="+res);
		resp.json(res);
	});
});

app.post("/ucdpacreation", function(req, resp){

	UCD.UCD_pacreation(req, function(res){
    console.log("res="+res);
	resp.json(res);
	});
});

app.post("/sonarqubepacreation", function(req, resp){

	sonarqube.sonarqubepacreation(req, function(res){
    console.log("res="+res);
	resp.json(res);
	});
});

app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});