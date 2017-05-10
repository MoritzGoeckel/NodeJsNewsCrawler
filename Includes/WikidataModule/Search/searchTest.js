const Wikidata = require("./Search.js");

api = new Wikidata();
api.search("jack", ["Q1359568"], function(res){ 
    for(let i = 0; i < res.length && i < 10; i++)
    console.log(res[i].enlabel.value + " " + res[i].esScore); 
});