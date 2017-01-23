process.env.UV_THREADPOOL_SIZE = 10;

let DataManager = require('./Includes/DataManager.js');
let DataAPI = require('./Includes/DataAPI.js');
let Schedule = require('node-schedule');
let config = require("./data/config.json");

let Facebook = require("./Includes/Facebook.js");

let nlp = require('nlp_compromise');
//nlp.plugin(require('nlp-links'));

//Ende imports

let appToken = config.appId + "|" + config.appSecret; 
let whoGotKilledId = "429425094115248";
let whoGotKilledToken = config.whoGotKilledToken;

let fb = new Facebook(config.appId, config.appSecret);
//fb.extendToken(whoGotKilledToken);

let lastPosts;

let dm = new DataManager(function()
{
    let api = new DataAPI(dm.client);
    
    let updateBot = function(){
        fb.downloadPosts(whoGotKilledId, function(data, prev, next){
            lastPosts = data;

            console.log(data);

            let postable = [];
            let done = 0;
            api.getLinksToWords(["killed"], function(res){
                for(let r = 0; r < res.length && r < 50; r++)
                {
                    api.getLink(res[r], function(link){
                        if(link.sourceId != "dm") //Links from that site are buggy
                        {
                            link.postTitle = whoGotKilledFromTitle(link.title);
                            let found = false;
                            for(let l in lastPosts)
                            {
                                if(lastPosts[l].message == link.postTitle)
                                {
                                    found = true;
                                    break;
                                }
                            }

                            if(found == false)
                                postable.push(link); //Postable
                        }

                        done++;
                        if(done == 20)
                        {
                            postable = postable.sort(function(a, b){return parseInt(b.date) - parseInt(a.date)});
                        
                            /*console.log("Postable: ");
                            for(let p in postable){
                                console.log(postable[p]); //All done
                                console.log("");                            
                            }*/

                            if(postable.length >= 1)
                            {
                                console.log("Posting: ");
                                console.log(postable[0]);
                                fb.postTo(whoGotKilledId, postable[0].postTitle, postable[0].url, whoGotKilledToken);
                            }
                            else
                            {
                                console.log("Nothing to post anymore :(");
                            }
                        }
                    });
                }
            });
        });
    }

    updateBot();

    //Every 10 minutes
    Schedule.scheduleJob('10 * * * *', updateBot);
    Schedule.scheduleJob('20 * * * *', updateBot);
    Schedule.scheduleJob('30 * * * *', updateBot);
    Schedule.scheduleJob('40 * * * *', updateBot);
    Schedule.scheduleJob('50 * * * *', updateBot);
    Schedule.scheduleJob('0 * * * *', updateBot);
});

//console.log(whoGotKilledFromTitle("At Least 14 Killed in Georgia Storms"));

function whoGotKilledFromTitle(title){
    let sentence = nlp.sentence(title); //withLinks();
    function isNumber(obj) { return !isNaN(parseFloat(obj)) }
    function validVictim(term)
    {
        return term != undefined && (term.tag == "Noun" || term.tag == "Possessive" ||  term.tag == "Value" || term.tag == "Actor" || term.tag == "Plural" || isNumber(term.normal) );
    }

    for(let t = 0; t < sentence.terms.length; t++)
    {
        if(sentence.terms[t].normal == "killed")
        {
            var output = "";
            if(t > 0 && validVictim(sentence.terms[t - 1]) && (t + 1 < sentence.terms.length && isNumber(sentence.terms[t + 1].normal)) == false){ //Found left
                output = sentence.terms[t - 1].text;
                if(t - 2 >= 0 && isNumber(sentence.terms[t - 2].normal))
                    output = sentence.terms[t - 2].text + " " + output;
            }
            else if(validVictim(sentence.terms[t + 1])) //Found right
            {
                output = sentence.terms[t + 1].text;
                if(t + 2 < sentence.terms.length && isNumber(sentence.terms[t + 1].normal) && validVictim(sentence.terms[t + 2]))
                    output = output + " " + sentence.terms[t + 2].text;                                   
            }
            else
            {
                output = "Someone"
                console.log("Nothing found!");
                console.log(sentence);
            }

            let places = sentence.places();
            if(places.length != 0)
            {
                output += " in " + places[0].text;
            }
            else
            {
                var foundIn = false;
                for(let t2 = 0; t2 < sentence.terms.length; t2++)
                {
                    if(sentence.terms[t2].normal == "in")
                    {
                        foundIn = true;
                        output += " in " + sentence.terms[t2 + 1].text;
                        t2++;
                    }
                    else if(foundIn == true && sentence.terms[t2].tag == "Noun")
                    {
                        output += " " + sentence.terms[t2].text;
                    }
                }
            }

            //Capitalize
            output = output.charAt(0).toUpperCase() + output.slice(1);
                        
            if(isNumber(output) && output.split(" ").length == 1)
            {
                if(output == "1")
                    output += " person";
                else
                    output += " people";
            }

            //Only one word -> add A / An
            if(output.split(" ").length == 1)
            {
                let vocals = "AEIOUaeiou";
                if(vocals.indexOf(output.charAt(0)) == -1)
                    output = "A " + output;
                else
                    output = "An " + output;
            }

            break;
        }
    }
    
    return output;
}