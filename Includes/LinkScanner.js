var cheerio = require('cheerio');
var Link = require('./Link.js');

module.exports = class LinkScanner{

    constructor(recievedLinks)
    {
        this.recievedLinks = recievedLinks;
    }
    
    onGotPage(html, sourceId, url)
    {
        var links = [];
        
        let $ = cheerio.load(html);
        
        var time = Math.floor(Date.now() / 1000);

        //$(".headline a").css('background-color', 'red');
        //$("h1 a").css('background-color', 'red');
        //Todo: crawling component

        var foundLinks = 0;

        var theBase = this;

        $("a").each(function( index ) {
            if($( this ).text().length > 20 && ($(this).text().match(/([\S]( |-)[\S])/g)||[]).length > 2)
            {
                var fullUrl = $(this).attr("href");
                var r = new RegExp('^(?:[a-z]+:)?//', 'i');
                if(r.test(fullUrl) == false)
                    fullUrl = url + fullUrl;
                
                var link = new Link(theBase.processTitle($(this).text()), time, fullUrl, sourceId);
                if(link.isValid())
                {
                    links.push(link);
                    foundLinks++;
                }
            }
        });

        this.recievedLinks(sourceId, links);
    }

    processTitle(title)
    {
        var p = "";
        var prohibitedChars = ["\n", "\r\n", "\r", "\t", "‘", "’"];
        
        var lastChar = " ";
        for(var i = 0; i < title.length; i++)
        {
            if(prohibitedChars.indexOf(title[i]) == -1 && (lastChar != " " || title[i] != " "))
            {
                lastChar = title[i];
                p += title[i];
            }
        }

        return p;
    }
}