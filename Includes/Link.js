module.exports = class Link{
    constructor(title, date, url, sourceId)
    {
        this.title = title;
        this.date = date;
        this.sourceId = sourceId;
        this.url = url;
    }

    getDataArray()
    {
        return [
            "title", this.title, 
            "date", this.date, 
            "sourceId", this.sourceId, 
            "url", this.url
        ];
    }

    isValid()
    {
        return !(typeof this.title == 'undefined'
         || typeof this.url == 'undefined'
         || typeof this.sourceId == 'undefined') //|| typeof this.date == 'undefined'
    }

    getValidityTable()
    {
        return {"title" : (typeof this.title == 'undefined' ? "F":"T"), 
                "picture": (typeof this.url == 'undefined' ? "F":"T"),
                "source": (typeof this.sourceId == 'undefined' ? "F":"T"),
                "date": (typeof this.date == 'undefined' ? "F":"T")};
    }

    getWords()
    {
        var words = this.title.split(/[,\.\-#+^<´>|;:_'*~?=\")(/&%$§!) ]+/);
        
        for(var i = 0; i < words.length; i++)
        {
            if(words[i] == false || words[i] == null || words[i] == '' || words[i] == ' ' || typeof words[i] === 'undefined' || words[i] == " ")
            {
                words.splice(i, 1);
                i--;
            }
            else
                words[i] = words[i].toLowerCase();
        }
        
        function removeDoubleElements(a) {
            var seen = {};
            return a.filter(function(item) {
                return seen.hasOwnProperty(item) ? false : (seen[item] = true);
            });
        }
    
        words = removeDoubleElements(words);

        while(words[words.length - 1] == " ")
            words.splice(words.length - 1);

        return words;
    }

    toString(){
        return this.title;
    }
}