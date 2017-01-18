module.exports = class HeadlineWriter{
    constructor(api)
    {
        this.api = api;
    }

    getHeadlineForWord(word, thresholdCount, thresholdChance, callback)
    {
        let headline = [word];
        let theBase = this;

        theBase.addManyLeft(headline, theBase.api, thresholdCount, thresholdChance, function(leftCompleteHeadline){
            theBase.addManyRight(leftCompleteHeadline, theBase.api, thresholdCount, thresholdChance, function(completeHeadline){
                callback(completeHeadline);
            });
        });
    }

    addWordRight(array, api, thresholdCount, thresholdChance, candidates, callbackSuccess, callbackFailed)
    {
        let theBase = this;
        if(array[array.length - 1] == "#end#")
            callbackFailed(array);
        else
        {
            api.getRightNeighbourForWordOnDay(array[array.length - 1], theBase.getToday(), function(rn){                
                let choosenRight;

                rn = rn.sort(function(a, b){return b.count - a.count;});

                for(let i in rn)
                {
                    if(rn[i].count >= thresholdCount && rn[i].score >= thresholdChance && candidates.indexOf(rn[i].word) > -1){
                        choosenRight = rn[i].word;
                        break;
                    }

                    if(rn[i].count < thresholdCount)
                        break;
                }

                if(choosenRight != undefined){
                    array.push(choosenRight);
                    callbackSuccess(array);
                }
                else
                    callbackFailed(array);
            });
        }
    }

    addWordLeft(array, api, thresholdCount, thresholdChance, candidates, callbackSuccess, callbackFailed)
    {
        let theBase = this;
        if(array[0] == "#beginning#")
            callbackFailed(array);
        else
        {
            api.getLeftNeighbourForWordOnDay(array[0], theBase.getToday(), function(ln){                
                let choosenLeft;

                ln = ln.sort(function(a, b){return b.count - a.count;}); //Sort to count not score

                for(let i in ln)
                {
                    if(ln[i].count >= thresholdCount && ln[i].score >= thresholdChance && candidates.indexOf(ln[i].word) > -1){                                
                        choosenLeft = ln[i].word;
                        break;
                    }

                    if(ln[i].count < thresholdCount)
                        break;
                }

                if(choosenLeft != undefined){
                    array.unshift(choosenLeft);
                    callbackSuccess(array);
                }
                else
                    callbackFailed(array);
            });
        }
    }

    getToday(){
        return Math.floor(Date.now() / 1000 / 60 / 60 / 24);
    }

    addManyInternal(headline, api, thresholdCount, thresholdChance, addManyFunction, callback)
    {
        let theBase = this;

        this.api.getSameHeadlineCountForDayAndWord(theBase.getToday(), headline, function(candidatesResult){
            let candidates = [];
            for(let a in candidatesResult)
                candidates.push(candidatesResult[a].word);

            addManyFunction(headline, api, thresholdCount, thresholdChance, candidates,
                function(newHeadline){
                    //Success try again
                    theBase.addManyLeft(newHeadline, api, thresholdCount, thresholdChance, callback);
                }, callback);
        });
    }

    addManyLeft(headline, api, thresholdCount, thresholdChance, callback)
    {
        this.addManyInternal(headline, api, thresholdCount, thresholdChance, this.addWordLeft.bind(this), callback);
    }

    addManyRight(headline, api, thresholdCount, thresholdChance, callback)
    {
        this.addManyInternal(headline, api, thresholdCount, thresholdChance, this.addWordRight.bind(this), callback);
    }
}