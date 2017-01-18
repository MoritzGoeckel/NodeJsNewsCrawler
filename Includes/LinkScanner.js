let cheerio = require('cheerio');
let Link = require('./Link.js');

module.exports = class LinkScanner{

    constructor(recievedLinks)
    {
        this.recievedLinks = recievedLinks;
    }
    
    onGotPage(html, sourceId, url)
    {
        let links = [];
        
        let $ = cheerio.load(html);
        
        let time = Math.floor(Date.now() / 1000);

        //$(".headline a").css('background-color', 'red');
        //$("h1 a").css('background-color', 'red');
        //Todo: crawling component

        let foundLinks = 0;

        let theBase = this;

        $("a").each(function( index ) {
            if($( this ).text().length > 20 && ($(this).text().match(/([\S]( |-)[\S])/g)||[]).length > 2)
            {
                let fullUrl = $(this).attr("href");
                let r = new RegExp('^(?:[a-z]+:)?//', 'i');
                if(r.test(fullUrl) == false)
                    fullUrl = url + fullUrl;
                
                let link = new Link(theBase.processTitle($(this).text()), time, fullUrl, sourceId);
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
        let p = "";
        let prohibitedChars = ["\n", "\r\n", "\r", "\t", "‘", "’"];
        
        let lastChar = " ";
        for(let i = 0; i < title.length; i++)
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