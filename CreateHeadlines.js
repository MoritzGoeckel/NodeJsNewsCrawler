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

    api.getMostPopularWordsOnDay(getToday(), 15, function(popular){
        for(let i = 0; i < popular.length && i < 50; i++)
        {
            hw.getHeadlineForWord(popular[i].word, 5, 0.01, function(headline){
                
                let strHeadline = [];
                for(let k in headline)
                    strHeadline.push(headline[k].word);

                api.getSameHeadlineCountForDayAndWord(getToday(), strHeadline, function(related){
                    
                    let b = 0;
                    while(related.length > b && related[b].score >= 0.01 && related[b].count >= 1){ //headline.length <= 3 &&
                        console.log("REl!"); //Passiert nicht
                        if(headline.indexOf(related[b].word) == -1)
                            headline.push({"word":related[b].word, "method":"rel", "score":related[b].score, "count":related[b].count});
                        b++;
                    }

                    let filtered = [];
                    for(let c in headline)
                        if(headline[c].word.length >= 2)
                            filtered.push(headline[c]);

                    let stringArray = [];
                    for(let c in filtered)
                        if(filtered.length >= 2)
                            stringArray.push(filtered[c].word);
                    
                    //Problem with sync
                    if(stringArray.length >= 2)
                        allHeadlines.push(stringArray);
                });
            });
        }
    });

    setTimeout(function(){
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
    }, 3000);

    function getToday(){
        return Math.floor(Date.now() / 1000 / 60 / 60 / 24);
    }

});