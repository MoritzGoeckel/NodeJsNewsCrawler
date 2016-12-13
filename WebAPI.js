var sources = require("./data/sources.json");
var articles = require("./data/articles.json");

var Download =  require('./Includes/Download.js');
var ArticleScanner = require('./Includes/ArticleScanner.js');
var LinkScanner = require('./Includes/LinkScanner.js');
var Article = require('./Includes/Article.js');
var Link = require('./Includes/Link.js');
var DataManager = require('./Includes/DataManager.js');

var DataAPI = require('./Includes/DataAPI.js');

//End imports

var word = "White";
var today = Math.floor(Date.now() / 1000 / 60 / 60 / 24);

var dm = new DataManager(function(){
    var api = new DataAPI(dm.client);
    api.getLinksToWords(["obama", "trump", "the"], function(result){
        console.log(result);
    });
});
