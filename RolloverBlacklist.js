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
    
    for (i = 0; i < sources.length; i++)
    {
        console.log("Switching blacklist: " + sources[i].name);
        dm.rolloverBlacklist(sources[i].id);        
    }   

    //dm.disconnect();
});