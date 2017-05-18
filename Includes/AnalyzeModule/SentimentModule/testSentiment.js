const SentimentAnalysis = require("./SentimentAnalysis.js");

let a = new SentimentAnalysis();

console.log(a.getSentimentScore(['Markets', 'fall', 'as', 'turmoil', 'Trump', 'grows']));