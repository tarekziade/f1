const contextMenu = require("context-menu");
const pageMod = require("page-mod");
const widgets = require("widget");
const panel = require("panel");
const data = require("self").data;
const tabs = require("tabs");

var sharePanel = panel.Panel({
  width: 640,
  height: 354,
  contentURL: "http://linkdrop.caraveo.com:5000/designs/popup/",
  contentScriptFile: [data.url("panel.js")],
  contentScriptWhen: "ready",
  onMessage: function(data) {
    //console.log("sharePanel.onMessage: " + data);
    message = JSON.parse(data);
    if (message.action == "close") {
      sharePanel.hide();
    } else if (message.action == "settings") {
      sharePanel.hide();
      require("tab-browser").addTab("http://linkdrop.caraveo.com:5000/settings/");
    }
    //else if (message.indexOf("height:") === 0) {
    //    sharePanel.resize(sharePanel.width,
    //                      Number(message.slice("height:".length, message.length)));
    //}
  }
});

//Always data mine every page for the possible share data and push that data into
// the share panel.
// XXX This might have consiquences when we try to show more than one share panel
pageMod.PageMod({
  include: ["*"],
  contentScriptFile: [data.url("jquery-1.4.2.min.js"), data.url("page.js")],
  contentScriptWhen: 'ready',
  contentScript: ["postMessage(getPageData());"],
  onAttach: function onAttach(worker) {
    worker.on('message', function(data) {
      //console.log("worker: " + JSON.stringify(data));
      //Workers are attached to every page load and we only want the main page
      if (tabs.activeTab.url == data.url) {
        if (!("og_image" in data) && !("image_src" in data)) {
          data.image = tabs.activeTab.getThumbnail();
        }
        sharePanel.postMessage(data);
      }
    });
  }
});


exports.main = function(options, callbacks) {

  contextMenu.Item({
    label: "Share Page...",
    contentScript: "on('click', function(node, data) { " +
                   "  postMessage(document.URL); " +
                   "});",
    onMessage: function (URL) {
      sharePanel.show();
    }
  });

  widgets.Widget({
    label: "Mozilla F1",
    contentURL: "http://f1.mozillamessaging.com/favicon.png",
    panel: sharePanel
  });

  //callbacks.quit();
};
