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
        var linkTitles = [];
        var linksViaTitle = [];

        for(var i in links)
        {
            linkTitles.push(links[i].title);
            linksViaTitle[links[i].title] = links[i];
        }

        var theBase = this;
        var blacklistName = 'lastScan:' + sourceId;
        var currentScanName = 'currentScan:' + sourceId;
        
        this.client.exists(blacklistName, function(err, reply) {
            if (reply === 1) {
                //console.log('Adding to ' + currentScanName);
                theBase.client.sadd(currentScanName, linkTitles, function(err, reply) {
                    //console.log("Added to " + currentScanName + ": " + reply);
                    theBase.client.sdiff(currentScanName, blacklistName, function(err, reply) {
                        
                        console.log("New for " + sourceId + ": " + reply.length);
                        
                        for(var i in reply)
                        {
                            var title = reply[i];
                            var link = linksViaTitle[title]
                            theBase.client.hmset("link:" + theBase.lastLinkId++, link.getDataArray());
                            //console.log("Inserted " + link.getDataArray());
                            //console.log("lastLinkId is now: " + theBase.lastLinkId);
                        }

                        if(reply.length != 0)
                        {
                            theBase.client.set('lastLinkId', theBase.lastLinkId);
                            console.log("lastLinkId is now: " + theBase.lastLinkId);

                            //Set new blacklist
                            theBase.client.del(blacklistName, function(err, reply){
                                //console.log("Deleted blacklist " + reply + " | " + err);
                                theBase.client.sadd(blacklistName, linkTitles, function(err, reply) {
                                    //console.log("Created blacklist blacklist " + reply + " | " + err);
                                });
                            });
                        }

                        theBase.client.del(currentScanName, function(err, reply){
                            //console.log("Deleted currentScan " + reply + " | " + err);
                        });
                    });
                });
            } else {
                theBase.client.sadd(blacklistName, linkTitles, function(err, reply) {
                    console.log("Init blacklist: " + reply);
                });
            }
        });
    }
    
    deleteBlacklist(sourceId)
    {
        var blacklistName = 'lastScan:' + sourceId;
        this.client.del(blacklistName, function(err, reply){
            console.log("Deleted blacklist " + reply + " | " + err);
        });
    }

    getLinks(linkArrived)
    {
        for(var i = 0; i < this.lastLinkId; i++)
        {
            this.client.hgetall("link:"+i, function(err, reply) {
                if(reply != null)
                    linkArrived(new Link(reply.title, reply.date, reply.url, reply.sourceId));
            });
        }
    }

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

    disconnect()
    {
        this.client.quit();
    }
}