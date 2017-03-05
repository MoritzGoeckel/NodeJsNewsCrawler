let urlTags = [
    {pattern:"/opinion/", tag:"Opinion"},
    {pattern:"/us-news", tag:"US"},
    {pattern:"analysis", tag:"Analysis"},
    {pattern:"/music/", tag:"Music"},
    {pattern:"/business/", tag:"Business"},
    {pattern:"/money/", tag:"Money"},
    {pattern:"/sports/", tag:"Sports"}
    /*{pattern:"/opinion/", tag:"Opinion"},
    {pattern:"/opinion/", tag:"Opinion"},
    {pattern:"/opinion/", tag:"Opinion"},
    {pattern:"/opinion/", tag:"Opinion"},*/
]; 

function getRGB(color)
{
    return "rgba(" + color.rgb[0] + "," + color.rgb[1] + "," + color.rgb[2] + ", 0.8)";
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getTag(article){
    let urlTag = findKeyWord(urlTags, article.link.url);
    let keywordTag = capitalizeFirstLetter(article.query[0]);
    return urlTag;   
}

function findKeyWord(words, text){
    for(let i in words){
        if(text.indexOf(words[i].pattern) != -1)
            return words[i].tag;
    }
}

$.getJSON( "api/somearticles", function( articles ) {
    for(let a = 0; a < articles.length; a++){
        let foundTag = getTag(articles[a]);

        let tag = foundTag != undefined ? "<span class='tag'>" + foundTag + ": </span>" : "";

        let obj = $("<a href='" + articles[a].link.url + "'></a>");

        let textObject = $("<div class='article_text'><span class='headline'>" + tag + "<span class='title'>" + articles[a].link.title + "</span><span class='description'>"+articles[a].desc+"</span></span><div class='imageholder' style='background-image:url("+articles[a].img+")'></div></div>");
            
        let pictureObject = $("<div class='article'><span class='headline'>" + tag + "<span class='title'>" + articles[a].link.title + "</span></span><div class='imageholder' style='background-image:url("+articles[a].img+")'></div></div>");
        //pictureObject.css("backgroundImage", "url('" + articles[a].img + "')");

        if(articles[a].palette.LightVibrant != null){
            //obj.children(":first").children(":first").css("color", getRGB(articles[a].palette.LightVibrant));
            pictureObject.children(".headline").css("background-color", getRGB(articles[a].palette.DarkVibrant));
            
            /*pictureObject.hover(function(e) { 
                $(this).children(":first").children(".headline").css("background-color", e.type === "mouseenter" ? "rgba(255, 242, 0, 0.8)":getRGB(articles[a].palette.DarkVibrant)); 
            });*/
        }

        textObject.hide();
        obj.hover(function(){
            pictureObject.hide();
            textObject.show();
        },function(){
            textObject.hide();
            pictureObject.show();
        });

        obj.append(pictureObject);
        obj.append(textObject);

        $("#wrapper").append(obj);
    }
});