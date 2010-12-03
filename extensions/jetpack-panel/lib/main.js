const widgets = require("widget");
const panels = require("panel");
//const data = require("self").data;

widgets.add(widgets.Widget({
  label: "Mozilla F1",
  image: "http://f1.mozillamessaging.com/favicon.png",
  panel: panels.Panel({
    width: 640,
    height: 320,
    contentURL: "http://linkdrop.caraveo.com:5000/designs/popup/",
    //contentScriptURL: [data.url("jquery-1.4.2.min.js"),
    //                   data.url("panel.js")],
    contentScriptWhen: "ready",
    onMessage: function(message) {
      //require("tab-browser").addTab(message);
    }
  })
}));
