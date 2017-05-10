# NewsCrawler
This is a software which scans a given set of news sources and extracts its headlines. The headlines are processed and saved for later analysis. The data can be accessed from a web frontend or a rest API. Its all about the analysis of news trends.

## Features
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
* Example news bot for facebook

## Rest API
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

## Backend Dependencies (npm)
* express
* express-rest
* cheerio
* redis
* request
* node-schedule
* fbgraph
* nlp_compromise

## Frontend Dependencies
* bootstrap
* JQuery

## Setup
Download the files, install Redis, install the npm dpendencies and run the 'Start.js'. You can also specify the news sources in the data/sources.json. After start navigate with your favorite browser to http://localhost:3000 to see the frontend. If you want to use the bots, you have to create the config.json in the /data folder. There is an example config in the same folder.

## Usage
To run the webserver and the downloader / processor just execute the 'Start.js' file

```
> node Start.js
```

## Facebook bot
It is possible to create news bots for facebook pages with this framework. I created an example bot. Create a /data/config.json file for your facebook page and run
```
> node WhoGotKilledBot.js
```
If you want to see a bot in action: https://www.facebook.com/pg/whogotkilled/

The WhoGotKilledBot searches for news with the word "killed" and tires to extract the information who got killed in which place. It will post these articles every 10 minutes to the facebook page and avoids doublicated posts. There is also an TrumpNews bot.


## Generating the most recent headlines
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

## Frontend
![alt tag](https://raw.githubusercontent.com/MoritzGoeckel/NodeJSNewsCrawler/master/docs/newsscreen.PNG)
