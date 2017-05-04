const DownloadQueue = require("../Download/DownloadQueue.js");
const LinkCollection = require("../Analyze/LinkCollection.js");

const Sources = require("../../../data/sources.json");

let q = new DownloadQueue(3);

let sum = 0;

for(let s in Sources){
    //console.log(Sources[s].url);
    
    q.enqueDownload(Sources[s].url, function(url, error, response, body){
        let c = new LinkCollection(body, Sources[s].id, url);
        sum += c.links.length;        
        console.log(Sources[s].name + ": " + c.links.length + " -> sums to " + sum);
    });
}