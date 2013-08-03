
var pjs = require("./node.pajama.js");
var UI = require("./UI.js");


var mainController = function(body) {
  body.append(new pjs.view("Loading"));

  setTimeout(function() {
    var model = new pjs.model("LibraryModel");
    var view = new pjs.view("LibraryView", model);
    body.clear();
    body.append(view);
  }, 1000);
  
};

var catchAll = function(body) {
  var view = new pjs.view("ErrorView");
  body.append(view);
};


pjs.startServer({
  host: "localhost",
  port: 8080
}, [
  { url: '/index', controller: mainController },
  { url: '/error', controller: catchAll },
]);
