const DownloadQueue = require("../Download/DownloadQueue.js");
const LinkCollection = require("../Analyze/LinkCollection.js");
const ElasticAPI = require("../../DatabaseModule/ElasticAPI.js");

const SentimentAnalysis = require("../../AnalyzeModule/SentimentModule/SentimentAnalysis.js");

const Sources = require("../../../data/sources.json");

let q = new DownloadQueue(3, false);

let sentiment = new SentimentAnalysis();

let elastic = new ElasticAPI();

let sum = 0;

for(let s in Sources){
    enque(Sources[s]);
}

function enque(source){
    q.enqueDownload(source.url, function(url, error, response, body){
        let c = new LinkCollection(body, source.id, url);

        if(c.links != 0){
            for(let i in c.links)
            {
                let s = sentiment.getSentimentScore(c.links[i].title.split(" "));;
                if(s != null && s != 0)
                    c.links[i].sentiment = s;
            }

            elastic.indexArticles(c.links, function(){ console.log("Inserted " + c.links.length); });  
        }
        else
            console.log("###### No data for " + url);     
    });
}