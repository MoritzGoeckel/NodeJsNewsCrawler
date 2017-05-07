const elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

client.indices.putMapping({
  body: 
  {
    "Q":{
      "properties":{
        "claims": {
            "enabled": false,
            "type" : "object"
        }
      }
    }
  },
  type: "Q",
  index: "wikidata"
},function (err, resp) {
  if(err != null && err != undefined)
    console.log(err);

  console.log(resp);
});

client.indices.putMapping({
  body: 
  {
    "P":{
      "properties":{
        "claims": {
            "enabled": false,
            "type" : "object"
        }
      }
    }
  },
  type: "P",
  index: "wikidata"
},function (err, resp) {
  if(err != null && err != undefined)
    console.log(err);

  console.log(resp);
});