const elasticsearch = require('elasticsearch');
const AgentKeepAlive = require('agentkeepalive');

//Instance of P31
let instanceOfBlacklist = { 
  "Q13406463":false, //Wikimedia list article
  "Q17633526":false,  //Wikinews article
  "Q4167410":false, //Wikimedia disambiguation page 
  "Q11266439":false, //Wikimedia template
  "Q4167836":false //Wikimedia category
};

let batchSize = 300;

var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream("D:/#DATA/wikidata-latest-all.json")
});

var client = new elasticsearch.Client({
  hosts: ['localhost:9200'],
  maxRetries: 10,
  keepAlive: true,
  maxSockets: 10,
  minSockets: 10,
  createNodeAgent: function (connection, config) {
    return new AgentKeepAlive(connection.makeAgentConfig(config));
  },
  log: 'error',
  requestTimeout: 20 * 1000
});

//Client.apis[config.apiVersion].ping.spec.requestTimeout = 20 * 1000;

function hasRelationTo(entity, Qlist, property){
  if(entity.claims[property] != undefined)
  {
    for(let snak in entity.claims[property])
    {
      let mainsnak = entity.claims[property][snak].mainsnak;
      if(mainsnak.datatype == "wikibase-item" && mainsnak.datavalue != undefined && mainsnak.datavalue.type == "wikibase-entityid")
      {
        let prefix;
        if(mainsnak.datavalue.value['entity-type'] == "property")
          prefix = "P";
        
        if(mainsnak.datavalue.value['entity-type'] == "item")
          prefix = "Q";
        
        if(prefix == undefined)
          throw new Error(mainsnak.datavalue.value['entity-type'] + " wierd type!");
        
        if(mainsnak.property == property && Qlist[prefix + mainsnak.datavalue.value['numeric-id']] != undefined){
          //console.log(mainsnak.property + " - " + property + " - " + prefix + mainsnak.datavalue.value['numeric-id']);
          return true;
        }
      }
    }
  }

  return false;
}

function getLinkedEntities(entity){
  let propertyBlacklist = {"P1889":"Different from"}; //Define blacklist
  let entities = [];
  for(let c in entity.claims)
  {
    if(entity.claims[c] != undefined)
      for(let snak in entity.claims[c])
      {
        let mainsnak = entity.claims[c][snak].mainsnak;
        if(mainsnak.datatype == "wikibase-item" && mainsnak.datavalue != undefined && mainsnak.datavalue.type == "wikibase-entityid")
        {
          let prefix;
          if(mainsnak.datavalue.value['entity-type'] == "property")
            prefix = "P";
          
          if(mainsnak.datavalue.value['entity-type'] == "item")
            prefix = "Q";

          if(prefix == undefined)
            throw new Error(mainsnak.datavalue.value['entity-type'] + " wierd type!");
          
          if(propertyBlacklist[mainsnak.property] == undefined)
            entities.push(prefix + mainsnak.datavalue.value['numeric-id']);
        }
      }
  }

  return entities;
}

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

    obj.linkedto = getLinkedEntities(obj);

    if(obj.sitelinks != undefined && obj.sitelinks.enwiki != undefined)
        obj.enwiki = obj.sitelinks.enwiki.title;
    delete obj.sitelinks;

    if(obj.descriptions.en != undefined)
        obj.description = obj.descriptions.en.value;
    delete obj.descriptions;

    return obj;
}

function sendToES(body){
  client.bulk({ body: body }, function (err, resp) {
    if(err != null && err != undefined){
      setTimeout(function(){sendToES(body);}, 0);         
      
      console.log("");
      console.log(err); 
      console.log("");
    }
    else{
      insertedLines += body.length / 2;
      lineReader.resume(); //Only if sucessful
    }
  });
}

let readLines = 0;
let skippedLines = 0;
let errorLines = 0;
let insertedLines = 0;

let outgoingQueue = [];
lineReader.on('line', function (line) {
    if(line != "[" && line != "]"){
        if(line.slice(-1) == ",")
          line = line.slice(0, -1); //Cut off comma

        try{
          let obj = parseLine(line);

          if(hasRelationTo(obj, instanceOfBlacklist, "P31") == false){
            outgoingQueue.push(obj);
          }
          else
            skippedLines++;
        }
        catch(err)
        { 
          console.log(err); 
          console.log(line);
          errorLines++;
        }
    }

    readLines++;
    
    if(outgoingQueue.length >= batchSize){
      lineReader.pause();

      let body = [];
      for(let i = 0; i < outgoingQueue.length; i++)
      {
        let type = outgoingQueue[i].id.substring(0, 1);
        body.push({ index:  { _index: 'wikidata', _type: type } });
        body.push( outgoingQueue[i] );
      }
      outgoingQueue = [];

      sendToES(body);
    }
});

setInterval(function(){
    if(readLines != 0){
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write("Read items: " + readLines + "/" + "26144431 (" + Math.round(readLines/26144431*100)  + "%) Errors: " + errorLines + " Skipped: " + skippedLines + " (" +  Math.round(skippedLines/readLines*100) + "%) Inserted: " + insertedLines + " ("+(readLines - skippedLines - insertedLines) + "/" + batchSize + ")");
    }
}, 1000 * 0.3);

lineReader.on('end', function(){
  let body = [];
  for(let i = 0; i < outgoingQueue.length; i++)
  {
    let type = outgoingQueue[i].id.substring(0, 1);
    body.push({ index:  { _index: 'wikidata', _type: type } });
    body.push( outgoingQueue[i] );
  }
  outgoingQueue = [];
  sendToES(body);
  
  console.log("End of file");
  console.log("End of file");
});

//node --max_old_space_size=4096