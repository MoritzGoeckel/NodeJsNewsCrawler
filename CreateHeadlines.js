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

let config = require("./data/config.json");
 
//End imports

let dm = new DataManager(config.redisPort, function()
{
    let api = new DataAPI(dm.client);
    let hw = new HeadlineWriter(api);

    hw.getClusteredWords(30, 1.1, 15, function(result)
    {
        let hls = [];
        for(let i in result)
        {
            let hl = [];
            for(let r = 0; r < result[i].relations.length; r++)
            {
                hl.push(result[i].relations[r].word);
            }

            hl.unshift(result[i].word);

            let found = false;
            for(let a in hls)
            {
                if(hw.getDistance(hls[a], hl) <= 2)
                {
                    console.log("Same:");
                    console.log(hls[a]);
                    console.log(hl);
                    found = true;
                    break;
                }
            }

            if(found == false)
                hls.push(hl);
        }

        console.log(hls);
    });
});