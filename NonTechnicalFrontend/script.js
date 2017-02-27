$.getJSON( "api/somearticles", function( articles ) {
    for(let a in articles){
        let obj = $("<a href='"+articles[a].link.url+"'><div class='article'><span>"+articles[a].title+"</span></div></a>");
        obj.children(":first").css("backgroundImage", "url('"+articles[a].img+"')");

        $("#wrapper").append(obj);
    }
});