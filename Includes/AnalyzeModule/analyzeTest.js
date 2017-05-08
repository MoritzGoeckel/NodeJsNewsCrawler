const nlp = require('compromise');
const Wikidata = require("../WikidataModule/Search/Search.js");

wikidata = new Wikidata();
let string = "Jack founded Alibaba in Hangzhou with investments from SoftBank and Goldman .";

var parsed = nlp(string).normalize();

let nouns = parsed.nouns().toSingular().out('array'); //json
for(let n in nouns)
    wikidata.search(nouns[n], function(res){ 
        console.log("####### " + nouns[n] + " E: " + res.exact.length + " nE: " + res.notexact.length);

        let mostRefs = {refs:-1, item:undefined};
        for(let e in res.all)
        {
            if(res.all[e].description != "Wikipedia disambiguation page" && res.all[e].description != "Wikimedia category" && res.all[e].description != undefined && res.all[e].description != "Wikipedia template page")
            {
                //description
                //Wikimedia list article
                //Wikinews article
                //Wikimedia disambiguation page
                //Wikimedia template
                //Wikimedia category
                //Wikipedia template page

                let refs = wikidata.getLinkedEntities(res.all[e]).length;
                if(mostRefs.refs < refs)
                    mostRefs = {refs:refs, item:res.all[e]};
                
                console.log(res.all[e].description);
            }
        }

        /*if(mostRefs.item != undefined)        
            console.log(mostRefs.item.description);*/    
    });
