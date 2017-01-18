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

    api.getMostPopularWordsOnDay(getToday(), 15, function(popular){
        for(let i = 0; i < popular.length && i < 100; i++)
        {
            hw.getHeadlineForWord(popular[i].word, 7, 0.0, function(headline){
                
                api.getSameHeadlineCountForDayAndWord(getToday(), headline, function(related){
                    console.log(headline.join(" ") + " (" + related[0].word + ")");
                });
            });
        }
    });

    function getToday(){
        return Math.floor(Date.now() / 1000 / 60 / 60 / 24);
    }

});