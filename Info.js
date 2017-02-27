let sources = require("./data/sources.json");
let articles = require("./data/articles.json");

let Download =  require('./Includes/Download.js');
let ArticleScanner = require('./Includes/ArticleScanner.js');
let LinkScanner = require('./Includes/LinkScanner.js');
let Article = require('./Includes/Article.js');
let Link = require('./Includes/Link.js');
let DataManager = require('./Includes/DataManager.js');

let config = require("./data/config.json");

//End imports

let dm = new DataManager(config.redisPort, function(){
    
    //dm.deleteBlacklist("test");
    dm.client.info(function(err, reply){
        console.log(reply);
        let matches_array = reply.match(/used_memory_human:([0-9.MBK]*)/);
        console.log("Used memory: " + matches_array[1]);
        dm.disconnect();
    });
    //used_memory_human
});