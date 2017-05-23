const fs = require('fs');

module.exports = class {

    constructor(){
        this.dict = {};

        function loadAnnotatedFile(path, key, value, dict){
            var array = fs.readFileSync(path).toString().split("\n");
            for(let i in array) {

                let word = array[i].toLowerCase();
                word = word.replace("\r", "");
                word = word.replace(" ", "");

                if(word.length > 2 && word.length < 25){
                    if(dict[word] == undefined){
                        dict[word] = {};
                        dict[word][key] = value;
                    }
                    else{
                        if(dict[word][key] == undefined)
                            dict[word][key] == value;
                        else if(dict[word][key] != value)
                        {
                            //console.log("Found ambigoues value: " + word + " -> " + dict[word][key] + " vs " + value + " (" + key + ")");
                        }
                    }
                }
                else
                {
                    //console.log(word + " not indexed");
                }
            }
        }

        loadAnnotatedFile("../../../data/positive-words.txt", "pn", "p", this.dict);
        loadAnnotatedFile("../../../data/pstv.txt", "pn", "p", this.dict);
        loadAnnotatedFile("../../../data/negative-words.txt", "pn", "n", this.dict);
        loadAnnotatedFile("../../../data/ngtv.txt", "pn", "n", this.dict);
        loadAnnotatedFile("../../../data/my-positive.txt", "pn", "p", this.dict);
        
        //Blacklist
        delete this.dict["trump"];

        //console.log(Object.keys(this.dict).length + " words annotated");
    }

    getSentimentScore(wordArray){
        let score = 0;
        let foundWords = 0;
        for(let i in wordArray)
        {
            let word = wordArray[i].toLowerCase();
            if(this.dict[word] != undefined){

                //console.log(word + " " + this.dict[word]["pn"]);

                if(this.dict[word]["pn"] == "n"){
                    score--;
                    foundWords++;
                }
                else if(this.dict[word]["pn"] == "p"){
                    score++;
                    foundWords++;
                }
            }
        }

        if(foundWords == 0)
            return null;

        return score / foundWords;
    }
}