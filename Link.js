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

    toString(){
        return this.title;
    }
}