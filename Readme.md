#NewsCrawler
This is a software which scans a given set of news sources and extracts its headlines. The headlines are processed and saved for later analysis. The data can be accessed from a web frontend or a rest API. Its all about the analysis of news trends.

##Features
* Downloads article titles from the news data/sources.json
* Saves them in a Redis database
* Creates an inverted index for search
* Creates left/right neighbour relations for every word (and day)
* Creates same headline relations for every word (and day)
* Counts the occurence for every word (and day)
* Finds the most popular words for the day
* Provides a rest api for data access
* Web frontend which supports most of the backend functionalities
* The frontend is responsive

##Rest API
These are the API endpoints

```
/api/search/:query
/api/rightneighbour/:word
/api/rightneighbour/:word/:day
/api/leftneighbour/:word
/api/leftneighbour/:word/:day
/api/sameheadline/:query
/api/sameheadline/:query/:day
/api/count/:word
/api/popularwords/:day
/api/popularwords/
/api/popularwordhistory/:word
/api/link/:id
/api/sources/
```

To get the day today to give to the api you can use the following function
``` javascript
getToday = function(){
    return Math.floor(Date.now() / 1000 / 60 / 60 / 24);
}
```

##Dependencies
* express
* express-rest
* cheerio
* redis
* request
* node-schedule
* bootstrap
* JQuery


##Setup
Download the files, install Redis, install the npm dpendencies and run the 'Start.js'. You can also specify the news sources in the data/sources.json.

##Usage
To run the webserver and the downloader / processor just execute the 'Start.js' file

```
> node Start.js
```

##Generating the most recent headlines
Try generating the most important headlines of the day by executing 'CreateHeadlines.js'. This is heighly experimental 

```
> node CreateHeadlines.js
```

```
[ [ 'steven', 'mnuchin' ],
  [ 'womens', 'march' ],
  [ 'novak', 'djokovic', 'upset' ],
  [ 'largest', 'student', 'loan' ],
  [ 'agriculture', 'secretary' ],
  [ 'los', 'angeles' ],
  [ 'developer', 'rick', 'perry' ],
  [ 'treasury', 'pick' ],
  [ 'press', 'conference' ],
  [ 'chelsea', 'manning' ],
  [ 'avalanche', 'buries', 'hotel' ],
  [ 'second', 'round' ],
  [ 'full', 'article' ],
  [ 'takes', 'office' ],
  [ 'australian', 'open' ],
  [ 'least', '30', 'firefighters', 'killed' ],
  [ 'tehran', 'high', 'rise', 'collapses' ],
  [ 'peoples', 'choice', 'awards' ],
  [ 'first', 'lady' ],
  [ 'more', 'than', '100', 'lapd' ],
  [ 'donald', 'trumps', 'inauguration', 'day' ],
  ...
```

##Frontend
![alt tag](https://raw.githubusercontent.com/MoritzGoeckel/NodeJSNewsCrawler/master/docs/newsscreen.PNG)
