var request = require('request');
var cheerio = require('cheerio')

var sources = require("./data/sources.json");
var articles = require("./data/articles.json");

class ArticleDownloader{

    constructor(scanner, source, url)
    {
        this.isBusy = true;
        this.scanner = scanner;
        this.source = source;
        this.url = url;

        var options = {
            url: this.url,
            headers: {
                'User-Agent': 'request'
            }
        };

        request(options, this.handleResponse.bind(this));
    }

    handleResponse (error, response, body) {
        this.isBusy = false;        
        
        if(typeof response == 'undefined')
        {
            console.log("Error downloading: " + this.url);
            return;
        }
        
        if(response.statusCode == 302){
            console.log("Moved to: " + response.headers['Location']);
        }
        
        if (!error && response.statusCode == 200) {
            this.scanner.onGotPage(body, this.source, this.url);
        }
    }
}

class Scanner{

    constructor()
    {
        this.okayRecieved = 0;
        this.recieved = 0;
    }

    onGotPage(html, source, url)
    {
        let $ = cheerio.load(html);

        //Article

        var a = new Article($("meta[property='og:title']").attr("content"),
        $("meta[property='og:description']").attr("content"),
        $("meta[property='og:image']").attr("content"),
        $("meta[property='article:published_time']").attr("content"),
        source);
        
        this.recieved++;

        if(a.isValid() == false){
            console.log("######## Error ########")
            console.log(url);
            console.log(a);
        }
        else{
            console.log("OK     " + url.substring(0, 40));
            this.okayRecieved++;
        }

        //<time itemprop="datePublished" datetime='2016-11-20T18:08:00+0000' data-timestamp="1479665280000"
        //$("time[itemprop='datePublished']")
        
        //What about crawling?

        //Todo: crawling component
    }

    printScore()
    {
        console.log("Score: " + this.okayRecieved + "/" + this.recieved + " =" + (this.okayRecieved / this.recieved));
    }
}

class Article{
    constructor(title, description, picture, date, source)
    {
        this.title = title;
        this.description = description;
        this.picture = picture;
        this.date = date;
        this.source = source;
    }

    isValid()
    {
        return !(typeof this.title == 'undefined'
         || typeof this.description == 'undefined'
         || typeof this.picture == 'undefined'
         || typeof this.source == 'undefined')
    }
}

s = new Scanner();

var stack = [];
for (i = 0; i < articles.length; i++)
{
    stack.push(new ArticleDownloader(s, "", articles[i]));
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
}, 1 * 1000);