var request = require('request');
var queue = Symbol();
var interval = Symbol();
var openConnections = Symbol();

module.exports = class DownloadQueue{
    constructor(openConnectionLimit, reenque)
    {
        var base = this;

        if(reenque == undefined)
            this.reenque = true;
        else
            this.reenque = reenque;

        //Private
        this[openConnections] = 0;
        this[queue] = [];
        this[interval] = setInterval(checkDownloadQueue, 1);

        //Public
        this.openConnectionLimit = openConnectionLimit;

        function checkDownloadQueue()
        {
            if(base[queue].length != 0 && base[openConnections] <= base.openConnectionLimit)
            {
                var queEntry = base[queue].shift();               
                base[openConnections]++;

                var options = {
                    url: queEntry.url,
                    headers: {
                        'USER-AGENT': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
                        'ACCEPT_ENCODING': 'gzip, deflate, sdch, br',
                        'ACCEPT': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'CONNECTION': 'keep-alive',
                        'UPGRADE_INSECURE_REQUESTS': 1
                    },
                    jar: true
                };

                request(options, function(error, response, body){
                    if (!error && response.statusCode == 200) 
                    {
                        base[openConnections]--; 
                        queEntry.callback(queEntry.url, error, response, body);
                    }
                    else
                    {
                        base[openConnections]--;

                        console.log("Download failed: " + JSON.stringify(queEntry.url));

                        if(response != undefined)
                            console.log("Code: " + response.statusCode);
                        
                        //console.log(response);

                        if(error != null)
                            console.log("Error: " + error);

                        if(base.reenque){
                            console.log("reenqueing: " + JSON.stringify(queEntry.url));
                            base.enqueDownload(queEntry.url);
                        }
                    }
                });
            }
        }
    }

    enqueDownload(url, callback)
    {
        this[queue].push({url:url, callback:callback});
    }

    destroy()
    {
        clearInterval(this[interval]);
    }

    getQueueLength()
    {
        return this[queue].length;
    }

    getOpenConnections()
    {
        return this[openConnections];
    }
}