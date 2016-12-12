var cheerio = require('cheerio');
var Article = require('./Article.js');

module.exports = class ArticleScanner{

    constructor()
    {
        this.articles = [];
        this.okayRecieved = 0;
        this.recieved = 0;
    }

    getDate($)
    {
        var date = $("meta[property='article:published_time']").attr("content");
        if(typeof date != 'undefined' && date != null && date != "")
        {
            console.log("Date -> Method 1 -> " + date);
            return date;
        }

        date = $("time[itemprop='datePublished']").attr("datetime");
        if(typeof date != 'undefined' && date != null && date != "")
        {
            console.log("Date -> Method 2 -> " + date);
            return date;
        }

        date = $("time").text();
        if(typeof date != 'undefined' && date != null && date != "")
        {
            console.log("Date -> Method 3 -> " + date);
            return date;
        }

        return undefined;
    }

    onGotPage(html, source, url)
    {
        let $ = cheerio.load(html);

        //Article
        
        var a = new Article($("meta[property='og:title']").attr("content"),
        $("meta[property='og:description']").attr("content"),
        $("meta[property='og:image']").attr("content"),
        this.getDate($),
        source);
        
        this.recieved++;

        if(a.isValid() == false){
            console.log("######## Error ########")
            console.log(url);
            console.log(a.getValidityTable());
        }
        else{
            console.log("OK     " + url.substring(0, 40));
            this.articles.push(a);
            this.okayRecieved++;
        }
    }

    getArticles(){
        return this.articles;
    }

    printScore()
    {
        console.log("Score: " + this.okayRecieved + "/" + this.recieved + " =" + (this.okayRecieved / this.recieved));
    }
}