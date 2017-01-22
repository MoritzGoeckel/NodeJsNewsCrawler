let sources = require("./data/sources.json");
let articles = require("./data/articles.json");

let Download =  require('./Includes/Download.js');
let ArticleScanner = require('./Includes/ArticleScanner.js');
let LinkScanner = require('./Includes/LinkScanner.js');
let Article = require('./Includes/Article.js');
let Link = require('./Includes/Link.js');
let DataManager = require('./Includes/DataManager.js');

let DataAPI = require('./Includes/DataAPI.js');
let HeadlineWriter = require('./Includes/HeadlineWriter.js');

 
//End imports

let dm = new DataManager(function()
{
    let api = new DataAPI(dm.client);
    let hw = new HeadlineWriter(api);

    hw.getHeadlinesToday(40, 15, 3, 0.01, function(result)
    {
        console.log(result);
    });

});