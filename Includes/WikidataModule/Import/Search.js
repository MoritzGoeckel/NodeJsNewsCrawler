const elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'error'
});

function processSearchResult(term, result){
  let exactHits = [];
  let notExactHits = [];

  //console.log("Num Hits: " + result.hits.hits.length);

  for(let h in result.hits.hits){
    let hit = result.hits.hits[h]._source; 
    let isExact = false;

    for(let l in hit.labels){
      if(hit.labels[l] == term)
      {
        isExact = true;
        break;
      }
    }
    
    if(isExact == false)
      for(let a in hit.aliases){
        if(hit.aliases[a] == term)
        {
          isExact = true;
          break;
        }
      }
    
    if(isExact)
      exactHits.push(hit);
    else
      notExactHits.push(hit);
  }

  return {exact:exactHits, notexact:notExactHits};
}

function getLinkedEntities(entity){

  let propertyBlacklist = {"P1889":"Different from", "P31":"Instance of"};

  let entities = [];
  for(let c in entity.claims)
  {
    if(entity.claims[c] != undefined)
      for(let snak in entity.claims[c])
      {
        let mainsnak = entity.claims[c][snak].mainsnak;
        if(mainsnak.datatype == "wikibase-item" && mainsnak.datavalue.type == "wikibase-entityid"){

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

function search(term){
  client.search({index:"wikidata", type:"Q", body:{
    size: 50,
    from: 0,
    query: {
      query_string: {
        query: '(aliases:"'+term+'" OR labels:"'+term+'")',
        "use_dis_max" : true
      }
    }
  }}).then(result => {
    let processed = processSearchResult(term, result);
    console.log(getLinkedEntities(processed.exact[0]));
  });
}

search("Le Pen");