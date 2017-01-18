var redis = require('redis');

//var Article = require('./Article.js');
var Link = require('./Link.js');

module.exports = class DataManager{
    constructor(finishedInit)
    {
        var theBase = this;
        this.client = redis.createClient();        
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

                finishedInit();
            });
        });        
    }

    saveCurrentScan(sourceId, links)
    {
        var linkUrls = [];
        var linksViaUrls = [];

        for(var i in links)
        {
            linkUrls.push(links[i].url);
            linksViaUrls[links[i].url] = links[i];
        }

        var theBase = this;
        var blacklistName = 'blacklist:' + sourceId;
        var oldBlacklistName = 'oldBlacklist:' + sourceId;
        var currentScanName = 'currentScan:' + sourceId;
        
        theBase.client.sadd(currentScanName, linkUrls, function(err, reply) {
            //console.log("Added to " + currentScanName + ": " + reply);
            theBase.client.sdiff(currentScanName, blacklistName, oldBlacklistName, function(err, reply) {
                
                console.log("New for " + sourceId + ": " + reply.length);

                for(var i in reply)
                {
                    var url = reply[i];
                    var link = linksViaUrls[url]
                    var id = theBase.lastLinkId++;
                    var data = link.getDataArray();
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
        var blacklistName = 'blacklist:' + sourceId;
        var oldBlacklistName = 'oldBlacklist:' + sourceId;
        var theBase = this;

        this.client.del(oldBlacklistName, function(err, reply){
            console.log("Deleted old blacklist " + reply + " | " + err);
            theBase.client.rename(blacklistName, oldBlacklistName, function(err, reply){
                console.log("Renamed the new to the old blacklist " + reply + " | " + err);
            });
        });
    }

    getArticleToProcess(callback)
    {
        var theBase = this;
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

            var nextId = theBase.lastProcessedLinkId + 1;
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
        for(var i = 0; i < this.lastLinkId; i++)
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
        var theBase = this;
        this.client.keys('*', function (err, keys) {
            for(var i = 0, len = keys.length; i < len; i++) {
                theBase.client.del(keys[i], function(err, reply){
                    console.log("Deleted: " + keys[i] + " | " + reply + " | " + err);
                });
            }
        });
    }

    deleteRedundancies()
    {
        var theBase = this;
        this.client.keys('*', function (err, keys) {
            for(var i = 0, len = keys.length; i < len; i++) {
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