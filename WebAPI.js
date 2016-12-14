var sources = require("./data/sources.json");
var articles = require("./data/articles.json");

var Download =  require('./Includes/Download.js');
var ArticleScanner = require('./Includes/ArticleScanner.js');
var LinkScanner = require('./Includes/LinkScanner.js');
var Article = require('./Includes/Article.js');
var Link = require('./Includes/Link.js');
var DataManager = require('./Includes/DataManager.js');

var DataAPI = require('./Includes/DataAPI.js');

var express = require('express');
var expressRest = require('express-rest');
 
//End imports

var maxReturnElements = 200;

var dm = new DataManager(function()
{
    var api = new DataAPI(dm.client);
    
    var exp = express();
    var rest = expressRest(exp);

    //Make the frontend directory public
    exp.use(express.static('Frontend'));

    //#######################################################  Search  #############
    rest.get('/api/search/:query', function(req, rest) {
        var words = getWordsArray(req.params.query);
        api.getLinksToWords(words, function(result){
            var links = [];
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

    //#######################################################  Same headline  #############

    rest.get('/api/sameheadline/:word', function(req, rest) {
        api.getSameHeadlineForWord(req.params.word.toLowerCase(), function(result){
            return rest.ok(result.slice(0, maxReturnElements));
        });
    });

    //#######################################################  Same headline on day  #############

    rest.get('/api/sameheadline/:word/:day', function(req, rest) {
        api.getSameHeadlineCountForDayAndWord(req.params.day, req.params.word.toLowerCase(), function(result){
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
        api.getMostPopularWordsOnDay(req.params.day, function(result){
            return rest.ok(result.slice(0, maxReturnElements));
        });
    });

    //#######################################################  Popular words today  #############

    rest.get('/api/popularwords/', function(req, rest) {
        api.getMostPopularWordsOnDay(getToday(), function(result){
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
        
        var output = {};
        for(var i = 0; i < sources.length; i++)
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

    var listener = exp.listen(3000, function(){
        console.log('Listening on port ' + listener.address().port); //Listening on port 8888
    });
});

function getToday(){
    return Math.floor(Date.now() / 1000 / 60 / 60 / 24);
}

function getWordsArray(str){
    var words = str.split(/[,\.\-#+^<´>|;:_'*~?=\")(/&%$§!) ]+/);
        
    for(var i = 0; i < words.length; i++)
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
        var seen = {};
        return a.filter(function(item) {
            return seen.hasOwnProperty(item) ? false : (seen[item] = true);
        });
    }

    words = removeDoubleElements(words);

    while(words[words.length - 1] == " ")
        words.splice(words.length - 1);

    return words;
}