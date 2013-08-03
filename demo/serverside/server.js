
var pjs = require("./node.pajama.js");
var http = require("http");

http.createServer(function(request, response) {
  var body = new pjs.element({ tag: "body" });
  body.append({ tag: "div", innerHTML: "Hello World" });

  response.writeHead(200);
  response.write(body.toMarkup());
  response.end();
}).listen(8080);