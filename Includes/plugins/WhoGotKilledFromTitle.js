let nlp = require('nlp_compromise');
//nlp.plugin(require('nlp-links'));

module.exports.whoGotKilledFromTitle = function (title)
{
    let sentence = nlp.sentence(title); //withLinks();
    function isNumber(obj) { return !isNaN(parseFloat(obj)) }
    function validVictim(term)
    {
        return term != undefined && (term.tag == "Noun" || term.tag == "Possessive" ||  term.tag == "Value" || term.tag == "Actor" || term.tag == "Plural" || isNumber(term.normal) );
    }

    for(let t = 0; t < sentence.terms.length; t++)
    {
        if(sentence.terms[t].normal == "killed")
        {
            var output = "";
            if(t > 0 && validVictim(sentence.terms[t - 1]) && (t + 1 < sentence.terms.length && isNumber(sentence.terms[t + 1].normal)) == false){ //Found left
                output = sentence.terms[t - 1].text;
                if(t - 2 >= 0 && isNumber(sentence.terms[t - 2].normal))
                    output = sentence.terms[t - 2].text + " " + output;
            }
            else if(validVictim(sentence.terms[t + 1])) //Found right
            {
                output = sentence.terms[t + 1].text;
                if(t + 2 < sentence.terms.length && isNumber(sentence.terms[t + 1].normal) && validVictim(sentence.terms[t + 2]))
                    output = output + " " + sentence.terms[t + 2].text;                                   
            }
            else
            {
                output = "Someone"
                console.log("Nothing found!");
                console.log(sentence);
            }

            let places = sentence.places();
            if(places.length != 0)
            {
                output += " in " + places[0].text;
            }
            else
            {
                var foundIn = false;
                for(let t2 = 0; t2 < sentence.terms.length; t2++)
                {
                    if(sentence.terms[t2].normal == "in")
                    {
                        foundIn = true;
                        output += " in " + sentence.terms[t2 + 1].text;
                        t2++;
                    }
                    else if(foundIn == true && sentence.terms[t2].tag == "Noun")
                    {
                        output += " " + sentence.terms[t2].text;
                    }
                }
            }

            //Capitalize
            output = output.charAt(0).toUpperCase() + output.slice(1);
                        
            if(isNumber(output) && output.split(" ").length == 1)
            {
                if(output == "1")
                    output += " person";
                else
                    output += " people";
            }

            //Only one word -> add A / An
            if(output.split(" ").length == 1)
            {
                let vocals = "AEIOUaeiou";
                if(vocals.indexOf(output.charAt(0)) == -1)
                    output = "A " + output;
                else
                    output = "An " + output;
            }

            break;
        }
    }
    
    return output;
}