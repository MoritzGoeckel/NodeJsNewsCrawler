module.exports = class HeadlineWriter{
    constructor(api)
    {
        this.api = api;
    }

    getClusteredWords(amount, relationAverageMultiplicator, minAmount, callback)
    {
        let theBase = this;
        let headlines = {};

        let scoreEntries = 0; //[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let scoreSum = 0; //[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        theBase.api.getMostPopularWordsOnDay(theBase.getToday(), minAmount, function(popular){

            for(let i = 0; i < popular.length && i < amount * 10; i++)
            {
                theBase.api.getSameHeadlineCountForDayAndWord(theBase.getToday(), [popular[i].word], function(related){
                    headlines[popular[i].word] = [];                    
                    
                    setTimeout(function(){
                        for(let f = 0; f < related.length && f < amount; f++)
                        {
                            if(headlines[related[f].word] != undefined){

                                //let n = headlines[popular[i].word].length;
                                scoreEntries += 1;
                                scoreSum += related[f].wightedScore;

                                headlines[popular[i].word].push({word:related[f].word, score:related[f].wightedScore});
                            }
                        }
                    }, 4000);
                });
            }

            setTimeout(function(){ //I hate this timeout workaround todo!
                console.log(scoreSum);
                console.log(scoreEntries);

                //Remove below average
                for(let k in headlines)
                {
                    for(let r = 0; r < headlines[k].length; r++)
                    {
                        if(headlines[k][r].score * relationAverageMultiplicator < scoreSum / scoreEntries)
                        {
                            headlines[k].splice(r, 1);
                            r--;
                        }
                    }
                }

                //remove very similar
                for(let k in headlines)
                {
                    for(let r = 0; r < headlines[k].length; r++)
                    {
                        for(let r2 = 0; r2 < headlines[k].length; r2++)
                        {
                            if(r != r2 && theBase.levenshteinDistance(headlines[k][r].word, headlines[k][r2].word) < 2)
                            {
                                headlines[k].splice(r, 1);
                                r--;
                            }
                        }
                    }
                }

                theBase.api.getMostPopularWordsOnDay(theBase.getToday(), minAmount, function(topPopular){
                    let output = [];

                    for(let i = 0; i < topPopular.length && i < amount; i++)
                    {
                        output.push({word:topPopular[i].word, relations:headlines[topPopular[i].word]});
                    }

                    callback(output);                    
                });

            }, 10000);
        });
    }

    getDistance(headlineOne, headlineTwo)
    {
        var h1 = headlineOne.slice();
        var h2 = headlineTwo.slice();

        h1.sort();
        h2.sort();

        if(h1.length != h2.length)
            return 1000000;

        let distance = 0;
        for(let i = 0; i < h1.length && i < h2.length; i++)
                distance += this.levenshteinDistance(h1[i], h2[i]);
        
        return distance;
    }

    levenshteinDistance(a, b) {
        if (a.length === 0) return b.length
        if (b.length === 0) return a.length
        let tmp, i, j, prev, val
        // swap to save some memory O(min(a,b)) instead of O(a)
        if (a.length > b.length) {
            tmp = a
            a = b
            b = tmp
        }

        let row = Array(a.length + 1)
        // init the row
        for (i = 0; i <= a.length; i++) {
            row[i] = i
        }

        // fill in the rest
        for (i = 1; i <= b.length; i++) {
            prev = i
            for (j = 1; j <= a.length; j++) {
            if (b[i-1] === a[j-1]) {
                val = row[j-1] // match
            } else {
                val = Math.min(row[j-1] + 1, // substitution
                    Math.min(prev + 1,     // insertion
                            row[j] + 1))  // deletion
            }
            row[j - 1] = prev
            prev = val
            }
            row[a.length] = prev
        }
        return row[a.length]
    }

    getToday(){
        return Math.floor(Date.now() / 1000 / 60 / 60 / 24);
    }
}