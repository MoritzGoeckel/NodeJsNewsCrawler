const Wikidata = require("./Search.js");

api = new Wikidata();
api.search("Elon Musk", function(res){ console.log(res); });