const DownloadQueue = require("../Download/DownloadQueue.js");
const LinkCollection = require("../Analyze/LinkCollection.js");
const ElasticAPI = require("../../DatabaseModule/ElasticAPI.js");

const Sources = require("../../../data/sources.json");

let q = new DownloadQueue(3, false);

let elastic = new ElasticAPI();

let sum = 0;

for(let s in Sources){
    enque(Sources[s]);
}

function enque(source){
    q.enqueDownload(source.url, function(url, error, response, body){
        let c = new LinkCollection(body, source.id, url);

        if(c.links != 0)
            elastic.indexArticles(c.links, function(){ console.log("Inserted " + c.links.length); });  
        else
            console.log("###### Seems to be a problem here: " + url);     
    });
}