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

    $.getJSON( "/api/popularwords/", function( data ) {
        let output = "";
         $.each(data, function( index ) {
            //console.log(index);
            if(index < 60)
                output += '<a class="wordlink" onclick="doSearch(\''+data[index].word+'\'); $(\'#search_input\').val(\''+data[index].word+'\');" href="#">' + capitalizeFirstLetter(data[index].word) + '</a> ';
        });
        $("#popular_words").html(output);       
    }); 
});

function doSearch(query){

    $("#relatedwords_wrapper_2").hide();  // to remove
    /*$.getJSON("/api/sameheadline/" + query, function( data ) {
        let output = "";

        data = data.splice(0, 35);

        $.each(data, function( key, val ) {
            output += '<a class="wordlink" onclick="doSearch(\''+val.word+'\'); $(\'#search_input\').val(\''+val.word+'\');" href="#">' + capitalizeFirstLetter(val.word) + '</a> ';
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
    });*/

    $.getJSON("/api/sameheadline/" + query + "/" + getDateToday(), function( data ) {
        let output = "";

        data = data.splice(0, 35);

        $.each(data, function( key, val ) {
            output += '<a class="wordlink" onclick="doSearch(\''+val.word+'\'); $(\'#search_input\').val(\''+val.word+'\');" href="#">' + capitalizeFirstLetter(val.word) + '</a> ';
        });
        
        if(output != "")
        {
            $("#relatedwords_today_wraper").html(output);
            $("#relatedwords_today_wrapper_2").show();            
        }
        else
        {
            $("#relatedwords_today_wrapper_2").hide();            
        }
    });

    $.getJSON("/api/search/" + query, function( data ) {
        let output = '<div class="list-group-item"><h3 class="list-group-item-heading">Articles</h3></div>';
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
            let sortedData = data.sort(function(a, b){return a.date - b.date});            
            sortedData = sortedData.splice(0, 30);

            let labels = [];      
            let yData = [];

            for(let i = 0; i < sortedData.length; i++){
                labels.push(daysToDate(sortedData[i].date));
                yData.push(sortedData[i].wightedCount);
            }
            
            let chartInput = {
                labels: labels,
                series: [
                    yData
                ]
            };

            new Chartist.Line('.ct-chart', chartInput);
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

    if(url.startsWith("http://www.dailymail.co.uk"))
        url = url.replace("/home/index.html", "");

    return url;

    //dail mail /home/index.html
}

function daysToDate(days){
    let now = new Date();

    let a = new Date(days * 24 * 60 * 60 * 1000);
    let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let year = a.getFullYear() == now.getFullYear() ? "" : a.getFullYear();
    let month = a.getMonth() == now.getMonth() && a.getFullYear() == now.getFullYear() ? "" : months[a.getMonth()];
    
    let date = a.getDate() == now.getDate() && a.getMonth() == now.getMonth() && a.getFullYear() == now.getFullYear() ? "Today" : a.getDate() + ".";
    
    if(a.getDate() == now.getDate() - 1 && a.getMonth() == now.getMonth() && a.getFullYear() == now.getFullYear())
        date = "Yesterday";
    
    return date + ' ' + month + ' ' + year;
}

function secondsToDate(sec){
    let now = new Date();

    let a = new Date(sec * 1000);
    let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let year = a.getFullYear() == now.getFullYear() ? "" : a.getFullYear();
    let month = a.getMonth() == now.getMonth() && a.getFullYear() == now.getFullYear() ? "" : months[a.getMonth()];
    
    let date = a.getDate() == now.getDate() && a.getMonth() == now.getMonth() && a.getFullYear() == now.getFullYear() ? "Today" : a.getDate() + ".";
    
    if(a.getDate() == now.getDate() - 1 && a.getMonth() == now.getMonth() && a.getFullYear() == now.getFullYear())
        date = "Yesterday";

    let hour = a.getHours();
    let min = a.getMinutes();
    //let sec = a.getSeconds();
    return date + ' ' + month + ' ' + year + ' ' + hour + ':' + min;
}

function getDateToday(){
    return Math.floor(Date.now() / 1000 / 60 / 60 / 24)
}