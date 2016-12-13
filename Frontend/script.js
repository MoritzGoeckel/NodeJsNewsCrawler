$(document).ready(function(){
    $("#content_wrap").hide();
    $("#search_btn").click(doSearch);
    $("#search_input").keypress(function(e) {
        if(e.which == 13) {
            doSearch();
        }
    });
});

function doSearch()
{
    $.getJSON( "/api/search/" + $("#search_input").val(), function( data ) {
        /*var items = [];
        $.each( data, function( key, val ) {
            items.push( "<li id='" + key + "'>" + val + "</li>" );
        });*/
        
        $("#content").text(data);
    });
    $("#content_wrap").show();
}