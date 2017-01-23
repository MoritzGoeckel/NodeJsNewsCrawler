process.env.UV_THREADPOOL_SIZE = 10;

let DataManager = require('./Includes/DataManager.js');
let DataAPI = require('./Includes/DataAPI.js');
let Schedule = require('node-schedule');
let config = require("./data/config.json");

let Facebook = require("./Includes/Facebook.js");

//Ende imports

let appToken = config.appId + "|" + config.appSecret; 
let trumpNewsId = "368533423539236";
let trumpNewsToken = config.trumpNewsToken;

let fb = new Facebook(config.appId, config.appSecret);
//fb.extendToken(trumpNewsToken);

let lastPosts;

let dm = new DataManager(function()
{
    let api = new DataAPI(dm.client);
    
    let updateBot = function(){
        fb.downloadPosts(trumpNewsId, function(data, prev, next){
            lastPosts = data;

            console.log(data);

            let postable = [];
            let done = 0;
            api.getLinksToWords(["trump"], function(res){ //Other words too?
                for(let r = 0; r < res.length && r < 50; r++)
                {
                    api.getLink(res[r], function(link){
                        if(link.sourceId != "dm") //Links from that site are buggy
                        {
                            let found = false;
                            for(let l in lastPosts)
                            {
                                if(lastPosts[l].message == link.title)
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
                                fb.postTo(trumpNewsId, postable[0].title, postable[0].url, trumpNewsToken);
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