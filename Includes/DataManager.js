let redis = require('redis');

//let Article = require('./Article.js');
let Link = require('./Link.js');

module.exports = class DataManager{
    constructor(port, finishedInit)
    {
        let theBase = this;
        this.client = redis.createClient(port);        
        this.client.on('connect', function() {
            console.log('Redis connected');

            theBase.client.get('lastLinkId', function(err, reply) {
                if(typeof reply == 'undefined' || reply == null){
                    theBase.client.set('lastLinkId', '0');
                    console.log("Link id init to: 0");
                    theBase.lastLinkId = 0;
                }
                else
                {
                    console.log("Link id: " + reply);
                    theBase.lastLinkId = parseInt(reply);
                }

                console.log("");
                finishedInit();
            });
        });        
    }

    saveCurrentScan(sourceId, links)
    {
        let linkUrls = [];
        let linksViaUrls = [];

        for(let i in links)
        {
            linkUrls.push(links[i].url);
            linksViaUrls[links[i].url] = links[i];
        }

        let theBase = this;
        let blacklistName = 'blacklist:' + sourceId;
        let oldBlacklistName = 'oldBlacklist:' + sourceId;
        let currentScanName = 'currentScan:' + sourceId;
        
        theBase.client.sadd(currentScanName, linkUrls, function(err, reply) {
            //console.log("Added to " + currentScanName + ": " + reply);
            theBase.client.sdiff(currentScanName, blacklistName, oldBlacklistName, function(err, reply) {
                
                console.log("New for " + sourceId + ": " + reply.length);

                for(let i in reply)
                {
                    let url = reply[i];
                    let link = linksViaUrls[url]
                    let id = theBase.lastLinkId++;
                    let data = link.getDataArray();
                    data.push('id', id);

                    theBase.client.hmset("link:" + id, data);
                    //console.log("Inserted " + link.getDataArray());
                    //console.log("lastLinkId is now: " + theBase.lastLinkId);
                }

                if(reply.length != 0)
                {
                    theBase.client.set('lastLinkId', theBase.lastLinkId);
                    console.log("lastLinkId is now: " + theBase.lastLinkId);

                    theBase.client.sadd(blacklistName, reply, function(err, reply) {
                            //console.log("Added to blacklist " + reply + " | " + err);
                    });
                }

                theBase.client.del(currentScanName, function(err, reply){
                    //console.log("Deleted currentScan " + reply + " | " + err);
                });
            });
        });
    }
    
    rolloverBlacklist(sourceId)
    {
        let blacklistName = 'blacklist:' + sourceId;
        let oldBlacklistName = 'oldBlacklist:' + sourceId;
        let theBase = this;

        this.client.del(oldBlacklistName, function(err, reply){
            console.log("Deleted old blacklist " + reply + " | " + err);
            theBase.client.rename(blacklistName, oldBlacklistName, function(err, reply){
                console.log("Renamed the new to the old blacklist " + reply + " | " + err);
            });
        });
    }

    getArticleToProcess(callback)
    {
        let theBase = this;
        theBase.client.get('lastProcessedLinkId', function(err, reply) {
            if(typeof reply == 'undefined' || reply == null){
                theBase.client.set('lastProcessedLinkId', '0');
                console.log("lastProcessedLinkId init to: 0");
                theBase.lastProcessedLinkId = 0;
            }
            else
            {
                theBase.lastProcessedLinkId = parseInt(reply);
            }

            let nextId = theBase.lastProcessedLinkId + 1;
            theBase.client.hgetall("link:" + nextId, function(err, reply) {
                if(reply != null){
                    callback(new Link(reply.title, reply.date, reply.url, reply.sourceId), reply.id);
                    theBase.client.incr('lastProcessedLinkId');
                }
                else
                {
                    //No more links
                }
            });
        });
    }

    /*getLinks(linkArrived)
    {
        for(let i = 0; i < this.lastLinkId; i++)
        {
            this.client.hgetall("link:"+i, function(err, reply) {
                if(reply != null)
                    linkArrived(new Link(reply.title, reply.date, reply.url, reply.sourceId), reply.id);
            });
        }        
    }*/

    /*resetProcessedDataCounter()
    {
        this.client.set('lastProcessedLinkId', '0');
    }*/

    cleanSlate()
    {
        let theBase = this;
        this.client.keys('*', function (err, keys) {
            for(let i = 0, len = keys.length; i < len; i++) {
                theBase.client.del(keys[i], function(err, reply){
                    console.log("Deleted: " + keys[i] + " | " + reply + " | " + err);
                });
            }
        });
    }

    deleteRedundancies()
    {
        let theBase = this;
        this.client.keys('*', function (err, keys) {
            for(let i = 0, len = keys.length; i < len; i++) {
                if(keys[i] != "lastLinkId" && keys[i].startsWith("blacklist:") == false && keys[i].startsWith("oldBlacklist:") == false && keys[i].startsWith("link:") == false)
                {
                    //console.log("To delete: " + keys[i]);
                    theBase.client.del(keys[i], function(err, reply){
                        console.log("Deleted: " + keys[i] + " | " + reply + " | " + err);
                    });
                }
            }
        });
    }

    disconnect()
    {
        this.client.quit();
    }
}