var Link = require('./Link.js');

module.exports = class DataAPI{

    constructor(client)
    {
        this.client = client;
    }

    buildWightedWords(inputArray, outputArray, i, theBase, callback)
    {
        if(i < inputArray.length)
        {
            var word = inputArray[i];
            theBase.getTotalCountForWord(word, function(count){
                //count: parseFloat(inputArray[i+1]), likelyhood: count,
                outputArray.push({word: word, score: (parseFloat(inputArray[i+1]) / count) * Math.log(inputArray[i+1])}); //Todo: better formula?
                theBase.buildWightedWords(inputArray, outputArray, i + 2, theBase, callback);
            });
        }
        else
        {
            outputArray.sort(function (a, b) {return b.score - a.score});                
            callback(outputArray);
        }
    }

    //Todo: Wight
    getRightNeighbourForWord(word, callback)
    {
        var theBase = this;
        this.client.zrevrangebyscore("rnWords:" + word.toLowerCase(), "+inf", 0, 'withscores', function(err, reply){
            var words = [];
            theBase.buildWightedWords(reply, words, 0, theBase, function(result){
                callback(result);
            });
        });    
    }

    //Todo: Wight
    getSameHeadlineForWord(word, callback)
    {
        var theBase = this;
        theBase.client.zrevrangebyscore("sameHeadlineCount:" + word.toLowerCase(), "+inf", 0, 'withscores', function(err, reply){
            var words = [];
            theBase.buildWightedWords(reply, words, 0, theBase, function(result){
                callback(result);
            });
        });
    }

    //Todo: Wight
    getSameHeadlineCountForDayAndWord(day, word, callback)
    {
        var theBase = this;
        this.client.zrevrangebyscore("daySameHeadlineCount:" + day + ":" + word.toLowerCase(), "+inf", 0, 'withscores', function(err, reply){
            var words = [];
            theBase.buildWightedWords(reply, words, 0, theBase, function(result){
                callback(result);
            });
        });
    }

    getTotalCountAllWords(callback)
    {
        this.client.get("totalWordsCount", function(err, reply){
            callback(reply);
        });
    }

    getTotalCountForWord(word, callback)
    {
        this.client.zscore("generalWordCount", word.toLowerCase(), function(err, reply){
            callback(reply);
        });
    }

    //Todo: Wight
    getMostPopularWordsOnDay(day, callback)
    {
        var theBase = this;
        this.client.zrevrangebyscore("dayWordCount:" + day, "+inf", 1, 'withscores', function(err, reply){
            var words = [];
            theBase.buildWightedWords(reply, words, 0, theBase, function(result){
                callback(result);
            });
        });
    }

    getWordPopularityHistoryForWord(word, callback)
    {
        this.client.zrevrangebyscore("wordOnDate:" + word.toLowerCase(), "+inf", 1, 'withscores', function(err, reply){
            callback(reply);
        });
    }

    getLastLinkId(callback)
    {
        this.client.get("lastLinkId", function(err, reply){
            callback(reply);
        });
    }

    getWordsCountBySource(sourceId, callback)
    {
        this.client.get("totalWordsCountBySource:" + sourceId, function(err, reply){
            callback(reply);
        });
    }

    getLink(id, callback)
    {
        this.client.hgetall("link:"+id, function(err, reply) {
            callback(new Link(reply.title, reply.date, reply.url, reply.sourceId), reply.id);
        });
    }

    getLinksToWords(words, callback)
    {
        var args = ["tmp", words.length];

        var wights = [];


        for(var i = 0; i < words.length; i++)
        {
            args.push("invIndex:" + words[i].toLowerCase());
        }

        function buildWightsArray(i, theBase, callback){
            if(i < words.length)
            {
                theBase.getTotalCountForWord(words[i], function(reply){
                    wights.push(1 / reply);       
                    buildWightsArray(i + 1, theBase, callback);     
                });
            }
            else
                callback(theBase);
        }

        buildWightsArray(0, this, function(theBase){
            args.push('WEIGHTS');
            
            for(var i = 0; i < wights.length; i++)
                args.push(wights[i]);

            //console.log(args);

            theBase.client.zunionstore(args, function(err, reply){
                theBase.client.zrevrangebyscore("tmp", "+inf", 0, function(err, reply){ //'withscores'
                    callback(reply);
                    theBase.client.del("tmp"); //Todo: Cacheing maybe?
                });
            });
        });
    }
}