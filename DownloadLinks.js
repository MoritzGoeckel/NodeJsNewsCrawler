var sources = require("./data/sources.json");
var articles = require("./data/articles.json");

var Download =  require('./Includes/Download.js');
var ArticleScanner = require('./Includes/ArticleScanner.js');
var LinkScanner = require('./Includes/LinkScanner.js');
var Article = require('./Includes/Article.js');
var Link = require('./Includes/Link.js');
var DataManager = require('./Includes/DataManager.js');

//End imports

var dm = new DataManager(function(){
    
    var s = new LinkScanner(function(sourceId, links){
        //console.log("###### " + sourceId + " ######");
        //console.log(links.length);

        dm.saveCurrentScan(sourceId, links);
    });

    for (i = 0; i < sources.length; i++)
    {
        console.log("Download: " + sources[i].name);
        new Download(s, sources[i].id, sources[i].url);
    }    

    //dm.deleteBlacklist("test");
    //dm.cleanSlate()
    /*dm.getLinks(function(link){
        console.log(link);
    });*/

    //dm.disconnect();
});