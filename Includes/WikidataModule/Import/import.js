const elasticsearch = require('elasticsearch');

var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream("D:/#DATA/wikidata-latest-all.json")
});

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'error'
});

setInterval(function(){
  console.log("Doing: " + outgoingQueue.length + " items");

  let toImportInDatabase = outgoingQueue;
  outgoingQueue = [];

  let body = [];

  for(let i = 0; i < toImportInDatabase.length; i++)
  {
    let type = toImportInDatabase[i].id.substring(0, 1);
    body.push({ index:  { _index: 'wikidata', _type: type } });
    body.push( toImportInDatabase[i] );
  }

  client.bulk({ body: body }, function (err, resp) {
    if(err != null && err != undefined){
      console.log(err);

      //Re add when error
      for(let i = 0; i < toImportInDatabase.length; i++)
        outgoingQueue.push(toImportInDatabase[i]);
    }
  });
}, 500);

function objectToArray(obj){
  let dict = {};
  for(let k in obj){
    if(obj[k].value != undefined) //Only one value
    {
        dict[obj[k].value] = 1;
    }
    else if(obj[k].length != undefined) //Array
      for(let i = 0; i < obj[k].length; i++)
      {
        dict[obj[k][i].value] = 1;
      }
  }

  let array = [];
  for(let el in dict)
    array.push(el);

  return array;
}

function parseLine(line){
    let obj = JSON.parse(line);

    delete obj.modified;
    delete obj.lastrevid;
    delete obj.title;
    delete obj.pageid;
    delete obj.ns;

    if(obj.labels.en != undefined)
      obj.enlabel = obj.labels.en;
    
    obj.labels = objectToArray(obj.labels);
    obj.aliases = objectToArray(obj.aliases);

    if(obj.sitelinks != undefined && obj.sitelinks.enwiki != undefined)
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
        let obj = parseLine(line);
        outgoingQueue.push(obj);
    }
});