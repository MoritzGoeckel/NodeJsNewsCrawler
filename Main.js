var sources = require("./data/sources.json");
var articles = require("./data/articles.json");

var Downloader =  require('./Downloader.js');
var ArticleScanner = require('./ArticleScanner.js');
var LinkScanner = require('./LinkScanner.js');
var Article = require('./Article.js');
var Link = require('./Link.js');
var DataManager = require('./DataManager.js');

var dm = new DataManager();
//dm.disconnect();

/*s = new LinkScanner();

var stack = [];
for (i = 0; i < sources.length; i++)
{
    if(i == 3)
    {
        console.log("Download: " + sources[i].url);
        stack.push(new Downloader(s, "", sources[i].url));
    }
}

intervalId = setInterval(function(){
    if(stack.length > 0)
    {
        while(stack.length > 0 && stack[stack.length - 1].isBusy == false)
            stack.pop();
    }
    else
    {
        console.log("#############");
        var links = s.getLinks();
        for (i = 0; i < links.length; i++)
        {
            console.log(links[i].toString());
        }
        s.printScore();
        console.log("#############");
        
        clearInterval(intervalId);
    }
}, 1 * 1000);*/