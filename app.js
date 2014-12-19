var request = require('request');
var async = require('async');
var fs = require('fs');
var CronJob = require('cron').CronJob;

var CRON_FOLDER = "./cronJobs";

async.waterfall([
    function(callback){
        loadCronJobs(callback);
    },
    function(results, callback){
        async.each(results, function(data, next){
            createCronJob(data, next);
        }, function(err){
            callback(err);
        });
    },
    function(callback){
        callback(null, 'done');
    }
], function (err, result) {
    console.log('cronjob setup done');
});

function loadCronJobs(callback)
{
    fs.readdir(CRON_FOLDER, function(err, files) {
        async.map(files, function(file, next) {
            var path = CRON_FOLDER + "/" + file;
            fs.readFile(path, 'utf8', function(err, data) {
                if (data) {
                    data = JSON.parse(data.toString());
                }
                next(err, data);
            });
        }, function(err, results) {
            callback(err, results);
        });
    });
}

function createCronJob(jsonObj, callback)
{
    new CronJob(jsonObj.cronSetting, function(){
        _sendMessage(jsonObj.payload);
        console.log('You will see this message every second');
    }, null, true, "Asia/Taipei");

    function _sendMessage(jsonObj)
    {
        var options = {
            url: 'https://hooks.slack.com/services/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',
            method: 'POST',
            json: jsonObj
        };

        request(options, function(err, response, body) {
            if (err) {
                console.log(err);
            }
            if (!err && response.statusCode == 200) {
                console.log(body);
            }
        });
    }

    callback(null);
}

