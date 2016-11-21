var redis = require('redis');

var Article = require('./Article.js');
var Link = require('./Link.js');

module.exports = class DataManager{
    constructor()
    {
        var theBase = this;
        this.client = redis.createClient();        
        this.client.on('connect', function() {
            console.log('Redis connected');

            theBase.client.get('lastArticleId', function(err, reply) {
                if(typeof reply == 'undefined')
                    theBase.client.set('lastArticleId', '0');
            });
        });        
    }

    saveCurrentScan(source, articleTitles)
    {
        var theBase = this;
        var blacklistName = 'blacklist:' + source.name;
        var currentScanName = 'currentScan:' + source.name;
        
        this.client.exists(blacklistName, function(err, reply) {
            if (reply === 1) {
                console.log('Creating ' + currentScanName);
                theBase.client.sadd(currentScanName, articleTitles, function(err, reply) {
                    console.log("Added to " + currentScanName + ": " + reply);
                    theBase.client.sdiff(currentScanName, blacklistName, function(err, reply) {
                        theBase.client. //the reply is the new data. Add it somewhere (blacklist and process) delete currentScanName
                    });
                });
            } else {
                console.log('Creating blacklist: ' + blacklistName);
                theBase.client.sadd(blacklistName, articleTitles, function(err, reply) {
                    console.log("Added blacklist: " + reply);
                });
            }
        });
    }
    
    disconnect()
    {
        this.client.quit();
    }
}