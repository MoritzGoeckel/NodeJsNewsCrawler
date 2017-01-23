let request = require('request');
let fbgraph = require('fbgraph');

module.exports = class FacebookSupport
{
    constructor(appid, appsecret){
        this.appid = appid;
        this.appsecret = appsecret;
        this.apptoken = appid + "|" + appsecret;
    }

    //POST https://graph.facebook.com/546349135390552/feed?message=For all Math geniuses :)&link=www.projecteuler.net
    //For pages get token here / -> me/accounts
    //https://developers.facebook.com/tools/explorer/
    postTo(pageId, msg, link, token){
        if(token == undefined)
            token = this.apptoken;
        
        let params = "";

        if(msg != undefined)
            params += "&message=" + msg;

        if(link != undefined)
            params += "&link=" + link;

        if(params != "")
        {
            request.post("https://graph.facebook.com/"+pageId+"/feed?access_token=" + token + params, function(err, res, body){
                if(err != null)
                    console.log(err);

                console.log(body);
            });
        }
        else
        {
            console.log("No link or message!");
        }
    }

    extendToken(token){
        fbgraph.extendAccessToken({"access_token": token, "client_id": this.appid, "client_secret": this.appsecret}, function (err, facebookRes) {
            if(err != null)            
                console.log(err);
                
            console.log(facebookRes); //Save the token somehow -> .access_token
        });
    }

    getTokens(){
        request("https://graph.facebook.com/" + "me/accounts" + "?access_token=" + this.apptoken, function(error, response, body){
            if(error != null)            
                console.log(error);
                
            console.log(body);
        });
    }

    downloadPosts(pageId, callback)
    {
        this.downloadPages(pageId + "/posts", callback);
    }

    downloadComments(postId, callback)
    {
        this.downloadPages(postId + "/comments", callback);
    }

    downloadPages(pageId, callback){   
        let theBase = this;
        request("https://graph.facebook.com/" + pageId + "?access_token=" + theBase.apptoken, function(error, response, body){
            
            let res;
            try {
                res = JSON.parse(body);
            }catch(e){
                console.log("JSON ERROR: ");
                console.log(e);
                console.log("Body:");
                console.log(body);
                console.log("Response:");
                console.log(response);
                callback([], undefined, undefined);
            }

            if(res != undefined)
            {
                let getNextPage;
                let getPreviousPage;

                if(res.paging != undefined)
                {
                    if(res.paging.previous != undefined)
                    {
                        getPreviousPage = function(){theBase.downloadPages(res.paging.previous, callback);};
                    }

                    if(res.paging.next != undefined){
                        getNextPage = function(){theBase.downloadPages(res.paging.next, callback);};
                    }
                }

                callback(res.data, getPreviousPage, getNextPage);
            }
        });
    }
}