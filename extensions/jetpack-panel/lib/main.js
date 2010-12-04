const contextMenu = require("context-menu");
const panels = require("panel");
const data = require("self").data;
const tabs = require("tabs");

var sharePanel = panels.add(panels.Panel({
  width: 640,
  height: 354,
  contentURL: "http://linkdrop.caraveo.com:5000/designs/popup/",
  contentScriptURL: [data.url("panel.js")],
  contentScriptWhen: "ready",
  onMessage: function(message) {
    if (message.indexOf("close:") === 0) {
      sharePanel.hide();
    } else if (message.indexOf("settings:") === 0) {
      sharePanel.hide();
      require("tab-browser").addTab("http://linkdrop.caraveo.com:5000/settings/");
    }
    //else if (message.indexOf("height:") === 0) {
    //    sharePanel.resize(sharePanel.width,
    //                      Number(message.slice("height:".length, message.length)));
    //}
  }
}));

var f1ShareItem = contextMenu.Item({
  label: "Share Page...",
  contentScript: 'on("click", function (node, data) {' +
                 '  postMessage(document.URL);' +
                 '});',
  onMessage: function (documentURL) {
    sharePanel.show();

    var doc = tabs.activeTab.contentDocument;
    var data = { "url" : doc.URL }
    var metas = [];
    try {
      metas = doc.querySelectorAll("meta[name]");
      console.log("metas: " + metas.length);
      for (var i = 0; i < metas.length; i++ ) {
        var prop = metas[i].getAttribute("name");
        data[prop] = metas[i].getAttribute("content");
      }
    } catch (ignore) {}

    try {
      metas = doc.querySelectorAll("meta[property]");
      console.log("metas: " + metas.length);

      for (var i = 0; i < metas.length; i++ ) {
        var prop = metas[i].getAttribute("property")
        if (/^og:/.test(prop))
          prop = prop.replace(/^og:/,"");
        console.log(prop);
        data[prop] = metas[i].getAttribute("content");
      }
    } catch (ignore) {}

    try {
      metas = doc.querySelectorAll("link[rel=image_src]");
      console.log("metas: " + metas.length);

      for (var i = 0; i < metas.length; i++ ) {
        var prop = metas[i].getAttribute("rel")
        console.log(prop);
        data[prop] = metas[i].getAttribute("href");
      }
    } catch (ignore) {}


    console.log("data: " + data);

    sharePanel.postMessage(JSON.stringify(data));
  }
});
contextMenu.add(f1ShareItem);
