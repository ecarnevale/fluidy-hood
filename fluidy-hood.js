/*
* Fluidy-hood
* author: Emanuel Carnevale
* http://github.com/ecarnevale/fluidy-hood
*
* an underground interwho
* aiming at the awesomeness of Hoodwink.d by _why the Lucky Stiff
*
* version 0.00001 a.k.a. Proof of Concept
* PUT and POST on the go
*/

jetpack.future.import("slideBar");
//var fluidDBURL = "http://fluiddb.fluidinfo.com/";
var fluidDBURL = "http://sandbox.fluidinfo.com/";

var initialContent = '<style type="text/css"> \
h4 {font-family: Arial;}</style> \
<h4>Tag along</h4> \
<div id="content"></div>';

//BEGIN FluidDB REST LIB

fluidDB = new Object();

fluidDB.ajax = function(type, url, callback, async_req){
    if(async_req == undefined){
      async_req = true;
    }
    $.ajax({
          async: async_req,
          beforeSend: function(xhrObj){
                  xhrObj.setRequestHeader("Accept","application/json");
          },
          contentType: "application/json",
          type: type,
          url: url,
          processData: true,
          success: callback
    });
}

//END FluidDB REST LIB

// BEGIN SLIDEBAR CREATION
jetpack.slideBar.append({
  width: 250,
  icon: 'http://www.fluidinfo.com/favicon.ico',
  html: initialContent,
  onReady: function(slide) {
    cb = slide;
  },
  onSelect: function(slide) {
    //displayMemos($(slide.contentDocument).find("#content"));
  }
});

// END SLIDEBAR CREATION

function checkAboutPage(pageURL) {
    $(cb.contentDocument).find("#content").empty();
    var query = escape('fluidDB/about="'+pageURL+'"');

    var finalURL = fluidDBURL + "objects?query=" + query;

    fluidDB.ajax("GET",finalURL, function(json){
               var objectID = JSON.parse(json).ids[0];
               if(objectID){
                 cb.notify();
                 var objectURL = fluidDBURL + "objects/" + objectID;
                 fluidDB.ajax("GET", objectURL, function(jsonTags){
                    let tags = JSON.parse(jsonTags);
                    for(let i = 0; i < tags.tagPaths.length; i++){
                        var tagName = tags.tagPaths[i];
                        fluidDB.ajax("GET", fluidDBURL + "objects/" + objectID +"/" + tagName, function(tagValue){
                            //jetpack.notifications.show(i);
                            $(cb.contentDocument).find("#content").append("<p><b>"+ tagName +"</b>: "+tagValue+"</p>");
                        }, false);
                    }
                 });
                 //jetpack.notifications.show(objectID);
               }else{
                 //jetpack.notifications.show("you got nothing, loser...");
               }
    })
}

// BEGIN onReady EVENT

jetpack.tabs.onReady(function() {
  checkAboutPage(this.url);
});

// END onReady EVENT

// BEGIN onFocus EVENT

jetpack.tabs.onFocus(function(){
  checkAboutPage(this.url);
});

// END onFocus EVENT
