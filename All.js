var Sources = require("./data/sources.json");
//var Articles = require("./data/articles.json");

var Download =  require('./Includes/Download.js');
var ArticleScanner = require('./Includes/ArticleScanner.js');
var LinkScanner = require('./Includes/LinkScanner.js');
var Article = require('./Includes/Article.js');
var Link = require('./Includes/Link.js');
var DataManager = require('./Includes/DataManager.js');

var DataAPI = require('./Includes/DataAPI.js');

var Express = require('express');
var ExpressRest = require('express-rest');
 
var WebApi = require('./Includes/WebAPI.js');
var ProcessLink = require('./Includes/ProcessLink.js');

var Schedule = require('node-schedule');

//End imports

var dm = new DataManager(function()
{
    var api = new DataAPI(dm.client);
    
    var exp = Express();
    var rest = ExpressRest(exp);

    WebApi.createWebApi(exp, rest, api, 200, Sources);

    var listener = exp.listen(3000, function(){
        console.log('Listening on port ' + listener.address().port); //Listening on port 8888
    });

    //LinkScanner for Download
    var s = new LinkScanner(function(sourceId, links){
        dm.saveCurrentScan(sourceId, links);
    });

    //Every hour
    Schedule.scheduleJob('0 * * * *', function(){
        //DownloadLinks, send to scanner
        for (i = 0; i < Sources.length; i++)
        {
            console.log("Download: " + Sources[i].name);
            new Download(s, Sources[i].id, Sources[i].url);
        }
    });

    //Every hour
    Schedule.scheduleJob('10 * * * *', function(){
        //ProcessLinks
        dm.getUnprocessedLinks(function(link, linkId){
            console.log("Processing link: " + linkId);
            ProcessLink.processLink(link, linkId, dm);        
        });
    });

    //Every two days
    Schedule.scheduleJob('15 23 */2 * *', function(){
        //RolloverBlacklist
        for (i = 0; i < sources.length; i++)
        {
            console.log("Switching blacklist: " + Sources[i].name);
            dm.rolloverBlacklist(Sources[i].id);        
        }    
    });

    //dm.disconnect();
});