const elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

client.index({
  index: 'wikidata',
  type: 'Q',
  id: '',
  body: {  }
}, function (err, resp) {
  if(err != null && err != undefined)
    console.log(err);

  console.log(resp);
});