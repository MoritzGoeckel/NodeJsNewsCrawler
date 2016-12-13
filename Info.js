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
    
    //dm.deleteBlacklist("test");
    dm.client.info("memory", function(err, reply){
        var matches_array = reply.match(/used_memory_human:([0-9.MBK]*)/);
        console.log("Used memory: " + matches_array[1]);
        dm.disconnect();
    });
    //used_memory_human
});