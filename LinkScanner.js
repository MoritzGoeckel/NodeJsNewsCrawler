var cheerio = require('cheerio');
var Link = require('./Link.js');

module.exports = class LinkScanner{

    constructor()
    {
        this.okayRecieved = 0;
        this.recieved = 0;
    }
    
    onGotPage(html, source, url)
    {
        let $ = cheerio.load(html);
        
        //$(".headline a").css('background-color', 'red');
        //$("h1 a").css('background-color', 'red');
        //Todo: crawling component

        var result = [];

        $("a").each(function( index ) {
            if($( this ).text().length > 20 && ($(this).text().match(/([\S]( |-)[\S])/g)||[]).length > 2)
            {
                var fullUrl = $(this).attr("href");
                var r = new RegExp('^(?:[a-z]+:)?//', 'i');
                if(r.test(fullUrl) == false)
                    fullUrl = url + fullUrl;
                
                //console.log(fullUrl);

                result.push(new Link($(this).text(), undefined, fullUrl, source));
            }
        });
        
        //console.log(result);

        this.recieved++;
        this.okayRecieved++;
    }

    printScore()
    {
        console.log("Score: " + this.okayRecieved + "/" + this.recieved + " =" + (this.okayRecieved / this.recieved));
    }
}