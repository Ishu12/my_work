var express = require('express'),
	app     = express();
var cfenv = require("cfenv");
var appEnv = cfenv.getAppEnv();
var jira_app = require('./jira_app.js');
var bodyParser = require('body-parser');
var callback = require('callback');
var async = require('async');
var Tools = [ ];
var projects_url = [{"STATUS":"OK"},{"Tools":Tools}];
var creation_error = [{"STATUS":"FAIL"}];
app.use(bodyParser.json());

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
	x=0;

global.processItems = function(reqBody,tools,x,resp){
	 if( x < tools.length) {
      creation(reqBody,tools,x);
 }
 };
creation(reqBody,tools,x);

   /*fiber(function() {
      try{
			var req1Body = reqBody;
			delete req1Body["tools"];
			for (var i=0;i<tools.length;i++){
                console.log("Process started for tool: "+tools[i].tool);
				if (tools[i].tool==="GitLab"){
					req1Body.private_token = tools[i].private_token;
					console.log("hi gitlab");
				}
				else if(tools[i].tool==="Jenkins"){
				req1Body.private_token = tools[i].private_token;
					console.log("hi jenkins");
				}
				else if(tools[i].tool==="Jira"){
				    req1Body.username = tools[i].username;
					var jiraProjectId = await(jira_app.jirapacreation(req1Body,defer()));
					console.log("app.js: "+JSON.stringify(jiraProjectId));
				}
				else if(tools[i].tool==="Artifactory"){
					console.log("hi artifactory");
				}
				else if(tools[i].tool==="UCD"){
					req1Body.username = tools[i].username;
					console.log("hi UCD");
				}
				else{
					var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.TOOLCHAIN_INPUT_VALIDATION_ERR,"No valid tool provided");
					console.log(JSON.stringify(error));
					throw new Error("FAIL");
				}
			}
            resp.json("projects created");
			if(jiraProjectId){
			console.log("result has come");
			jira_app.wbs(jiraProjectId);
		}
		}catch(err) {
			console.log(err);
			}
			console.log("Error while creating project");
	});*/
});
global.creation = function(req1Body,tools,x,callback)
{
	console.log("requested body: " +req1Body);
	console.log("requested body printed");
	console.log("Tools: " +tools);
	console.log("Loop: " +x);
	
    if (tools[x].tool === "GitLab"){
					req1Body.private_token = tools[x].private_token;
					console.log("hi gitlab");
				}
				else if(tools[x].tool === "Jenkins"){
				    req1Body.private_token = tools[x].private_token;
					console.log("hi jenkins");
				}
				else if(tools[x].tool === "Jira"){
				    req1Body.username = tools[x].username;
				
				    	var jiraProjectId = jira_app.jirapacreation(req1Body,function(response){
				    		
				    			console.info("app.js for jira project: "+JSON.stringify(response));
				    			var jiraProjectId = JSON.stringify(response);
				    			var jira_url = jiraProjectId.project_url;
					Tools.push({"Tool":"Jira","Link":jira_url});


				    		});
				    	
						
				
					/*function(err)
					{
						if(err)
						{
                               console.log(err);
						}else{
                               console.log("app.js: "+JSON.stringify(jiraProjectId));
                               x++;
				               creation(req1Body,tools,x);
						}
					})*/
				}
				else if(tools[x].tool === "Artifactory"){
					console.log("hi artifactory");
				}
				else if(tools[x].tool === "UCD"){
					req1Body.username = tools[i].username;
					console.log("hi UCD");
				}
				else{
					var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.TOOLCHAIN_INPUT_VALIDATION_ERR,"No valid tool provided");
					console.log(JSON.stringify(error));
					throw new Error("FAIL");
				}
				
	resp.json(projects_url);

			}
app.post("/jirapacreation", function(req, resp){

	jira_app.jirapacreation(req, function(res){

		console.log("res="+res);
		console.log(res);
	});
});
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});