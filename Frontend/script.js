$(document).ready(function(){
    $("#content_wrap").hide();
    
    $("#search_btn").click(function(){
        doSearch( $("#search_input").val());
    });

    $("#search_input").keypress(function(e) {
        if(e.which == 13) {
            doSearch($("#search_input").val());
        }
    });

    $.getJSON( "/api/sources/", function( data ) {
        sources = data;        
    });    
});

function doSearch(query){

    $.getJSON("/api/sameheadline/" + query, function( data ) {
        var output = "";

        data = data.splice(0, 35);

        $.each(data, function( key, val ) {
            output += '<a onclick="doSearch(\''+val.word+'\'); $(\'#search_input\').val(\''+val.word+'\');" href="#">' + capitalizeFirstLetter(val.word) + '</a> ';
        });
        
        if(output != "")
        {
            $("#relatedwords_wraper").html(output);
            $("#relatedwords_wrapper_2").show();            
        }
        else
        {
            $("#relatedwords_wrapper_2").hide();            
        }
    });

    $.getJSON("/api/search/" + query, function( data ) {
        var output = '<div class="list-group-item"><h3 class="list-group-item-heading">Articles</h3></div>';
        $.each(data, function( key, val ) {
            output += '<a onclick="onclicksearch(this)" href="' + processUrl(val.url) + '" target="_blank" class="list-group-item">'
                + '<h4 class="list-group-item-heading">' + val.title + '</h4>'
                + '<p class="list-group-item-text">' + sources[val.sourceId].name + ' @ ' + secondsToDate(val.date) + '</p>'
            + '</a>';
        });

        $("#searchcontent_wraper").html('<div class="list-group">' + output + '</div>');
    });

    $.getJSON("/api/popularwordhistory/" + query, function( data ) {   
        if(data.length != 0)
        {
            data = data.splice(0, 30);
            var labels = []; //Todo: Add real labels        
            var yData = [];

            console.log(data);

            for(var i = 0; i < data.length; i++){
                labels.push(daysToDate(data[i].date));
                yData.push(data[i].wightedCount);
            }
            
            var data = {
                labels: labels,
                series: [
                    yData
                ]
            };

            new Chartist.Line('.ct-chart', data);
            $("#history_wrapper").show();            
        }
        else
        {
            $("#history_wrapper").hide();
        }
    });

    $("#content_wrap").show();
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function onclicksearch(what){
    //$(what).css('background-color', 'red');
}

function processUrl(url){
    //console.log(url);
    return url;

    //dail mail /home/index.html
}

function daysToDate(days){
    var now = new Date();

    var a = new Date(days * 24 * 60 * 60 * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear() == now.getFullYear() ? "" : a.getFullYear();
    var month = a.getMonth() == now.getMonth() && a.getFullYear() == now.getFullYear() ? "" : months[a.getMonth()];
    
    var date = a.getDate() == now.getDate() && a.getMonth() == now.getMonth() && a.getFullYear() == now.getFullYear() ? "Today" : a.getDate() + ".";
    
    if(a.getDate() == now.getDate() - 1 && a.getMonth() == now.getMonth() && a.getFullYear() == now.getFullYear())
        date = "Yesterday";
    
    return date + ' ' + month + ' ' + year;
}

function secondsToDate(sec){
    var now = new Date();

    var a = new Date(sec * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear() == now.getFullYear() ? "" : a.getFullYear();
    var month = a.getMonth() == now.getMonth() && a.getFullYear() == now.getFullYear() ? "" : months[a.getMonth()];
    
    var date = a.getDate() == now.getDate() && a.getMonth() == now.getMonth() && a.getFullYear() == now.getFullYear() ? "Today" : a.getDate() + ".";
    
    if(a.getDate() == now.getDate() - 1 && a.getMonth() == now.getMonth() && a.getFullYear() == now.getFullYear())
        date = "Yesterday";

    var hour = a.getHours();
    var min = a.getMinutes();
    //var sec = a.getSeconds();
    return date + ' ' + month + ' ' + year + ' ' + hour + ':' + min;
}