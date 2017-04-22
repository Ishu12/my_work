var express = require('express');
var app  = express();
var sync = require('synchronize');
var fiber = sync.fiber;
var await = sync.await;
var defer = sync.defer;
var sleep = require('system-sleep');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var request = require('request');

var myConstants = require('./constants.js');
var myError = require('./error.js');
var myErrorConst = require('./errorconst.js');
var gitURI = myConstants.GITLAB_URL;
var jenkinsURI = myConstants.JENKINS_BASE_URL;
var jenkinsTimeout = myConstants.JENKINS_TIMEOUT;


module.exports = {
    jenkinspacreation: function (req, callback) {
        var step = 0;
        console.log("jenkinspacreation method started: " + JSON.stringify(req));
        var token;
        token = req.private_token;
        var username = req.user_name;
        var newUser = req.admin_id;
        var jobName = req.project_name;
        var foldername = req.project_name;
        var project_url = jenkinsURI + "/job/" + jobName;
        var toolsname = req.tools_selected;
        var g_value = "no"; // for gitlab
        var s_value = "no"; // for sonar
        var a_value = "no"; // for artifactory
        var u_value = "no"; // for ucd

        var auth = 'Basic ' + new Buffer(username + ':' + token).toString('base64');

        for (var i = 0; i < toolsname.length; i++) {
            console.log("Value of toolsname-------->" + toolsname[i]);
            if (toolsname[i] === "GitLab") {
                g_value = "yes";
                console.log("Gitlab selected : " + g_value);
            }

            if (toolsname[i] === "SonarQube") {
                s_value = "yes";
                console.log("Sonar selected : " + s_value);
            }

            if (toolsname[i] === "Artifactory") {
                a_value = "yes";
                console.log("Artifactory selected : " + a_value);
            }

            if (toolsname[i] === "UrbanCode Deploy") {
                u_value = "yes";
                console.log("UCD selected : " + u_value);
            }

        }

                var result = {"project_url": project_url, "jobName": jobName, "auth": auth};
                var res1 = createjob(jobName,newUser, auth,g_value,s_value,a_value,u_value,result,callback);
                console.log("Value of res1------------------------------->"+res1);
                step = 1;
              
    }

};

// Function to trigger Jenkins job to create the entire pipeline
function createjob(jobName,newUser,auth,g_value,s_value,a_value,u_value,result,callback)
{

    console.log("createjob method started with job Name: " + jobName);

    var request = require('request');
    request({

        uri:jenkinsURI+'/job/Jenkins_Pipeline_Generator/buildWithParameters?token=pipeline&GitRepo=' + jobName + '&gURL=' + gitURI +  '&git=' + g_value + '&sonar=' + s_value + '&artifactory=' + a_value + '&ucd=' + u_value,
        headers: {
            'Authorization' : auth
        },
        method: "POST",
        timeout: jenkinsTimeout
    },function(err,res,body){

        if (err===null)
        {

            sleep(30000);
            status_for_pipeline_generator(jobName,newUser,auth,result,callback);
        }

        else
        {
            var error = myError.seterror(myErrorConst.SERVICE_RUNTIME_EXCEPTION,myErrorConst.JENKINS_JOB_CRT_ERR,JSON.stringify(err));
            console.log(JSON.stringify(error));
            callback(error,null);
        }

    });
};


//Function to check the status of the Jenkins_Pipeline_Generator job
function status_for_pipeline_generator(jobName,newUser,auth,result,callback)
{
    console.log("Checking the status of the pipeline generator job ");
    var request = require('request');

    request({

        uri:jenkinsURI+'/job/Jenkins_Pipeline_Generator/lastBuild/api/json' ,
        headers:{
            'Authorization' : auth
        },
        method: "GET",
        timeout: jenkinsTimeout
    },function(err,res,body){

        if (err === null)
        {
            var resJSON = JSON.parse(body);
            console.log(resJSON.result);

            if (resJSON.result == "SUCCESS"){

                console.log("Jenkins Pipeline is generated ");
                assignuser(jobName,auth,newUser,result,callback);
            }

            else
            {
                console.log("Failed to generate Jenkins Pipeline ");
                var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.JENKINS_JOB_CRT_ERR,JSON.stringify(res));
                console.log(JSON.stringify(error));

                callback(error,null);
            }


        }

        else
        {
            console.log("Error occurred while checking the status of the pipeline generator job "+err);
            callback(err,null);
        }

    });
};


// Function to trigger jenkins job to assign user to the job
function assignuser(jobName,auth,newUser,result,callback)
{
        console.log("assigning user " + newUser + " to the "+jobName + " job");
    //cn=projectliberty,ou=memberlist,ou=ibmgroups,o=ibm.com
    request({

        uri:jenkinsURI+'/job/jenkins_groups_permissions/job/assign_admin_role/buildWithParameters?token=token1&projectname=' + jobName + '&username=cn=Admin-' + jobName + ',ou=memberlist,ou=ibmgroups,o=ibm.com' + '&groupname=Admin-' + jobName,
        headers: {
            'Authorization' : auth
        },
        method:    "POST",
        timeout:   jenkinsTimeout
    },function(err,res,body){

        if (err===null)
        {
            sleep(20000);
            status_for_assignuser_job(jobName,auth,result,callback);
        }

        else
        {
            console.log(err);
            var error = myError.seterror(myErrorConst.SERVICE_RUNTIME_EXCEPTION,myErrorConst.JENKINS_USR_JOB_ASSN_ERR,JSON.stringify(err));
            console.log(JSON.stringify(error));
            callback(error,null);
        }

    });

};

//Function to check the status of the assign_user_role job
function status_for_assignuser_job(jobName,auth,result,callback)
{
    console.log("Checking the status of the assign_user_role job ");
    var request = require('request');



    request({

        uri:jenkinsURI+'/job/jenkins_groups_permissions/job/assign_admin_role/lastBuild/api/json' ,
        headers:{
            'Authorization' : auth
        },
        method: "GET",
        timeout: jenkinsTimeout
    },function(err,res,body){

        if (err===null)
        {
            var resJSON = JSON.parse(body);
            console.log(resJSON.result);

            if (resJSON.result == "SUCCESS"){

                console.log("User assigned to the job ");
                callback(result);
            }

            else
            {
                console.log("Failed to assign user ");
                var error = myError.seterror(myErrorConst.SERVICE_BUSINESS_EXCEPTION,myErrorConst.JENKINS_USR_JOB_ASSN_ERR,JSON.stringify(res));
                console.log(JSON.stringify(error));

                deleteFolder(auth,jobName,callback);
                callback(error,null);
            }


        }

        else
        {
            console.log("Error occurred while checking the status of the assign user role job "+err);
            callback(err,null);
        }

    });
};




//Function to delete the already existing folder
function deleteFolder(auth,foldername,callback)
{
    console.log("deleteFolder method started to delete job : "+foldername);
    console.log("url to be used for deletion : " + jenkinsURI+'/job/'+foldername+'/doDelete');
    var request = require('request');
    request({
        headers:{
            'Authorization' : auth
        },
        method: "POST",
        uri:jenkinsURI+'/job/'+foldername+'/doDelete',
        timeout: jenkinsTimeout
    },function(err,res,body){

        if (err===null)
        {
            if (res.statusCode===200 || res.statusCode===201 || res.statusCode===302)
            {
                console.log("Job "+foldername+" deleted ");
                //callback(null,body);
            }

            else
            {
                console.log("Status: "+res.statusCode+": Could not delete folder "+foldername+": "+body);
                callback(err,null);
            }
        }

        else
        {
            console.log("Error occurred while deleting the folder in Jenkins: "+err);
            callback(err,null);
        }

    });
};



//Compensation function
function jenkinspacompensation(reqBody,callback)
{

    console.log("jenkinspacompensation method started: "+JSON.stringify(reqBody));
    console.log("Folder Name: "+reqBody.jenkinsJobName.jobName)
    var step = reqBody.step;
    var delauth = reqBody.jenkinsJobName.auth;

    // Compensation
    if (step>0){
        console.log("Detected early job creation. Will delete the job.");
        try{
            var resDel = await(deleteFolder(reqBody.jenkinsJobName.jobName,delauth,reqBody.jenkinsJobName.jobName,defer()));
            console.log("Deleted the folder "+reqBody.jenkinsJobName.jobName)
        }catch(err){
            callback(err,null);
        }


    }

};