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
            var count = inputArray[i + 1];
            theBase.getTotalCountForWord(word, function(totalCount){
                var score = parseFloat(count) / totalCount; //Todo: better formula?

                outputArray.push({word: word, count: parseFloat(count), totalCount: totalCount, score: score}); 
                theBase.buildWightedWords(inputArray, outputArray, i + 2, theBase, callback);
            });
        }
        else
        {
            outputArray.sort(function (a, b) {return b.score - a.score});                
            callback(outputArray);
        }
    }

    getRightNeighbourForWord(word, callback)
    {
        this.getNeighbourInternal("rnWords:" + word.toLowerCase(), callback);
    }

    getRightNeighbourForWordOnDay(word, day, callback)
    {
        this.getNeighbourInternal("rnWordsOnDay:" + word.toLowerCase() + ":" + day, callback);
    }

    getLeftNeighbourForWord(word, callback)
    {
        this.getNeighbourInternal("lnWords:" + word.toLowerCase(), callback);
    }

    getLeftNeighbourForWordOnDay(word, day, callback)
    {
        this.getNeighbourInternal("lnWordsOnDay:" + word.toLowerCase() + ":" + day, callback);
    }

    getNeighbourInternal(query, callback)
    {
        var theBase = this;
        this.client.zrevrangebyscore(query, "+inf", 0, 'withscores', function(err, reply){
            var words = [];
            theBase.buildWightedWords(reply, words, 0, theBase, function(result){ //Todo: really wighted?
                callback(result);
            });
        });   
    }

    getSameHeadlineForWord(words, callback)
    {
        var tableName = Math.random() * 100000;
        tableName = "tmp_" + tableName + "_SameHeadline_" + words.join("-");

        var theBase = this;
        var args = [tableName, words.length];
        var wights = [];

        for(var i = 0; i < words.length; i++)
        {
            args.push("sameHeadlineCount:" + words[i].toLowerCase());
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

            theBase.client.zunionstore(args, function(err, reply){
                theBase.client.zrevrangebyscore(tableName, "+inf", 0, 'withscores', function(err, reply){ //'withscores'
                    theBase.client.del(tableName); //Todo: Cacheing maybe? Different name
                    
                    var output = [];
                    for(var i = 0; i < reply.length; i +=2)
                        output.push({word: reply[i], score:reply[i + 1]});
                    
                    //Wight by word
                    function WightByWordCount(theBase, array, i, callback)
                    {
                        if(i < array.length)
                            theBase.client.zscore("generalWordCount", array[i].word, function(err, wordCount){
                                array[i].wightedScore = Math.pow(array[i].score, 2) / wordCount;
                                WightByWordCount(theBase, array, i + 1, callback);
                            });
                        else
                            callback(array);
                    }

                    WightByWordCount(theBase, output, 0, function(output){               
                        //output.sort(function (a, b) {return b.score - a.score}); 
                        output.sort(function (a, b) {return b.wightedScore - a.wightedScore}); //Todo: use that!
                        callback(output);                    
                    });
                });
            });
        });
    }

    //Todo: Refactore duplicated code
    getSameHeadlineCountForDayAndWord(day, words, callback)
    {
        var tableName = Math.random() * 100000;
        tableName = "tmp_" + tableName + "_SameHeadlineDayWord_" + day + "_" + words.join("-");

        var theBase = this;
        var args = [tableName, words.length];
        var wights = [];

        for(var i = 0; i < words.length; i++)
        {
            args.push("daySameHeadlineCount:" + day + ":" + words[i].toLowerCase());
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

            theBase.client.zunionstore(args, function(err, reply){
                theBase.client.zrevrangebyscore(tableName, "+inf", 0, 'withscores', function(err, reply){ //'withscores'
                    theBase.client.del(tableName); //Todo: Cacheing maybe? Different name
                    
                    var output = [];
                    for(var i = 0; i < reply.length; i +=2)
                        output.push({word: reply[i], score:reply[i + 1]});
                    
                    //Wight by word
                    function WightByWordCount(theBase, array, i, callback)
                    {
                        if(i < array.length)
                            theBase.client.zscore("generalWordCount", array[i].word, function(err, wordCount){
                                array[i].wightedScore = Math.pow(array[i].score, 2) / wordCount;
                                WightByWordCount(theBase, array, i + 1, callback);
                            });
                        else
                            callback(array);
                    }

                    WightByWordCount(theBase, output, 0, function(output){               
                        //output.sort(function (a, b) {return b.score - a.score}); 
                        output.sort(function (a, b) {return b.wightedScore - a.wightedScore}); //Todo: use that!
                        callback(output);                    
                    });
                });
            });
        });

        //###################################################################
        /*var theBase = this;
        this.client.zrevrangebyscore("daySameHeadlineCount:" + day + ":" + word.toLowerCase(), "+inf", 0, 'withscores', function(err, reply){
            var words = [];
            theBase.buildWightedWords(reply, words, 0, theBase, function(result){
                callback(result);
            });
        });*/
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

    getMostPopularWordsOnDay(day, minAmount, callback)
    {
        var theBase = this;
        this.client.zrevrangebyscore("dayWordCount:" + day, "+inf", minAmount, 'withscores', function(err, reply){
            var words = [];
            theBase.buildWightedWords(reply, words, 0, theBase, function(result){
                callback(result);
            });
        });
    }

    //Todo: Multiple / Query
    getWordPopularityHistoryForWord(word, callback)
    {
        var theBase = this;
        this.client.zrevrangebyscore("wordOnDate:" + word.toLowerCase(), "+inf", 1, 'withscores', function(err, reply){
            var result = [];

            function WightByWordCount(theBase, array, i, callback)
            {
                if(i < array.length)
                    theBase.client.zscore("totalWordCountOnDay", array[i].date, function(err, totalCountOnDay){
                        
                        if(totalCountOnDay == 0 || totalCountOnDay == null)
                            totalCountOnDay = 1;
                        
                        array[i].wightedCount = array[i].count / totalCountOnDay;

                        WightByWordCount(theBase, array, i + 1, callback);
                    });
                else
                    callback(array);
            }

            var dataArray = [];
            for(var i = 0; i < reply.length; i += 2)
            {
                var day = reply[i];
                var countOnDay = reply[i + 1];

                dataArray.push({date: day, count: countOnDay});
            }

            WightByWordCount(theBase, dataArray, 0, function(output){
                callback(output);
            });

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

            theBase.client.zunionstore(args, function(err, reply){
                theBase.client.zrevrangebyscore("tmp", "+inf", 0, function(err, reply){ //'withscores'
                    callback(reply);
                    theBase.client.del("tmp"); //Todo: Cacheing maybe?
                });
            });
        });
    }
}