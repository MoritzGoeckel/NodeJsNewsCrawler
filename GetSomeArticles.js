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

function getLink(link, query, rank, callback){
    request({url: link.url, headers: {'User-Agent': 'request'}}, function(error, response, body) {
        if(typeof response == 'undefined')
        {
            console.log("Error downloading: " + this.url);
            callback(undefined);
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

                if(found == false && article.link.title != undefined && article.link.title.length < 200)
                {
                    articles.push(article);
                    callback(article);
                    return;
                }
                else
                {
                    callback(undefined);
                    return;
                }
            }
        }
    });
}

function getValidLink(api, links, query, rank, articles){
    api.getLink(links[0], function(link){
        getLink(link, query, rank, function(result){
            if(result != undefined)
            {
                let articleAlreadyUsed = false;
                for(let i in articles)
                    if(articles[i].link.title == result.link.title)
                    {
                        articleAlreadyUsed = true;
                        break;
                    }
                
                if(articleAlreadyUsed == false){
                    articles.push(result);
                    articles.sort(function(a,b) {return (a.rank > b.rank) ? 1 : ((b.rank > a.rank) ? -1 : 0);});
                    console.log("Found valid article: " + articles.length + " " + JSON.stringify(query));
                }
                else
                {
                    console.log("Found valid article but already in list: " + JSON.stringify(query));                    
                }
            }
            else if(links != undefined){
                console.log("Retry: " + JSON.stringify(query));
                links.shift();
                getValidLink(api, links, query, rank, articles);
            }
            else
                console.log("Giving up on" + JSON.stringify(query));
        });
    });
}

let dm = new DataManager(config.redisPort, function()
{
    let api = new DataAPI(dm.client);
    
    let articles = [];

    api.getMostPopularWordsOnDay(getToday(), 15, function(popular){
       for(let i = 0; i < popular.length && i < 30; i++)
        {
            let query = [popular[i].word];
            api.getSameHeadlineCountForDayAndWord(getToday(), query, function(related){
                if(related[0] != undefined)
                    query.push(related[0].word);

                api.getLinksToWords(query, function(links){
                    getValidLink(api, links, query, i, articles);
                });
            });
        } 
    });

    let exp = Express();
    let rest = ExpressRest(exp);

    console.log("Serving: " + __dirname + '/../NonTechnicalFrontend');
    exp.use("/", Express.static(__dirname + '/NonTechnicalFrontend'));

    rest.get('/api/somearticles/', function(req, rest) {
        return rest.ok(articles);
    });

    let listener = exp.listen(1001, function(){
        console.log('Listening on port ' + listener.address().port);
    });
});