const nlp = require('compromise');
const Wikidata = require("../WikidataModule/Search/Search.js");

wikidata = new Wikidata();
let testStrings = [
    //"Jack founded Alibaba in Hangzhou with investments from SoftBank and Goldman .", 
    //"Youtube video is a plattform owned by Google", 
    //"Github is a plattform for open-source collaboration", 
    //"The hochschule bfi is a university in Vienna, Austria",
    //"The rare visit by the Russian Foreign Minister was impossible to separate from the political drama over the firing of the FBI director. Sergei Lavrov was grilled by journalists in a news conference after his meetings - about the impact of this latest twist in the investigation into Russia's alleged meddling in the election. He impatiently dismissed any connection and said President Trump hadn't raised the issue with him. Speaking through a translator, he also said that despite recent tensions he thought Moscow would get along better with this administration than the previous one ."
    "Tinder has filed a legal objection to a dating platform created by a British man on which he is the only male date. Shed Simove called the app Shinder and said he built it to find himself a partner. However, when he tried to trademark it, a Notice of Threatened Opposition was filed to the Intellectual Property Office by dating giant Tinder. He also received a letter from lawyers representing the elevator firm Schindler. Schindler asked him to commit to refraining from entering the elevator or escalator market. Both firms were contacted by the BBC for comment. Tinder said it was aware of the situation. Its filing means that it could formally oppose the trademark at a later date. Mr Simove said that while he had no interest in the elevator industry he didn't believe he was a threat to Tinder either."
    ];

for(let s in testStrings){
    var parsed = nlp(testStrings[s]).normalize();
    let nouns = parsed.nouns().toSingular().out('array'); //json
    let context = [];

    console.log(nouns);

    let doneWords = {};
    let foundEntities = [];

    for(let i = 0; i < 5; i++)
        doRound(nouns, context, foundEntities, function(result){ 
            //console.log(testStrings[s]);
            //console.log(nouns); 
            //console.log(result[0].entity.id + " -> " + result[0].noun); 

            /*if(i == 5)
                delete doneWords["jack"];*/

            context = addPercentToContext(30 * i, result, context, foundEntities, nouns, doneWords);
            console.log("Context: " + context.length);
            console.log(doneWords);
            //console.log(foundEntities);
            console.log("########");
        });
}

function addPercentToContext(percent, result, context, foundEntities, nouns, doneWords){
    let tenPercent = Math.floor(((nouns.length / 100.0) * percent));
    let addedWords = 0;
    for(let i = 0; i == 0 || (addedWords < tenPercent && i < result.length); i++){
        if(doneWords[result[i].noun] == undefined){
            doneWords[result[i].noun] = result[i].entity.enlabel.value + " -> " + result[i].entity.description;
            foundEntities.push(result[i].entity.id);

            for(let e in result[i].entity.linkedto)
                context.push(result[i].entity.linkedto[e]);

            addedWords++;
        }
        //console.log(result[i].noun + "->" + result[i].entity.enlabel.value);
    }

    return context;
}

function doRound(nouns, relatedEntities, foundEntities, callback){
    let annotations = [];
    for(let n in nouns)
        wikidata.search(nouns[n], relatedEntities, foundEntities, function(res){ 

            let candidates = res;

            for(let e in candidates)
                candidates[e].myScore = getScore(candidates[e], nouns[n], candidates.length, relatedEntities, foundEntities);
        
            candidates = candidates.sort(function(a, b){ if(a.myScore < b.myScore) return 1; else return -1; })

            if(candidates.length != 0 && candidates[0].myScore > 0)
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

function getScore(entity, noun, numCandidates, relatedEntities, foundEntities){
    //let refs = entity.linkedto.length;
    let attributes = Object.keys(entity.claims).length;
    
    let exact = (entity.isExactLabel ? 1 : 0);

    let labelCount = entity.labels.length + entity.aliases.length;

    let description = (entity.description != undefined ? 1 : 0);
    let label = (entity.enlabel != undefined ? 1 : 0);

    let labelSame = (entity.enlabel != undefined && entity.enlabel.value.toLowerCase() == noun.toLowerCase() ? 5 : 1);

    let multiwordExact = (entity.isExact && noun.split(' ').length > 1 ? Math.pow(noun.split(' ').length, 6) : 1);

    //let esScore = entity.esScore;

    return labelCount * attributes * description * label * exact * labelSame * multiwordExact;
}