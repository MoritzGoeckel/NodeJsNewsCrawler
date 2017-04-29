const DownloadQueue = require("../Download/DownloadQueue.js");
const Article = require("../Analyze/Article.js");

let q = new DownloadQueue(5);
q.enqueDownload("https://www.theguardian.com/world/2017/apr/27/we-are-a-target-south-korean-village-frontline-with-north-us-thaad-defence-system-in-seongju", function(url, error, response, body){
    let a = new Article(body, "bzz", url);
    
    console.log(a.getShort());
    console.log(a.getProcessedContent());
});