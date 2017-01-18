let sources = require("./data/sources.json");
let articles = require("./data/articles.json");

let Download =  require('./Includes/Download.js');
let ArticleScanner = require('./Includes/ArticleScanner.js');
let LinkScanner = require('./Includes/LinkScanner.js');
let Article = require('./Includes/Article.js');
let Link = require('./Includes/Link.js');
let DataManager = require('./Includes/DataManager.js');

let DataAPI = require('./Includes/DataAPI.js');
 
//End imports

function addWordRight(array, api, threshold, candidates, callbackSuccess, callbackFailed)
{
    if(array[array.length - 1] == "#end#")
        callbackFailed(array);
    else
    {
        api.getRightNeighbourForWordOnDay(array[array.length - 1], getToday(), function(rn){                
            let choosenRight;
            for(let i in rn)
            {
                if(rn[i].score != Infinity && rn[i].score >= threshold && candidates.indexOf(rn[i].word) > -1){
                    choosenRight = rn[i].word;
                    break;
                }
            }

            if(choosenRight != undefined){
                array.push(choosenRight);
                callbackSuccess(array);
            }
            else
                callbackFailed(array);
        });
    }
}

function addWordLeft(array, api, threshold, candidates, callbackSuccess, callbackFailed)
{
    if(array[0] == "#beginning#")
        callbackFailed(array);
    else
    {
        api.getLeftNeighbourForWordOnDay(array[0], getToday(), function(ln){                
            let choosenLeft;
            for(let i in ln)
            {
                if(ln[i].score != Infinity && ln[i].score >= threshold && candidates.indexOf(ln[i].word) > -1){
                    choosenLeft = ln[i].word;
                    break;
                }
            }

            if(choosenLeft != undefined){
                array.unshift(choosenLeft);
                callbackSuccess(array);
            }
            else
                callbackFailed(array);
        });
    }
}

function getToday(){
    return Math.floor(Date.now() / 1000 / 60 / 60 / 24);
}

function addManyLeft(headline, api, threshold, candidates, callback)
{
    addWordLeft(headline, api, threshold, candidates,
        function(newHeadline){
            //Success try again
            addManyLeft(newHeadline, api, threshold, candidates, callback);
        }, callback);
}

function addManyRight(headline, api, threshold, candidates, callback)
{
    addWordRight(headline, api, threshold, candidates,
        function(newHeadline){
            //Success try again
            addManyRight(newHeadline, api, threshold, candidates, callback);
        }, callback);
}

let dm = new DataManager(function()
{
    let api = new DataAPI(dm.client);

    api.getMostPopularWordsOnDay(getToday(), 15, function(popular){
        for(let i = 0; i < popular.length && i < 2; i++)
        {
            let headline = [];            
            headline.push(popular[i].word);

            api.getSameHeadlineCountForDayAndWord(getToday(), [popular[i].word], function(candidatesResult){
                let candidates = [];
                for(let a in candidatesResult)
                    candidates.push(candidatesResult[a].word);
                
                addManyLeft(headline, api, 0.1, candidates, function(leftCompleteHeadline){
                    addManyRight(leftCompleteHeadline, api, 0.01, candidates, function(completeHeadline){
                        console.log(completeHeadline.join(" "));
                    });
                });
            }); 
        }
    });

    //GetLinks
    /*dm.getLinks(function(link){
        console.log(link);
    });*/
});