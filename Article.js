module.exports = class Article{
    constructor(title, description, picture, date, source)
    {
        this.title = title;
        this.description = description;
        this.picture = picture;
        this.date = date;
        this.source = source;
    }

    isValid()
    {
        return !(typeof this.title == 'undefined'
         || typeof this.description == 'undefined'
         || typeof this.picture == 'undefined'
         || typeof this.source == 'undefined') //|| typeof this.date == 'undefined'
    }

    getValidityTable()
    {
        return {"title" : (typeof this.title == 'undefined' ? "F":"T"), 
                "description": (typeof this.description == 'undefined' ? "F":"T"),
                "picture": (typeof this.picture == 'undefined' ? "F":"T"),
                "source": (typeof this.source == 'undefined' ? "F":"T"),
                "date": (typeof this.date == 'undefined' ? "F":"T")};
    }
}