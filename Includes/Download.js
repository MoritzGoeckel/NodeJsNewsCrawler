var request = require('request');

module.exports = class Download{

    constructor(scanner, source, url)
    {
        this.isBusy = true;
        this.scanner = scanner;
        this.source = source;
        this.url = url;

        var options = {
            url: this.url,
            headers: {
                'User-Agent': 'request'
            }
        };

        request(options, this.handleResponse.bind(this));
    }

    handleResponse (error, response, body) {
        this.isBusy = false;        
        
        if(typeof response == 'undefined')
        {
            console.log("Error downloading: " + this.url);
            return;
        }
        
        if(response.statusCode == 302){
            console.log("Moved to: " + response.headers['Location']);
        }
        
        if (!error && response.statusCode == 200) {
            this.scanner.onGotPage(body, this.source, this.url);
        }
    }
}