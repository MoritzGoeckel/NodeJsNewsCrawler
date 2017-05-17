const elasticsearch = require('elasticsearch');
const AgentKeepAlive = require('agentkeepalive');

module.exports = class{

    constructor(){
        this.client = new elasticsearch.Client({
            hosts: ['localhost:9200'],
            maxRetries: 10,
            keepAlive: true,
            maxSockets: 10,
            minSockets: 10,
            createNodeAgent: function (connection, config) {
                return new AgentKeepAlive(connection.makeAgentConfig(config));
            },
            log: 'error',
            requestTimeout: 20 * 1000
        });
    }

    initDatabase(){

        let base = this;

        this.client.delete({
            index: 'newsdata',
            type: '',
            id: ''
            }, function (err, resp) {
            if(err != null && err != undefined)
                console.log(err);
            
            /*base.client.index({
                index: 'newsdata',
                type: 'article',
                id: '',
                body: {  }
                }, function (err, resp) {
                if(err != null && err != undefined)
                    console.log(err);
                
                client.indices.putMapping({
                    body: 
                    {
                        "article":{
                            "properties":{
                                "claims": {
                                    "enabled": false,
                                    "type" : "object"
                                }
                            }
                        }
                    },
                    type: "article",
                    index: "newsdata"
                    },function (err, resp) {
                    if(err != null && err != undefined)
                        console.log(err);

                    console.log(resp);
                });

                console.log(resp);
            });*/

            console.log(resp);
        });
    }

    sendToES(body, callbackSucess){
        let base = this;

        this.client.bulk({ body: body }, function (err, resp) {
            if(err != null && err != undefined){
                setTimeout(function(){ base.sendToES(body); }, 0);         
            
                console.log("");
                console.log(err); 
                console.log("");
            }
            else{
                callbackSucess();
            }
        });
    }

    indexArticles(articles, callbackSucess){
        let body = [];
        for(let i = 0; i < articles.length; i++)
        {
            body.push({ index:  { _index: 'newsdata', _type: "article" } });
            body.push( articles[i] );
        }

        this.sendToES(body, callbackSucess);
    }
}