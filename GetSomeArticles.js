let sources = require("./data/sources.json");
let articles = require("./data/articles.json");

let Download =  require('./Includes/Download.js');
let ArticleScanner = require('./Includes/ArticleScanner.js');
let LinkScanner = require('./Includes/LinkScanner.js');
let Article = require('./Includes/Article.js');
let Link = require('./Includes/Link.js');
let DataManager = require('./Includes/DataManager.js');

let DataAPI = require('./Includes/DataAPI.js');

let config = require("./data/config.json");
 
let cheerio = require('cheerio');
let request = require('request');

let Express = require('express');
let ExpressRest = require('express-rest');
Vibrant = require('node-vibrant');

//End imports

//Todo: Make it reliable (Every word gets its proper article)
//(Image, description, reachable link, short title, containing the word)

//Todo: Make the page responsive (bootstrap grid)
//Todo: Generate different tiles (done:1x1 Todo:2x1 1x2 description)
//Inspiration https://www.theguardian.com/international
// https://www.washingtonpost.com/

function getToday(){
    return Math.floor(Date.now() / 1000 / 60 / 60 / 24);
}

function doLink(link, query, rank, articles){
    request({url: link.url, headers: {'User-Agent': 'request'}}, function(error, response, body) {
        console.log("Download: " + link.url);

        if(typeof response == 'undefined')
        {
            console.log("Error downloading: " + this.url);
            return;
        }
        
        if (!error && response.statusCode == 200) {
            let $ = cheerio.load(body);

            let article = {
                    rank:rank,
                    link:link,
                    query:query,
                    title:$("meta[property='og:title']").attr("content"),
                    desc:$("meta[property='og:description']").attr("content"),
                    img:$("meta[property='og:image']").attr("content")
                };
            
            if(article.link != undefined && article.query != undefined && article.title != undefined && article.desc != undefined && article.img != undefined)
            {
                console.log("OK");

                if(article.img != undefined)
                    Vibrant.from(article.img).getPalette((err, palette) => article.palette = palette);

                let found = false;
                for(let a in articles)
                {
                    if(articles[a].link.url == article.link.url){
                        found = true;
                        break;
                    }
                }

                if(found == false && article.link.title != undefined)
                    articles.push(article);
            }
        }
    });
}

let dm = new DataManager(config.redisPort, function()
{
    let api = new DataAPI(dm.client);
    
    let articles = [];

    api.getMostPopularWordsOnDay(getToday(), 15, function(popular){
       for(let i = 0; i < popular.length && i < 50; i++)
        {
            api.getSameHeadlineCountForDayAndWord(getToday(), [popular[i].word], function(related){
                let query = [popular[i].word];
                if(related[0] != undefined)
                    query.push(related[0].word);

                api.getLinksToWords(query, function(links){
                    if(links[0] != undefined)
                        api.getLink(links[0], function(link){
                            doLink(link, query, i, articles);
                        });
                });
            });
        } 
    });

    let exp = Express();
    let rest = ExpressRest(exp);

    console.log("Serving: " + __dirname + '/../NonTechnicalFrontend');
    exp.use("/", Express.static(__dirname + '/NonTechnicalFrontend'));

    rest.get('/api/somearticles/', function(req, rest) {
        articles.sort(function(a,b) {return (a.rank > b.rank) ? 1 : ((b.rank > a.rank) ? -1 : 0);});
        return rest.ok(articles);
    });

    let listener = exp.listen(1001, function(){
        console.log('Listening on port ' + listener.address().port);
    });
});