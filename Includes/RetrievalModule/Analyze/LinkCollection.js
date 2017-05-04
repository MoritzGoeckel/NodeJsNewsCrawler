let cheerio = require('cheerio');

module.exports = class LinkCollection{

    constructor(html, sourceId, url)
    {
        this.raw = html;
        this.url = url;
        this.sourceId = sourceId;

        this.links = [];

        let $ = cheerio.load(html);
        let time = Math.floor(Date.now() / 1000);

        //$(".headline a").css('background-color', 'red');
        //$("h1 a").css('background-color', 'red');
        //Todo: crawling component

        let theBase = this;

        $("a").each(function( index ) {
            if($( this ).text().length > 20 && ($(this).text().match(/([\S]( |-)[\S])/g)||[]).length > 2)
            {
                let fullUrl = $(this).attr("href");
                let r = new RegExp('^(?:[a-z]+:)?//', 'i');
                if(r.test(fullUrl) == false)
                    fullUrl = url + fullUrl;
                
                theBase.links.push({title:theBase.processTitle($(this).text()), time:time, url:fullUrl, sourceId:sourceId});
            }
        });
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