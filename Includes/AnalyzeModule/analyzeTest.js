const nlp = require('compromise');
const Wikidata = require("../WikidataModule/Search/Search.js");

wikidata = new Wikidata();
let testStrings = [
    "Jack founded Alibaba in Hangzhou with investments from SoftBank and Goldman .", 
    "Youtube video plattform owned by Google", 
    "Github is a plattform for open-source collaboration", 
    "The hochschule bfi is a university in Vienna, Austria",
    "The rare visit by the Russian Foreign Minister was impossible to separate from the political drama over the firing of the FBI director. Sergei Lavrov was grilled by journalists in a news conference after his meetings - about the impact of this latest twist in the investigation into Russia's alleged meddling in the election. He impatiently dismissed any connection and said President Trump hadn't raised the issue with him. Speaking through a translator, he also said that despite recent tensions he thought Moscow would get along better with this administration than the previous one ."
    ];

for(let s in testStrings){
    var parsed = nlp(testStrings[s]).normalize();
    let nouns = parsed.nouns().toSingular().out('array'); //json

    doRound(nouns, [], function(result){ 
        //console.log(testStrings[s]);
        //console.log(nouns); 
        //console.log(result[0].entity.id + " -> " + result[0].noun); 
        console.log(result[0].noun + "->" + result[0].entity.enlabel.value); 
    });
}

function doRound(nouns, relatedEntities, callback){
    let annotations = [];
    for(let n in nouns)
        wikidata.search(nouns[n], relatedEntities, function(res){ 

            let candidates = res;

            for(let e in candidates)
                candidates[e].myScore = getScore(candidates[e], nouns[n], candidates.length, relatedEntities);
        
            candidates = candidates.sort(function(a, b){ if(a.myScore < b.myScore) return 1; else return -1; })

            if(candidates.length != 0)
                annotations.push({"noun":nouns[n], score:candidates[0].myScore, entity:candidates[0]});
            else
                annotations.push({"noun":nouns[n], score:-1, entity:null});                

            if(annotations.length == nouns.length)
            {
                annotations = annotations.sort(function(a, b){ if(a.score < b.score) return 1; else return -1; });
                callback(annotations);
            }
        });
}

function getScore(entity, noun, numCandidates, relatedEntities){
    let attributes = Object.keys(entity.claims).length;
    let refs = entity.linkedto.length;
    let exact = (entity.isExact ? 4 : 1);

    let description = (entity.description != undefined ? 2 : 1);
    let label = (entity.enlabel != undefined ? 2 : 1);

    let labelSame = (entity.enlabel != undefined && entity.enlabel.value.toLowerCase() == noun.toLowerCase() ? 4 : 1);

    let multiwordExact = (entity.isExact && noun.split(' ').length > 1 ? noun.split(' ').length : 1);

    return refs * attributes * attributes * description * label * exact * labelSame * multiwordExact;
}