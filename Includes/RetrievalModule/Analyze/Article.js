let cheerio = require('cheerio');

module.exports = class Article{

    constructor(html, source, url)
    {
        this.raw = html;
        this.source = source;
        this.url = url;

        let $ = cheerio.load(html);

        this.date = this.extractDate($);
        this.title = this.extractTitle($);
        this.description = this.extractDescription($);
        this.image = this.extractImage($);
        this.content = this.extractContent($);
    }

    extractDate($)
    {
        let date = $("meta[property='article:published_time']").attr("content");
        if(typeof date != 'undefined' && date != null && date != "")
            return date;

        date = $("time[itemprop='datePublished']").attr("datetime");
        if(typeof date != 'undefined' && date != null && date != "")
            return date;

        date = $("time").text();
        if(typeof date != 'undefined' && date != null && date != "")
            return date;

        return undefined;
    }

    extractTitle($){
        let title = $("meta[property='og:title']").attr("content");

        return title;
    }

    extractDescription($){
        let description = $("meta[property='og:description']").attr("content");

        return description;
    }

    extractImage($){
        let image = $("meta[property='og:image']").attr("content");

        return image;
    }

    extractContent($){
        let content = "";

        $("article p, article span").each(function( index ) {
            let text = $( this ).text().replace(" ", "").replace("\r", "").replace("\n", "").replace("\n\r", "").replace("\t", "");

            let charCount = 0;
            for(let c in text){
                if(/[A-Za-z]/.test(text[c]))
                    charCount++;
            }

            if(charCount >= 70)
                content += text + " ";
        });

        return content;
    }

    getShort(){
        return {title:this.title, description:this.description, date:this.date, source:this.source, url:this.url, content:this.content.length, raw:this.raw.length};
    }
}