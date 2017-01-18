let Link = require('./Link.js');
let DataManager = require('./DataManager.js');

//End imports

module.exports.processLink = function (link, linkId, dm)
{
    //Debug purposes
    function checkValue(value, msg, extra)
    {
        if(value == null || value == '' || value == " " || typeof value === 'undefined' || value == false)
        {
            console.log(extra);
            console.log( "->" + msg );
        }    
    }

    let words = link.getWords();
    let day = Math.floor(link.date / 60 / 60 / 24);
    checkValue(day, "day", day);

    for(let i = 0; i < words.length; i++)
    {
        let word = words[i];

        checkValue(word, "word", words);

        //Count of all seen words
        dm.client.zincrby("generalWordCount", 1, word);

        //All the words for a given day
        dm.client.zincrby("dayWordCount:" + day, 1, word);       
        
        //The count history over time for a given word 
        dm.client.zincrby("wordOnDate:" + word, 1, day); 

        //The word that occures right of a given word
        let rightWord = "#end#";

        if(i+1 < words.length)
            rightWord = words[i + 1];

        checkValue(rightWord, "rightWord " + (i + 1), words);
        
        dm.client.zincrby("rnWords:" + word, 1, rightWord);
        dm.client.zincrby("rnWordsOnDay:" + word + ":" + day, 1, rightWord);            
        
        //The word that occures left of the given word
         let leftWord = "#beginning#";
        if(i-1 >= 0)
            leftWord = words[i - 1];

        checkValue(leftWord, "leftWord " + (i - 1), words);
        
        dm.client.zincrby("lnWords:" + word, 1, leftWord);
        dm.client.zincrby("lnWordsOnDay:" + word + ":" + day, 1, leftWord);            

        //Inverted index to find newest articles to word
        dm.client.zadd("invIndex:"+word, day, linkId);
    }

    //Same headline count
    for(let i = 0; i < words.length; i++)
    {
        let firstWord = words[i];
        for(let j = i + 1; j < words.length; j++)
        {
            let secondWord = words[j];

            checkValue(firstWord, "firstWord", firstWord);
            checkValue(secondWord, "secondWord", secondWord);

            //Given word
            dm.client.zincrby("sameHeadlineCount:" + firstWord, 1, secondWord);
            dm.client.zincrby("sameHeadlineCount:" + secondWord, 1, firstWord); 

            //Over time by given word
            dm.client.zincrby("daySameHeadlineCount:" + day + ":" + firstWord, 1, secondWord);
            dm.client.zincrby("daySameHeadlineCount:" + day + ":" + secondWord, 1, firstWord); 
        }
    }

    dm.client.incrby("totalWordsCountBySource:"+link.sourceId, words.length);
    dm.client.incrby("totalWordsCount", words.length);

    dm.client.zincrby("totalWordCountOnDay", words.length, day);
}