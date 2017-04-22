var express = require('express');
var app     = express();

var sync = require('synchronize');
var fiber = sync.fiber;
var await = sync.await;
var defer = sync.defer;
var project_url;

var myConstants = require('./constants.js');

var myError = require('./error.js');
var myErrorConst = require('./errorconst.js');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var guiId, projectId, groupId;
var token;
var gitLabURI = myConstants.GITLAB_BASE_URL;
var gitLabTimeout = myConstants.GITLAB_TIMEOUT;

var bodyParser = require('body-parser');
app.use(bodyParser.json());

module.exports = {
	gitlabpacreation:function(reqBody,callback){

		var step = 0;

		console.log("gitlabpacreation method started: "+JSON.stringify(reqBody));
		guiId = reqBody.GUID;
		token = reqBody.private_token;
		var projectName = reqBody.project_name;
		//var groupName = reqBody.group_name;
		var groupName = reqBody.project_name;
		var groupDesc = reqBody.group_desc;
		var userName = reqBody.admin_id;
		userName = userName.substring(0,userName.indexOf("@"));
		var accessLevel = reqBody.access_level;
		var res1 = createproject(projectName,groupName,groupDesc,userName,accessLevel,callback);

		/*fiber(function() {
			try{
				var res1 = await(createproject(projectName,defer()));
				projectId = JSON.parse(res1).id;
				project_url = myConstants.GITLAB_URL+"/"+groupName+"/"+projectName;
				console.log("Project ID: "+projectId);
				console.log("Project url: " +project_url);
				step = 1;

				var res2 = await(creategroup(groupName,groupDesc,defer()));
				groupId = JSON.parse(res2).id;
				console.log("Group ID: "+groupId);
				step = 2;

				var res3 = await(transprojtogrp(projectId,groupId,defer()));
				step = 3;

				var res4 = await(getuidbyuname(userName,defer()));
				userId = JSON.parse(res4)[0].id;
				console.log("User ID: "+groupId);
				step = 4;

				var res5 = await(transusertogrp(groupId,userId,accessLevel,defer()));
				step = 5;

				callback(null,project_url);
			}catch(err) {

				if (step===0){
					console.log("No early commit detected. Nothing to compensate!");
				}
				else{

					console.log("Early commit detected. Will compensate now...");
					var comp_req = {"step":step,"project_id":projectId,"group_id":groupId};
					require('./gitlab_app.js').gitlabpacompensation(comp_req);
				}

				callback(err,null);
			}
		});*/
	},

	//Compensation function
	gitlabpacompensation:function(reqBody){

		console.log("gitlabpacompensation method started: "+JSON.stringify(reqBody));

		var step = reqBody.step;

		// Compensation
		if (step===1){
			console.log("Detected early project creation. Will delete the project.");
			deleteproject(reqBody.project_id);
		}
		else if (step===2){
			console.log("Detected early project creation. Will delete the project.");
			deleteproject(reqBody.project_id);
			console.log("Detected early project creation. Will delete the project.");
			deletegroup(reqBody.group_id);
		}
		else{
			console.log("Detected early inclusion of project into group. Will delete the group.");
			deletegroup(reqBody.group_id);
		}
	}
};


function createproject(projectName,groupName,groupDesc,userName,accessLevel,callback){

	console.log("createproject method started with projectName: "+projectName);

	var request = require('request');
	request({
			uri:gitLabURI+'/projects?name='+projectName,
			headers:{'Private-Token': token},
			method: "POST",
			timeout: gitLabTimeout
		},function(err,res,body){

			if (err===null){

				var resJSON = JSON.parse(body);
				if (res.statusCode===200 || res.statusCode===201){

					console.log("Project "+projectName+" created with id: "+resJSON.id);
					var res2 = creategroup(projectName,groupName,groupDesc,resJSON.id,userName,accessLevel,callback);

					
				}else{

					var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.GITLAB_PRJ_CRT_ERR,JSON.stringify(res));
					console.log(JSON.stringify(error));

					callback(error,null);
				}
			}else{

				var error = myError.seterror(myErrorConst.SERVICE_RUNTIME_EXCEPTION,myErrorConst.GITLAB_PRJ_CRT_ERR,JSON.stringify(err));
				console.log(JSON.stringify(error));

				callback(error,null);
			}
		}
	);
}


function deleteproject(projectId){

	console.log("deleteproject method started to delete project with id: "+projectId);

	var request = require('request');
	request({
			uri:gitLabURI+'/projects/'+projectId,
			headers:{'Private-Token': token},
			method: "DELETE",
			timeout: gitLabTimeout
		},function(err,res,body){

			if (err===null){

				if (res.statusCode===200 || res.statusCode===201){

					console.log("Project deleted with id "+projectId+": "+body);
				}else{
					console.log("Status: "+res.statusCode+": Could not delete project with id "+projectId+": "+body);
				}
			}else{

				console.log("Error occurred while deleting the project in GitLab: "+err);
			}
		}
	);
}

function creategroup(projectName,groupName, groupDesc,projectid,userName,accessLevel,callback){

	console.log("creategroup method started with groupName: "+groupName+" and groupDesc: "+groupDesc);

	var request = require('request');
	request({
			uri:gitLabURI+'/groups',
			headers:{'Private-Token': token},
			method: "POST",
			body: "name="+groupName+"&path="+groupName+"&description="+groupDesc,
			timeout: gitLabTimeout
		},function(err,res,body){

			if (err===null){

				if (res.statusCode===200 || res.statusCode===201){

					var resJSON = JSON.parse(body);
					console.log("Group "+groupName+" created with id: "+resJSON.id);
                    var res3 = transprojtogrp(projectName,groupName,projectid,resJSON.id,userName,accessLevel,callback);
				}else{

					var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.GITLAB_GRP_CRT_ERR,JSON.stringify(res));
					console.log(JSON.stringify(error));
                    deleteproject(projectid);
					callback(error,null);
				}
			}else{

				var error = myError.seterror(myErrorConst.SERVICE_RUNTIME_EXCEPTION,myErrorConst.GITLAB_GRP_CRT_ERR,JSON.stringify(err));
				console.log(JSON.stringify(error));
                 deleteproject(projectid);
				callback(error,null);
			}
		}
	);
}

function deletegroup(groupId){

	console.log("deletegroup method started to delete group with id: "+groupId);

	var request = require('request');
	request({
			uri:gitLabURI+'/groups/'+groupId,
			headers:{'Private-Token': token},
			method: "DELETE",
			timeout: gitLabTimeout
		},function(err,res,body){

			if (err===null){


				if (res.statusCode===200 || res.statusCode===201){

					var resJSON = JSON.parse(body);
					console.log("Group deleted with id "+groupId+": "+body);
				}else{
					console.log("Status: "+res.statusCode+": Could not delete project with id "+groupId+": "+body);
				}
			}else{

				console.log("Error occurred while deleting the group in GitLab: "+err);
			}
		}
	);
}

function transprojtogrp(projectName,groupName,projectId,groupId,userName,accessLevel,callback){

	console.log("transprojtogrp method started to transfer project with id: "+projectId+" to group with id: "+groupId);

	var request = require('request');
	request({
			uri:gitLabURI+'/groups/'+groupId+'/projects/'+projectId,
			headers:{'Private-Token': token},
			method: "POST",
			timeout: gitLabTimeout
		},function(err,res,body){

			if (err===null){

				if (res.statusCode===200 || res.statusCode===201){

					var resJSON = JSON.parse(body);
					console.log("Project with id "+projectId+" added into group with id "+groupId);

					var res4 = getuidbyuname(projectName,groupName,groupId,userName,accessLevel,callback);
				}else{

					var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.GITLAB_PRJ_GRP_ASSN_ERR,JSON.stringify(res));
					console.log(JSON.stringify(error));
                    deletegroup(groupId);
					callback(error,null);
				}
			}else{

				var error = myError.seterror(myErrorConst.SERVICE_RUNTIME_EXCEPTION,myErrorConst.GITLAB_PRJ_GRP_ASSN_ERR,JSON.stringify(err));
				console.log(JSON.stringify(error));
                deletegroup(groupId);
				callback(error,null);
			}
		}
	);
}

function getuidbyuname(projectName,groupName,groupId,userName,accessLevel,callback){

	console.log("getuidbyuname method started with userName: "+userName);

	var request = require('request');
	request({
			uri:gitLabURI+'/users?username='+userName,
			headers:{'Private-Token': token},
			method: "GET",
			timeout: gitLabTimeout
		},function(err,res,body){

			if (err===null){

				if (res.statusCode===200 || res.statusCode===201){

					var resJSON = JSON.parse(body);
					console.log("== "+JSON.stringify(resJSON));
					if (resJSON.length>0){
						console.log("The id for userName "+userName+" is retrieved as: "+resJSON[0].id);
                        transusertogrp(projectName,groupName,groupId,resJSON[0].id, accessLevel,callback)
						
					}else{

						var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.GITLAB_USRID_USRNAME_ERR,"Username doesnot exists: "+userName);
						console.log(JSON.stringify(error));

						
					}
				}else{

					var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.GITLAB_USRID_USRNAME_ERR,JSON.stringify(err));
					console.log(JSON.stringify(error));

					callback(error,null);
				}
			}else{

				var error = myError.seterror(myErrorConst.SERVICE_RUNTIME_EXCEPTION,myErrorConst.GITLAB_USRID_USRNAME_ERR,JSON.stringify(err));
				console.log(JSON.stringify(error));

				callback(error,null);
			}
		}
	);
}

function transusertogrp(projectName,groupName,groupId, userId, accessLevel, callback){
    console.log(groupId, userId, accessLevel);
	console.log("transusertogrp method started with user with id: "+userId+" moving to group with id: "+groupId+" with access level: "+accessLevel);

	var request = require('request');
	request({
			uri:gitLabURI+'/groups/'+groupId+'/members',
			headers:{'Private-Token': token},
			method: "POST",
			body: "user_id="+userId+"&access_level="+accessLevel,
			timeout: gitLabTimeout
		},function(err,res,body){

			if (err===null){


				if (res.statusCode===200 || res.statusCode===201){

					var resJSON = JSON.parse(body);
					console.log("User with id "+userId+" added into group with id "+groupId);
				    var project_url = myConstants.GITLAB_URL+"/"+groupName+"/"+projectName;
				    callback(project_url);
				}else{

					var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.GITLAB_USRID_GRP_ASSN_ERR,JSON.stringify(res));
					console.log(JSON.stringify(error));

					callback(error,null);
				}
			}else{

				var error = myError.seterror(myErrorConst.SERVICE_RUNTIME_EXCEPTION,myErrorConst.GITLAB_USRID_GRP_ASSN_ERR,JSON.stringify(res));
				console.log(JSON.stringify(error));

				callback(error,null);
			}
		}
	);
}