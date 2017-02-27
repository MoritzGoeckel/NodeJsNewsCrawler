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

//End imports

function getToday(){
    return Math.floor(Date.now() / 1000 / 60 / 60 / 24);
}

let dm = new DataManager(config.redisPort, function()
{
    let api = new DataAPI(dm.client);
    
    let articles = [];

    api.getMostPopularWordsOnDay(getToday(), 15, function(popular){
       for(let i = 0; i < popular.length && i < 30; i++)
        {
            api.getSameHeadlineCountForDayAndWord(getToday(), [popular[i].word], function(related){
                let query = [popular[i].word];
                if(related[0] != undefined)
                    query.push(related[0].word);

                api.getLinksToWords(query, function(links){
                    if(links[0] != undefined)
                        api.getLink(links[0], function(link){
                            request({url: link.url, headers: {'User-Agent': 'request'}}, function(error, response, body) {
                                if(typeof response == 'undefined')
                                {
                                    console.log("Error downloading: " + this.url);
                                    return;
                                }
                                
                                if(response.statusCode == 302){
                                    console.log("Moved to: " + response.headers['Location']);
                                }
                                
                                if (!error && response.statusCode == 200) {
                                    let $ = cheerio.load(body);

                                    let article = {
                                            link:link,
                                            query:query,
                                            title:$("meta[property='og:title']").attr("content"),
                                            desc:$("meta[property='og:description']").attr("content"),
                                            img:$("meta[property='og:image']").attr("content")
                                        };
                                    
                                    let found = false;
                                    for(let a in articles)
                                    {
                                        if(articles[a].link.url == article.link.url){
                                            found = true;
                                            break;
                                        }
                                    }

                                    if(found == false)
                                        articles.push(article);
                                }
                            });
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
        return rest.ok(articles);
    });

    let listener = exp.listen(1001, function(){
        console.log('Listening on port ' + listener.address().port);
    });
});