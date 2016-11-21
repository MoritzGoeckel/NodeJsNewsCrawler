module.exports = class Link{
    constructor(title, date, url, source)
    {
        this.title = title;
        this.date = date;
        this.source = source;
        this.url = url;
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
}