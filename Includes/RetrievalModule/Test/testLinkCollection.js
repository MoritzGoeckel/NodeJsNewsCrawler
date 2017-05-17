const DownloadQueue = require("../Download/DownloadQueue.js");
const LinkCollection = require("../Analyze/LinkCollection.js");

const Sources = require("../../../data/sources.json");

let q = new DownloadQueue(3, false);

let sum = 0;

for(let s in Sources){
    //console.log(Sources[s].url);
    enque(Sources[s]);
}

//enque({"url": "https://seekingalpha.com/market-news", "name": "seekingalpha", "id":"ska"});

function enque(source){
    q.enqueDownload(source.url, function(url, error, response, body){
        let c = new LinkCollection(body, source.id, url);
        sum += c.links.length;        
        console.log(source.name + ": " + c.links.length + " -> sums to " + sum);
        if(c.links.length == 0)
            console.log("###### Seems to be a problem here: " + url);
    });
}