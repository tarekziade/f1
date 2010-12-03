const contextMenu = require("context-menu");
const panels = require("panel");

var sharePanel = panels.add(panels.Panel({
        width: 640,
        height: 320,
        contentURL: "http://linkdrop.caraveo.com:5000/designs/popup/",
        onMessage: function(message) {
          //require("tab-browser").addTab(message);
        }
      }
));

var f1ShareItem = contextMenu.Item({
  label: "Share Page...",
  contentScript: 'on("click", function (node, data) {' +
                 '  postMessage(document.URL);' +
                 '});',
  onMessage: function (documentURL) {
    //for(var i = 0; i < metas.length; i++) {
    //  console.log(metas[i].getAttribute("property"))
    //}
    sharePanel.show();
  }
});
contextMenu.add(f1ShareItem);
