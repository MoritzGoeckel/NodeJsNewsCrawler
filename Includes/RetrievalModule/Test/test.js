const DownloadQueue = require("../Download/DownloadQueue.js");
const Article = require("../Analyze/Article.js");

let q = new DownloadQueue(5);
q.enqueDownload("https://www.buzzfeed.com/davidmack/mnuchin-trump-taxes?utm_term=.uyopX4Z9qQ#.liz5z6mqJo", function(url, error, response, body){
    let a = new Article(body, "bzz", url);
    console.log(a.getShort());
});