var sources = require("./data/sources.json");
var articles = require("./data/articles.json");

var Downloader =  require('./Downloader.js');
var ArticleScanner = require('./ArticleScanner.js');
var LinkScanner = require('./LinkScanner.js');
var Article = require('./Article.js');

s = new LinkScanner();
new Downloader(s, "", "https://www.rt.com/");

/*s = new ArticleScanner();

var stack = [];
for (i = 0; i < articles.length; i++)
{
    stack.push(new Downloader(s, "", articles[i]));
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
        s.printScore();
        console.log("#############");
        
        clearInterval(intervalId);
    }
}, 1 * 1000);*/