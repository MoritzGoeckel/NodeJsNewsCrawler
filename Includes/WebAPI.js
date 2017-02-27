let express = require('express');
let expressRest = require('express-rest');

let Link = require('./Link.js');

module.exports.createWebApi = function(exp, rest, api, maxReturnElements, sources)
{
    let theBase = this;

    console.log("Serving: " + __dirname + '/../Frontend');
    exp.use("/", express.static(__dirname + '/../Frontend'));

    //#######################################################  Search  #############
    rest.get('/api/search/:query', function(req, rest) {
        let words = theBase.getWordsArray(req.params.query);
        api.getLinksToWords(words, function(result){
            let links = [];
            function buildLinkList(i, count, callback)
            {
                if(i < result.length && i < count)
                {
                    api.getLink(result[i], function(link){
                        links.push(link)
                        buildLinkList(i + 1, count, callback);
                    });
                }
                else
                    callback();
            }

            buildLinkList(0, maxReturnElements, function(){
                return rest.ok(links.slice(0, maxReturnElements));
            });
        });
    });

    //#######################################################  Right Neighbour  #############

    rest.get('/api/rightneighbour/:word', function(req, rest) {
        api.getRightNeighbourForWord(req.params.word.toLowerCase(), function(result){
            return rest.ok(result.slice(0, maxReturnElements));
        });
    });

    //#######################################################  Right Neighbour On Day  #############

    rest.get('/api/rightneighbour/:word/:day', function(req, rest) {
        api.getRightNeighbourForWordOnDay(req.params.word.toLowerCase(), req.params.day, function(result){
            return rest.ok(result.slice(0, maxReturnElements));
        });
    });

    //#######################################################  Left Neighbour  #############

    rest.get('/api/leftneighbour/:word', function(req, rest) {
        api.getLeftNeighbourForWord(req.params.word.toLowerCase(), function(result){
            return rest.ok(result.slice(0, maxReturnElements));
        });
    });

    //#######################################################  Left Neighbour On Day  #############

    rest.get('/api/leftneighbour/:word/:day', function(req, rest) {
        api.getLeftNeighbourForWordOnDay(req.params.word.toLowerCase(), req.params.day, function(result){
            return rest.ok(result.slice(0, maxReturnElements));
        });
    });

    //#######################################################  Same headline  #############

    rest.get('/api/sameheadline/:query', function(req, rest) {
        let words = theBase.getWordsArray(req.params.query);
        api.getSameHeadlineForWord(words, function(result){
            return rest.ok(result.slice(0, maxReturnElements));
        });
    });

    //#######################################################  Same headline on day  #############

    rest.get('/api/sameheadline/:query/:day', function(req, rest) {
        let words = theBase.getWordsArray(req.params.query);
        api.getSameHeadlineCountForDayAndWord(req.params.day, words, function(result){
            return rest.ok(result.slice(0, maxReturnElements));
        });
    });

    //#######################################################  Total count for word  #############

    rest.get('/api/count/:word', function(req, rest) {
        api.getTotalCountForWord(req.params.word.toLowerCase(), function(result){
            return rest.ok(result);
        });
    });

    //#######################################################  Popular words on day  #############

    rest.get('/api/popularwords/:day', function(req, rest) {
        api.getMostPopularWordsOnDay(req.params.day, 15, function(result){ //Todo: 15 is hardcoded minAmount
            return rest.ok(result.slice(0, maxReturnElements));
        });
    });

    //#######################################################  Popular words today  #############

    rest.get('/api/popularwords/', function(req, rest) {
        api.getMostPopularWordsOnDay(theBase.getToday(), 15, function(result){ //Todo: 15 is hardcoded minAmount
            return rest.ok(result.slice(0, maxReturnElements));
        });
    });

    //#######################################################  Word popularity history  #############

    rest.get('/api/popularwordhistory/:word', function(req, rest) {
        api.getWordPopularityHistoryForWord(req.params.word.toLowerCase(), function(result){
            return rest.ok(result.slice(0, maxReturnElements));
        });
    });

    //#######################################################  get link by id  #############

    rest.get('/api/link/:id', function(req, rest) {
        api.getLink(req.params.id, function(result){
            return rest.ok(result);
        });
    });

    //#######################################################  get sources  #############

    rest.get('/api/sources/', function(req, rest) {
        
        let output = {};
        for(let i = 0; i < sources.length; i++)
        {
            output[sources[i].id] = sources[i];
        }

        return rest.ok(output);
    });
    
    //#######################################################  Example  #############

    /*rest.get('/api/search/:query', function(req, rest) {
        req.params.query
        return rest.ok(links);
    });*/

    //#######################################################  API END  #############
}

module.exports.getToday = function(){
    return Math.floor(Date.now() / 1000 / 60 / 60 / 24);
}

module.exports.getWordsArray = function(str){
    let words = str.split(/[,\.\-#+^<´>|;:_'*~?=\")(/&%$§!) ]+/);
        
    for(let i = 0; i < words.length; i++)
    {
        if(words[i] == false || words[i] == null || words[i] == '' || words[i] == ' ' || typeof words[i] === 'undefined' || words[i] == " ")
        {
            words.splice(i, 1);
            i--;
        }
        else
            words[i] = words[i].toLowerCase();
    }
    
    function removeDoubleElements(a) {
        let seen = {};
        return a.filter(function(item) {
            return seen.hasOwnProperty(item) ? false : (seen[item] = true);
        });
    }

    words = removeDoubleElements(words);

    while(words[words.length - 1] == " ")
        words.splice(words.length - 1);

    return words;
}