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

//BEGIN FluidDB REST LIB

fluidDB = new Object();

fluidDB.ajax = function(type, url, payload, callback, async_req){
    if(async_req == undefined){
      async_req = true;
    }
    $.ajax({
          async: async_req,
          beforeSend: function(xhrObj){
                  xhrObj.setRequestHeader("Accept","application/json");
                  xhrObj.setRequestHeader("Content-Type","application/json");
          },
          contentType: "application/json",
          type: type,
          url: url,
          data: payload,
          processData: false,
          success: callback
    });
}

//END FluidDB REST LIB

function createNewTag(name,value){
  return "<p><b>"+ name +"</b>: "+value+"</p>";
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

// BEGIN SLIDEBAR CREATION
jetpack.slideBar.append({
  width: 250,
  persist: true,
  icon: 'http://www.fluidinfo.com/favicon.ico',
  onReady: function(slide) {
		// Creates a new object for the current url when the user clicks on the button
		$("#createObjButton", slide.contentDocument).click(function () {
			var pageURL = jetpack.tabs.focused.url;
			fluidDB.ajax("POST",fluidDBURL + "objects", '{about : "'+pageURL+'"}', function(json){
        //TODO extract tags function from checkAboutPage saving in this way a GET ;)
        //checkAboutPage(pageURL);
				jetpack.notifications.show(json);
      });
		});
		cb = slide;
  },
  onSelect: function(slide) {
    //displayMemos($(slide.contentDocument).find("#content"));
  },
  html: <>
    <style><![CDATA[
      body {
        font-family: sans-serif;
        font-size:   10pt;
        overflow-x:  hidden;
      }
      div.tag {
        background-color:   rgba(255, 255, 255, 0.3);
        position:           relative;
        padding:            0.3em 6px;
        margin:             0.75em 10px 0.75em 0;
        -moz-border-radius: 5px;
        cursor:             pointer;
      }
      div.tag.focused, div.tag.focusedClosing {
        background-color: rgba(255, 255, 255, 0.8);
        font-weight:      bold;
        margin-right:    -20px;
        padding-right:    30px;
      }
      div.tag:hover {
        background-color: rgba(255, 255, 255, 0.6);
      }
      div.tag.focused:hover, div.tag.focusedClosing:hover {
        background-color: rgba(255, 255, 255, 0.9);
      }
      img.favicon {
        width:       16px;
        height:      16px;
        position:    absolute;
        top:         50%;
        float:       left;
        margin-top: -8px;
        opacity:     0.7;
      }
      div.tag:hover img.favicon,
      div.tag.focused img.favicon,
      div.tag.focusedClosing img.favicon {
        opacity: 1;
      }
      div.title {
        margin-left: 24px;
      }
      img.closeButton {
        display: none;
      }
      div.tag:hover img.closeButton {
        display:   block;
        position:  absolute;
        top:      -5px;
        right:    -5px;
      }
      div.tag.focused:hover img.closeButton {
        right: 25px;
      }
    ]]></style>
    <body><h4>Tag along</h4>
      <div id="tabList"></div>
			<div id="createObjButton" style="display:none">Create an object for this page</div>
			<div id="content"></div>
		</body>
  </>
});

// END SLIDEBAR CREATION


function makeTagWidget(tagName, tagValue) {
	var tagWidget = $("<div />", cb.contentDocument.body);
  tagWidget.addClass("tag");
  var name = $("<div />", cb.contentDocument.body);
  name.addClass("tagname");
  name.text(tagName);
  tagWidget.append(name);
  var value = $("<div />", cb.contentDocument.body);
  value.addClass("tagvalue");
  value.addClass("show");
  value.text(tagValue);
  tagWidget.append(value);
  var editValue = $("<div />", cb.contentDocument.body);
  editValue.addClass("tageditvalue");
  editValue.addClass("show");
  editValue.attr("style", "display:none;");
  editValue.text(tagValue);
  tagWidget.append(editValue);
  return tagWidget;
}

function checkAboutPage(pageURL) {
    $(cb.contentDocument).find("#content").empty();
    var query = escape('fluidDB/about="'+pageURL+'"');

    var finalURL = fluidDBURL + "objects?query=" + query;

    fluidDB.ajax("GET",finalURL, {}, function(json){
               var objectID = JSON.parse(json).ids[0];
               if(objectID){
								 $(cb.contentDocument).find("#createObjButton").hide();
                 cb.notify();
                 var objectURL = fluidDBURL + "objects/" + objectID;
                 fluidDB.ajax("GET", objectURL, {}, function(jsonTags){
                    let tags = JSON.parse(jsonTags);
                    for(let i = 0; i < tags.tagPaths.length; i++){
                        var tagName = tags.tagPaths[i];
                        fluidDB.ajax("GET", fluidDBURL + "objects/" + objectID +"/" + tagName, {}, function(tagValue){
                            //jetpack.notifications.show(i);
                            //$(cb.contentDocument).find("#content").append("<p><b>"+ tagName +"</b>: "+tagValue+"</p>");
                            var newTag = makeTagWidget(tagName,tagValue);
                            newTag.appendTo($(cb.contentDocument).find("#content"));
                        }, false);
                    }
                 });
                 //jetpack.notifications.show(objectID);
               }else{
                 //jetpack.notifications.show("you got nothing, loser...");
								 $(cb.contentDocument).find("#createObjButton").show();
               }
    })
}


