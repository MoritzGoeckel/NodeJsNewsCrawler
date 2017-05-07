const elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

client.delete({
  index: 'wikidata',
  type: '',
  id: ''
}, function (err, resp) {
  if(err != null && err != undefined)
    console.log(err);

  console.log(resp);
});

/*PUT
http://localhost:9200/wikidata/_settings
{
    "index" : {
        "refresh_interval" : "-1"
    }
}*/