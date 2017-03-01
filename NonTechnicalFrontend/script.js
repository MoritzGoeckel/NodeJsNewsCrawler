let urlTags = [
    {pattern:"/opinion/", tag:"Opinion"},
    {pattern:"/us-news", tag:"US"},
    {pattern:"analysis", tag:"Analysis"}
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
    return keywordTag;   
}

function findKeyWord(words, text){
    for(let i in words){
        if(text.indexOf(words[i].pattern) != -1)
            return words[i].tag;
    }
}

$.getJSON( "api/somearticles", function( articles ) {
    for(let a in articles){

        if(articles[a].link.title.length < 200){
            let foundTag = getTag(articles[a]);

            let tag = foundTag != undefined ? "<span class='tag'>" + foundTag + ": </span>" : "";

            let obj = $("<a href='" + articles[a].link.url + "'><div class='article'><span class='headline'>" + tag + "<span class='title'>" + articles[a].link.title + "</span></span></div></a>");
            obj.children(":first").css("backgroundImage", "url('" + articles[a].img + "')");

            if(articles[a].palette.LightVibrant != null){
                //obj.children(":first").children(":first").css("color", getRGB(articles[a].palette.LightVibrant));
                obj.children(":first").children(".headline").css("background-color", getRGB(articles[a].palette.DarkVibrant));
                
                obj.hover(function(e) { 
                    $(this).children(":first").children(".headline").css("background-color", e.type === "mouseenter" ? "rgba(255, 242, 0, 0.8)":getRGB(articles[a].palette.DarkVibrant)); 
                });
            }

            $("#wrapper").append(obj);
        }
    }
});