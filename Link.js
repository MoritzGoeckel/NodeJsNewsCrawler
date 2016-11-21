module.exports = class Link{
    constructor(title, date, url, source)
    {
        this.title = title;
        this.date = date;
        this.source = source;
        this.url = url;
        this.processedTitle = undefined;
    }

    isValid()
    {
        return !(typeof this.title == 'undefined'
         || typeof this.url == 'undefined'
         || typeof this.source == 'undefined') //|| typeof this.date == 'undefined'
    }

    getValidityTable()
    {
        return {"title" : (typeof this.title == 'undefined' ? "F":"T"), 
                "picture": (typeof this.url == 'undefined' ? "F":"T"),
                "source": (typeof this.source == 'undefined' ? "F":"T"),
                "date": (typeof this.date == 'undefined' ? "F":"T")};
    }

    getProcessedTitle()
    {
        if(typeof this.processedTitle == 'undefined')
        {
            var p = "";
            var prohibitedChars = ["\n", "\r\n", "\r", "\t"];
            
            var lastChar = " ";
            for(var i = 0; i < this.title.length; i++)
            {
                if(prohibitedChars.indexOf(this.title[i]) == -1 && (lastChar != " " || this.title[i] != " "))
                {
                    lastChar = this.title[i];
                    p += this.title[i];
                }
            }

            this.processedTitle = p;
        }
        
        return this.processedTitle;
    }

    toString(){
        return this.getProcessedTitle();
    }
}