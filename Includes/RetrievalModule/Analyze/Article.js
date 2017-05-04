let cheerio = require('cheerio');
const stemmer = require('porter-stemmer').stemmer

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
        if(typeof title != 'undefined' && title != null && title != "")
            return title;

        title = $("h1").text();
        if(typeof title != 'undefined' && title != null && title != "")
            return title;

        return undefined;
    }

    extractDescription($){
        let description = $("meta[property='og:description']").attr("content");

        return description;
    }

    extractImage($){
        /*$("article img").each(function( index ) {
            return $(this).attr('src');
        });*/
        
        return $("meta[property='og:image']").attr("content");
    }

    extractContent($){
        let content = "";

        $("article p, article span, article blockquote").each(function( index ) {
            let text = $( this ).text().replace("\r", " ").replace("\n", " ").replace("\n\r", " ").replace("\t", " ");

            let charCount = 0;
            for(let c in text){
                if(/[A-Za-z]/.test(text[c]))
                    charCount++;
            }

            if(charCount >= 70)
                content += text + "."; //Indicating its a sentence brake
        });

        return content.replace("  ", " ");
    }

    getShort(){
        return {title:this.title, image:this.image, description:this.description, date:this.date, source:this.source, url:this.url, content:this.content.length, raw:this.raw.length};
    }

    getAll(){
        return {title:this.title, image:this.image, description:this.description, date:this.date, source:this.source, url:this.url, content:this.content, raw:this.raw};
    }

    getProcessedContent(){
        let allowedChar = /[a-zA-Z0-9]/;
        let endOfSentenceChar = /[\.\?\!\"”“]/;
        
        let sentenceSeperator = ".";

        let output = "";
        let lastAddedChar = " ";
        for(let c in this.content){
            let char = this.content[c];//.toLowerCase();
            if(allowedChar.test(char)){
                if(lastAddedChar == sentenceSeperator)
                    output += " ";

                output += char;
            }
            else if(endOfSentenceChar.test(char) && lastAddedChar != sentenceSeperator && output[output.length - 2] != sentenceSeperator){
                if(lastAddedChar != " ")
                    output += " ";

                output += sentenceSeperator;
            }
            else if(lastAddedChar != " ")
                output += " ";
            
            lastAddedChar = output[output.length - 1];
        }

        //stemmer

        return output;
    }
}