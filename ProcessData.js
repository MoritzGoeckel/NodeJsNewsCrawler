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
    dm.getUnprocessedLinks(function(link){
        console.log(link);
        
        

        dm.client.incr("wordcount");
        dm.client.incr("wordcount:" + word);

    });

    //dm.disconnect();
});