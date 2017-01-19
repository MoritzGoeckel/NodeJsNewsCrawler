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

    let allHeadlines = [];

    let amount = 20;

    api.getMostPopularWordsOnDay(getToday(), 15, function(popular){
        for(let i = 0; i < popular.length && i < amount; i++)
        {
            hw.getProccessedHeadlineForWord(popular[i].word, 5, 0.01, function(stringArray){
                if(stringArray != undefined)
                    allHeadlines.push(stringArray);

                if(i == amount - 1){
                    let sortedHeadlines = [];

                    for(let a = 0; a < allHeadlines.length; a++)
                    {
                        let foundone = false;
                        for(let b = 0; b < allHeadlines.length; b++)
                        {
                            for(let c in allHeadlines[b])
                                if(allHeadlines[a].indexOf(allHeadlines[b][c]) != -1 && ((allHeadlines[b].length > allHeadlines[a].length) || (allHeadlines[b].length == allHeadlines[a].length && b > a)))
                                {
                                    foundone = true;
                                    break;
                                }
                        }

                        if(foundone == false)
                            sortedHeadlines.push(allHeadlines[a]);
                    }

                    console.log(sortedHeadlines);
                }
            });
        }
    });

    function getToday(){
        return Math.floor(Date.now() / 1000 / 60 / 60 / 24);
    }

});