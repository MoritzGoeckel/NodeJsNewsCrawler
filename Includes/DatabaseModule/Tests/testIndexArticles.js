ElasticAPI = require("../ElasticAPI.js");

let elastic = new ElasticAPI();

elastic.indexArticles([{"str":"hallo"}, {"str":"welt"}], function(){ console.log("OK"); });