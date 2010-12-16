// This is a content script.  It executes inside the context of the F1 page
// loaded into the panel and has access to that page's window object and other
// global objects (although the page does not have access to globals defined by
// this script unless they are explicitly attached to the window object).
//
// This content script is injected into the context of the F1 page
// by the Panel API, which is accessed by the main add-on script in lib/main.js.
// See that script for more information about how the panel is created.

$("span.close").click(function (event) {
  // Intercept the click, passing it to the addon
  event.stopPropagation();
  event.preventDefault();
  postMessage({"action": "close"});
});
$("a.configureToggle").click(function (event) {
  // Intercept the click, passing it to the addon
  event.stopPropagation();
  event.preventDefault();
  postMessage({"action": "settings"});
});
//postMessage("height:" + document.body.offsetHeight);

on('message', function(data) {
  //console.log("panel.js:on(message): " + JSON.stringify(data));

  var metas = data;
  $(".pageTitle").text(metas.og_title || metas.title || "");
  $(".pageDescription").text(metas.og_description || metas.description || "");
  $("img.thumb").attr("src", metas.og_image || metas.image || metas.image_src || "");

});

//switch (prop) {
//  case "title":
//    $(".pageTitle").text($().attr("content"));
//  break;
//  case "description":
//    $(".pageDescription").text($(metas[i]).attr("content"));
//  break;
//}

