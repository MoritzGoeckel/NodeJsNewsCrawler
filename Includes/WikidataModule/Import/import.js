const elasticsearch = require('elasticsearch');

var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream("D:/#DATA/wikidata-latest-all.json")
});

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

// TODO insert
client.bulk({
  body: [
    { index:  { _index: 'myindex', _type: 'mytype' } },
    { title: 'foo' },
  ]
}, function (err, resp) {
  // ...
});

function parseLine(line){
    let obj = JSON.parse(line);

    delete obj.modified;
    delete obj.lastrevid;
    delete obj.title;
    delete obj.pageid;
    delete obj.ns;

    if(obj.sitelinks.enwiki != undefined)
        obj.enwiki = obj.sitelinks.enwiki.title;
    delete obj.sitelinks;

    if(obj.descriptions.en != undefined)
        obj.description = obj.descriptions.en.value;
    delete obj.descriptions;

    return obj;
}

let outgoingQueue = [];
lineReader.on('line', function (line) {
    if(line != "[" && line != "]"){
        line = line.slice(0, -1); //Cut off comma
        let obj = parseLine(obj);
        outgoingQueue.push(obj);
    }
});