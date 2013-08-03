  var bootstrapper = function() {
    var socket = io.connect('http://---');

    socket.on('fullPage', function (newMarkup) {
      document.body.innerHTML = newMarkup;
    });

    socket.on('updateDom', function(data) {
      for (var i=0; i<data.length; i++) {
        var thisChange = data[i];
        if (thisChange.type == "attr") {
          var target = document.getElementById(thisChange.id);
          if (target) {
            target[thisChange.attr] = thisChange.value;
          }
        } else if (thisChange.type == "append") {
          var tmp = document.createElement('div');
          tmp.innerHTML= thisChange.markup;
          var target = document.getElementById(thisChange.parent);
          if (target) {
            target.appendChild(tmp.firstChild);
          }
        } else if (thisChange.type == "prepend") {
          var tmp = document.createElement('div');
          tmp.innerHTML= thisChange.markup;
          var target = document.getElementById(thisChange.parent);
          if (target) {
            target.insertBefore(tmp.firstChild, target.firstChild);  
          }
        } else if (thisChange.type == "remove") {
          var parent = document.getElementById(thisChange.parent);
          var child = document.getElementById(thisChange.child);
          if (parent) {
            parent.removeChild(child);
          }
        } else if (thisChange.type == "clear") {
          var parent = document.getElementById(thisChange.parent);
          if (parent) {
            parent.innerHTML = "";
          }
        }
      }
    });

    socket.on('loading', function() {
      document.body.innerHTML = "";
    });

    socket.emit('pageLoad', window.location.pathname + window.location.search);

    function dispatch(id, type, event) {
      var newEvent = { };
      for (var attr in event) {
        if ((typeof event[attr] == "string") || (typeof event[attr] == "number")) {
          newEvent[attr] = event[attr];
        }
      }
      socket.emit('action', { id: id, type: type, value: event.srcElement.value, content: event.srcElement.innerHTML });
    }
  };

  function startServer(options, routes) {
    var hostUrl = options.host+":"+options.port;
    console.log("Starting pjs server on", hostUrl);
    
    for (var i in routes) {
      routes[i].url = new RegExp("^"+routes[i].url.replace(/\//g, "\\/").replace(/\*/g, "([^\\/]{0,})"));
    }

    var bootstrapperText = bootstrapper.toString().replace("---", hostUrl);
    bootstrapperText = bootstrapperText.substring(13, bootstrapperText.length-1);

    var app = require("http").createServer(function(req, res) {
      res.writeHead(200);
      res.end('<html><head><script src="/socket.io/socket.io.js"></script><script>'+
              bootstrapperText+'</script></head><body></body></html>');
    });
    var io = require('socket.io').listen(app, { log: false });
    io.set('transports', [
      'websocket',
      'htmlfile',
      'xhr-polling',
      'jsonp-polling'
    ]);
    io.enable('browser client minification');
    io.enable('browser client etag');
    io.enable('browser client gzip');
    app.listen(options.port);

    io.sockets.on('connection', function (socket) {
      var body = new PjsElement();
      body.dom = document.createElement("div");

      var updateDomTimeout;
      var changeList = [];
      body.dom.parentNode = {
        dispatchEvent: function(event) {
          if (event.type == 'PjsChange') {
            changeList.push(event.detail);
            if (updateDomTimeout) clearTimeout(updateDomTimeout);
            updateDomTimeout = setTimeout(function() {
              socket.emit('updateDom', changeList);
              changeList = [];
            }, 100);
          }
        }
      };

      socket.on('pageLoad', function (url) {
        var controller = routes[routes.length-1].controller;
        for (i in routes) {
          if (url.match(routes[i].url)) {
            controller = routes[i].controller;
            break;
          }
        }
        body.clear();
        socket.emit('fullPage', body.toMarkup(true));
        var request = {
          headers: socket.handshake.headers,
          address: socket.handshake.address,
          url: url
        };
        controller.call({ }, body, request);
      });

      socket.on('sync', function() {
        socket.emit('fullPage', body.toMarkup(true));
      })

      socket.on('action', function(data) {
        if (!data || !data.id || !data.type || !(data.value || data.content)) {
          return;
        }
        var elem = body.getByUuid(data.id);
        if (!elem) {
          console.log("--------");
          console.log("Couldn't perform action:", data);
          console.log(body.toMarkup(true));
          return;
        }
        if (elem.tag != "button") {
          elem.setValue(data.value || data.content);
        }
        elem.fireEvent(data.type);
      });

      socket.on('disconnect', function() {
        body.clear();
        body = null;
      });
    });
  };

module.exports = {
  defineModel: mvc.model.__pjsDefine,
  defineView: mvc.view.__pjsDefine,
  element: PjsElement,
  model: mvc.model.__pjsCreate,
  view: mvc.view.__pjsCreate,
  startServer: startServer
};
