// This page scraping script.  It executes inside the context of the tab page
// buidling a page data object which could be posted via postMessage back to
// the add-on

var frag = document.createDocumentFragment();

function unescapeXml(text) {
  return $("<div/>", frag).html(text).text().replace(/\n/,"");
}

function getPageData() {
  var msg = { "url" : document.URL },
      metas;

  try {
    metas = document.querySelectorAll("meta[name]") || [];
    //console.log("meta[name]: " + metas.length);
    for (var i = 0; i < metas.length; i++ ) {
      var prop = metas[i].getAttribute("name");
      //console.log("meta[name=" + prop + "]");
      msg[prop] = unescapeXml(metas[i].getAttribute("content"));
    }
  } catch (err) { console.error(err); }

  try {
    metas = document.querySelectorAll("meta[property]") || [];
    //console.log("meta[property]: " + metas.length);

    for (var i = 0; i < metas.length; i++ ) {
      var prop = metas[i].getAttribute("property").replace(/:/, "_");
      //console.log("meta[property=" + prop + "]");
      msg[prop] = unescapeXml(metas[i].getAttribute("content"));
    }
  } catch (err) { console.error(err); }

  try {
    metas = document.querySelectorAll("link[rel]") || [];
    //console.log("link[rel]: " + metas.length);

    for (var i = 0; i < metas.length; i++ ) {
      var prop = metas[i].getAttribute("rel").replace(/[:\s]/, "_");;
      //console.log("link[" + prop + "]");
      msg[prop] = unescapeXml(metas[i].getAttribute("href"));
    }
  } catch (err) { console.error(err); }

  //Flickr!!!
  try {
    metas = document.querySelectorAll("link[rev=canonical]") || [];
    //console.log("link[rel]: " + metas.length);

    for (var i = 0; i < metas.length; i++ ) {
      var prop = metas[i].getAttribute("id");
      //console.log("link[" + prop + "]");
      msg[prop] = unescapeXml(metas[i].getAttribute("href"));
    }
  } catch (err) { console.error(err); }

  //console.log("msg: " + JSON.stringify(msg));

  return msg;
}
