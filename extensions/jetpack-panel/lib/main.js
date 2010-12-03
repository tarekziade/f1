const contextMenu = require("context-menu");
const panels = require("panel");
const data = require("self").data;

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
  }
});
contextMenu.add(f1ShareItem);
