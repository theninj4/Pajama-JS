  document = { };
  var elemCount = 0;

  document.createElement = function(tag) {
    var nodeList = [ ];
    var classList = [];
    var events = { };
    var newElement = { 
      tagName: tag,
      elemCount: elemCount++,
      classList: {
        add: function(newClass) {
          classList.push(newClass);
        },
        remove: function(oldClass) {
          for (var i=0; i<classList.length; i++) {
            if (classList[i] == oldClass) {
              classList.splice(i, 1);
            }
          }
        },
        contains: function(someClass) {
          for (var i=0; i<classList.length; i++) {
            if (classList[i] == someClass) {
              return true;
            }
          }
          return false;
        }
      },
      addEventListener: function(event, callback) {
        if (!events[event]) events[event] = [];
        events[event].push(callback);
      },
      removeEventListener: function(event, callback) {
        if (!events[event]) return;
        var i = events[event].indexOf(callback);
        if (i >= 0) {
          events[event].splice(i, 1);
        }
      },
      appendChild: function(elem) {
        nodeList.push(elem);
        elem.parentNode = newElement;
        this.firstChild = nodeList[0];
      },
      insertBefore: function(elem, existing) {
        var location = nodeList.indexOf(existing);
        elem.parentNode = this;
        if (location<0) {
          nodeList.unshift(elem);
          return;
        }
        nodeList.splice(location, 0, elem);
        this.firstChild = nodeList[0];
      },
      removeChild: function(elem) {
        for (var i=0; i<nodeList.length; i++) {
          if (nodeList[i] == elem) {
            nodeList.splice(i, 1);
            elem.parentNode = null;
            break;
          }
        }
        this.firstChild = nodeList[0];
      },
      childNodes: nodeList,
      dispatchEvent: function(event) {
        if (events[event.type]) {
          for (var i=0; i<events[event.type].length; i++) {
            events[event.type][i].call({ }, { });
        
          }
        }
        if (this.parentNode) {
          this.parentNode.dispatchEvent(event);
        }
      },
      parentNode: null,
      firstChild: null,
      setAttribute: function(a, b) {
        this[a] = b;
      }
    };
    return newElement;
  };

  document.createEvent = function() {
    return {
      type: "",
      initEvent: function(type, a, b) {
        this.type = type;
      }
    };
  };
  function PjsDataBindingRequest(data) {
    for (var i in data) {
      this[i] = data[i];
    }
  }

  function PjsBindProperty(model, bind, attr, element) {
    if (model[bind] == undefined) {
      model[bind] = "";
    }
    if (model[bind] instanceof Function) {
      var bindingFunction = function(e) { 
        model[bind].call(model, e); 
      };
      element.garbage.push(function() {
        element.removeEvent(attr, bindingFunction);
      });
      element.addEvent(attr, bindingFunction);
      return;
    }
    if (!Object.getOwnPropertyDescriptor(model, bind).hasOwnProperty('get')) {
      var value = model[bind];
      var bindingList = [];
      var authoritativeElement;
      
      Object.defineProperty(model, bind, {
        get: function() {
          return value; //authoritativeElement.getAttr(attr);
        },
        set: function(newValue) {
          if (newValue instanceof PjsDataBindingRequest) {

            authoritativeElement = newValue.element;
            var bindingFunction = function() {
              newValue.element.setAttr(newValue.attr, value);
            };
            var bindingEvent = function(e) {
              if (newValue.element.getAttr(newValue.attr) != value) {
                model[bind] = newValue.element.getAttr(newValue.attr);
              }
            };

            if (newValue.attr instanceof Function) {
              bindingFunction = newValue.attr;
              bindingEvent = function() { };
            } 

            element.garbage.push(function() {
              authoritativeElement = null;
              var i = bindingList.indexOf(bindingFunction);
              if (i >= 0) {
                bindingList.splice(i,1);
              }
              newValue.element.removeEvent("change", bindingEvent);
              newValue.element.removeEvent("keyup", bindingEvent);
              Object.defineProperty(model, bind, { value: value, writable: true });
            });

            bindingList.push(bindingFunction);
            newValue.element.addEvent("change", bindingEvent);
            newValue.element.addEvent("keyup", bindingEvent);

            newValue.element.setAttr(newValue.attr, value);
          } else {
            value = newValue;
            for (var i=0; i<bindingList.length; i++) {
              bindingList[i].call(element, value);
            }
          }
        },
        enumerable: true
      });
    }
    model[bind] = new PjsDataBindingRequest({
      element: element, 
      attr: attr
    });
  }

  function PjsBindArray(model, bind, element, func) {
    if (!model.hasOwnProperty(bind)) {
      model[bind] = [];
    }
    if (!Object.getOwnPropertyDescriptor(model, bind).hasOwnProperty('get')) {
      var value = model[bind];
      var bindingList = [];
      
      Object.defineProperty(model, bind, {
        get: function() {
          var boundArray = value.concat([]);
          Object.defineProperty(boundArray, "pop", {
            value: function() {
              var returnValue = value.pop();
              for (var i=0; i<bindingList.length; i++) {
                var nodes = bindingList[i].element.getNodes();
                nodes[nodes.length-1].remove();
              }
              return returnValue;
            }
          });
          Object.defineProperty(boundArray, "push", {
            value: function() {
              var returnValue = value.push.apply(value, Array.prototype.slice.call(arguments));
              for (var i=0; i<bindingList.length; i++) {
                var bindingItem = bindingList[i];
                var result = bindingItem.func.call({ }, arguments[0]);
                if (result) bindingItem.element.append(result);
              }
              return returnValue;
            }
          });
          Object.defineProperty(boundArray, "reverse", {
            value: function() {
              var returnValue = value.reverse();
              model[bind] = value;
              return returnValue;
             }
          });
          Object.defineProperty(boundArray, "shift", {
            value: function() {
              var returnValue = value.shift();
              for (var i=0; i<bindingList.length; i++) {
                var nodes = bindingList[i].element.getNodes();
                nodes[0].remove();
              }
              return returnValue;
            }
          });
          Object.defineProperty(boundArray, "sort", {
            value: function() {
              var returnValue = value.sort.apply(value, Array.prototype.slice.call(arguments));
              model[bind] = value;
              return returnValue;
            }
          });
          Object.defineProperty(boundArray, "splice", {
            value: function() {
              var returnValue = value.splice.apply(value, Array.prototype.slice.call(arguments));
              model[bind] = value;
              return returnValue;
            }
          });
          Object.defineProperty(boundArray, "unshift", {
            value: function() {
              var returnValue = value.unshift.apply(value, Array.prototype.slice.call(arguments));
              for (var i=0; i<bindingList.length; i++) {
                var bindingItem = bindingList[i];
                var result = bindingItem.func.call({ }, arguments[0]);
                if (result) bindingItem.element.prepend(result);
              }
              return returnValue;
            }
          });
          return boundArray;
        },
        set: function(newValue) {
          if (newValue instanceof PjsDataBindingRequest) {
            bindingList.push({ element: newValue.element, func: newValue.func });
          } else {
            value = newValue;
          }
          for (var i=0; i<bindingList.length; i++) {
            var bindingItem = bindingList[i];
            bindingItem.element.clear();
            for (var item in value) {
              var result = bindingItem.func.call({ }, model[bind][item]);
              if (result) bindingItem.element.append(result);
            }
          }
        },
        enumerable: true
      });
    }
    model[bind] = new PjsDataBindingRequest({
      element: element, 
      func: func
    });
  }

  var elemCount = 0;
  function PjsElement(data) {
    if (!data) data = {};
    if (!data.tag) data.tag = "div";
    var i;
    var elem = document.createElement(data.tag);
    var self = this;
    self.dom = elem;
    self.eventList = [];
    self.garbage = [];

    elem._view = self;
    self.uuid = elemCount++;
    
    self.prepend = function(arg1) { 
      var args = arg1;
      if (!(args instanceof Array)) args = Array.prototype.slice.call(arguments);
      for (var i=0; i<args.length; i++) {
        var child = args[i];
        if (child instanceof PjsElement) {
          self.dom.insertBefore(child.dom, self.dom.firstChild); 
          if (require) self.fireEvent("PjsChange", { type: "prepend", parent: self.uuid, markup: child.toMarkup(true) });
        } else {
          self.prepend(new PjsElement(child));
        }
      }
    };
    self.append = function(arg1) { 
      var args = arg1;
      if (!(args instanceof Array)) args = Array.prototype.slice.call(arguments);
      for (var i=0; i<args.length; i++) {
        var child = args[i];
        if (child instanceof PjsElement) {
          self.dom.appendChild(child.dom); 
          if (require) self.fireEvent("PjsChange", { type: "append", parent: self.uuid, markup: child.toMarkup(true) });
        } else {
          self.append(new PjsElement(child));
        }
      }
    };
    self.remove = function(noEvent) {
      if (require && !noEvent) {
        self.fireEvent("PjsChange", { type: "remove", parent: self.dom.parentNode._view.uuid, child: self.uuid });
      }
      self.dom.parentNode.removeChild(self.dom);
      self.recycle();
    };
    self.recycle = function() {
      var i, children = self.getNodes();
      for (i=0; i<children.length; i++) {
        children[i].recycle();
      }
      for (i=0; i<self.garbage.length; i++) {
        self.garbage[i]();
      }
    };
    self.addClass = function(name) { 
      if (name !== "") {
        //self.dom.classList.add(name);
        self.dom.className = self.dom.className || "";
        self.dom.className += " "+name;
      }
    };
    self.removeClass = function(name) { 
      if (name !== "") {
        //self.dom.classList.remove(name); 
        self.dom.className = (" "+self.dom.className+" ").replace(" "+name+" ", "");
      }
    };
    self.hasClass = function(name) { 
      //return self.dom.classList.contains(name); 
      return (" "+self.dom.className+" ").indexOf(" "+name+" ") != -1;
    };
    self.setAttr = function(attr, value) { 
      if ((typeof attr == "string") && (self.dom[attr] != value)) {
        self.dom[attr] = value; self.dom.setAttribute(attr, value); 
        if (require) self.fireEvent("PjsChange", { type: "attr", id: self.uuid, attr: attr, value: value });
      }
    };
    self.getAttr = function(name) { return self.dom[name]; };
    self.addEvent = function(name, callback) {
      self.dom.addEventListener(name, callback);
      if (self.eventList.indexOf(name) == -1) self.eventList.push(name);
    };
    self.removeEvent = function(name, callback) {
      self.dom.removeEventListener(name, callback);
    };
    self.setValue = function(value) { 
      if (['input','select'].indexOf(self.dom.tagName.toLowerCase()) != -1) {
        self.dom.value = value;
      } else {
        self.dom.innerHTML = value;
      }
    };
    self.getValue = function() {
      return self.dom.value || self.dom.innerHTML;
    };
    self.clear = function() {
      var len = self.dom.childNodes.length;
      for (var i=0; i<len; i++) {
        self.dom.childNodes[0]._view.remove(true);
      }
      if (require) self.fireEvent("PjsChange", { type: "clear", parent: self.uuid });
      return self;
    };
    self.fireEvent = function(name, detail) {
      var tmp = document.createEvent("HTMLEvents");
      tmp.initEvent(name, true, true );
      tmp.detail = detail;
      self.dom.dispatchEvent(tmp);
      return self;
    };
    self.getNodes = function() {
      var nodes = [];
      for (var i=0; i<self.dom.childNodes.length; i++) {
        var dom = self.dom.childNodes[i];
        if (dom._view) {
          nodes.push(dom._view);
        } else {
          var newWrapper = new PjsElement();
          newWrapper.dom = dom;
          nodes.push(newWrapper);
        }
      }
      return nodes;
    };
    self.getByUuid = function(uuid) {
      if (self.uuid == uuid) return self;
      for (var i=0; i<self.dom.childNodes.length; i++) {
        var tmp = self.dom.childNodes[i]._view.getByUuid(uuid);
        if (tmp) return tmp;
      }
      return null;
    };
    self.toMarkup = function(inverted) {
      var markup = "<"+self.dom.tagName;
      for (var attr in self.dom) {
        if (['tagName', 'elemCount', 'classList', 'addEventListener', 'appendChild',
             'removeChild', 'childNodes', 'dispatchEvent', '_view', 'parentNode'].indexOf(attr) < 0) {
          if ((typeof self.dom[attr] == "string") || (typeof self.dom[attr] == "number")) {
            markup += ' '+attr+'="'+self.dom[attr]+'"';
          }
        }
      }
      if (inverted) {
        markup += " id='"+self.uuid+"'";
        for (var e in self.eventList) {
          var eventName = self.eventList[e];
          markup += ' on'+eventName+'="dispatch(\''+self.uuid+'\', \''+eventName+'\', event)" ';
        }
      }
      markup += ">";
      if (self.dom.innerHTML) {
        markup += self.dom.innerHTML;
      }
      for (var elem in self.dom.childNodes) {
        markup += self.dom.childNodes[elem]._view.toMarkup(inverted);
      }
      return markup+"</"+self.dom.tagName+">";
    };

    if (data.classes) {
      for (i=0; i<data.classes.length; i++) {
        self.addClass(data.classes[i]);
      }
    }
    if (data.contains) {
      var items = data.contains;
      if ((items instanceof Object) && (Object.keys(items).length==1) && (data.forEach)) {
        var key = Object.keys(items)[0];
        PjsBindArray(items[key], key, self, data.forEach);
      } else if ((items instanceof Object) && (Object.keys(items).length==1) && (data.usingView)) {
        var key = Object.keys(items)[0];
        PjsBindArray(items[key], key, self, function(someItem) {
          mvc.view[data.usingView].apply(self, [ someItem ]);
        });
      } else {
        if (!(items instanceof Array)) items = [ items ];
        for (i=0; i<items.length; i++) {
          self.append(items[i]);
        }
      }
    }
    if (data.className) {
      Object.keys(data.className).forEach(function(propertyName) { 
        var oldValue = data.className[propertyName][propertyName];
        self.addClass(oldValue);
        PjsBindProperty(data.className[propertyName], propertyName, function(value) {
          if (value != oldValue) {
            self.removeClass(oldValue);
            self.addClass(value);
            oldValue = value;
          }
        }, self);
      });
    }
    for (i in data) {
      if (['classes','contains','tag','forEach','className'].indexOf(i) === -1) {
        var val = data[i];
        if (val instanceof Object) {
          var bindingItems = Object.keys(val);
          for (var j=0; j<bindingItems.length; j++) {
            var prop = bindingItems[j];
            PjsBindProperty(val[prop], prop, i, self);
          }
        } else {
          self.setAttr(i, data[i]);
        }
      }
    }
  }

  var tempEventQueue = {};
  var longEventQueue = {};

  function triggerEvent(event, obj) {
    var hitCount=0;
    if (tempEventQueue.hasOwnProperty(event)) {
      var processable = tempEventQueue[event];
      tempEventQueue[event] = [];
      processable.forEach(function(callback) {
        setTimeout(function() { callback(obj); }, 0);
      });
    }
    if (longEventQueue.hasOwnProperty(event)) {
      longEventQueue[event].forEach(function(callback) {
        setTimeout(function() { callback(obj); }, 0);
      });
    }
    //if (hitCount==0) console.warn("Unhandled event dispatched", event, obj, (new Error()).stack);
  }

  function eventWaitAll(event, callback) {
    if (!longEventQueue.hasOwnProperty(event)) {
      longEventQueue[event] = [];
    }
    longEventQueue[event].push(callback);

    return {
      terminate: function() {
        var i = longEventQueue[event].indexOf(callback);
        if (i >= 0) {
          longEventQueue[event].splice(i, 1);
        }
      }
    };
  }

  function eventWaitOnce(event, callback) {
    if (!tempEventQueue.hasOwnProperty(event)) {
      tempEventQueue[event] = [];
    }
    tempEventQueue[event].push(callback);

    return {
      terminate: function() {
        var i = tempEventQueue[event].indexOf(callback);
        if (i >= 0) {
          tempEventQueue[event].splice(i, 1);
        }
      }
    };
  }
  
  function clearAllEvents() {
    tempEventQueue = {};
    longEventQueue = {};
  }

  var mvc = { };
  var bits = ['model', 'view', 'controller'];
  bits.forEach(function(type) {
    mvc[type] = {
      __pjsDefine: function(name, definition) {
        if (mvc[type].hasOwnProperty(name)) {
          console.log("Duplicate definition found for "+type, name);
          return; 
        }
        mvc[type][name] = definition;
      },
      __pjsCreate: function(name) {
        if (!mvc[type].hasOwnProperty(name)) {
          console.error("Dynamic script loader failed to find "+type+":", name);
          return null;
        }
        
        var args = Array.prototype.slice.call(arguments);
        args.shift();
        var constructor = mvc[type][name];

        if (type == "view") {
          var newObj = new PjsElement({ classes: [ 'view.'+name ] });
          constructor.apply(newObj, args);
          return newObj;
        }
        args.unshift(null);
        return new (constructor.bind.apply(constructor, args))();
      }
    };
  });

  // var oneEm = new $Element({ tag: 'a' });
  // oneEm.setText("M");
  // $Dom("body").append(oneEm);
  // var pxPerEm = oneEm.dom.offsetWidth;
  var pxPerEm = 16;
  
  function getCssRule(selector, second) {
    if (selector.substring(0,1) == "@") {
      return {
        style: { }
      };
    }
    for (var i=0; i<document.styleSheets.length; i++) {
      var someStyleSheet = document.styleSheets[i];
      for (var j=0; j<someStyleSheet.cssRules.length; j++) {
        if (someStyleSheet.cssRules[j].selectorText == selector) {
          return someStyleSheet.cssRules[j];
        }
      }
    }
    if (second) {
      console.error("Failed to create rule for", selector);
      return {
        style: { }
      };
    }
    if (document.styleSheets[0].addRule) {
      document.styleSheets[0].addRule(selector, "dummy: default");
    } else {
      document.styleSheets[0].insertRule(selector+"{ dummy: default }", document.styleSheets[0].length);
    }
    return getCssRule(selector, true);
  }
  
  function addCssRule(cssRule, property, value) {
    var parts = value.split(" ");
    for (var i=0; i<parts.length; i++) {
      var p = parts[i];
      if ((""+p).match("^[0-9]{1,}px")) {
        p = (""+p);
        p = parseInt(p.substring(0, p.length-2), 10);
        p = p / pxPerEm;
        p = p + "em";
        parts[i] = p;
      }
    }
    value = parts.join(" ");
    cssRule.style[property] = value;
  }
  
  function pxToEm(p) {
    return p / pxPerEm;
  }
  
  function loadStyles(rules) {
    var property;
    for (var selector in rules) {
      if ((selector.substring(0,1) == "@") || (selector.substring(0,2) == "::")) {
        var tmp = document.createElement('style');
        tmp.type = "text/css";
        document.querySelectorAll('head')[0].appendChild(tmp);
        var txt = "";
        for (property in rules[selector]) {
          txt += property+": "+rules[selector][property]+"; ";
        }
        tmp.appendChild(document.createTextNode(selector+" { "+txt+" }"));
      } else {
        var cssRule = getCssRule(selector);
        for (property in rules[selector]) {
          addCssRule(cssRule, property, rules[selector][property]);
        }
      }
    }
  }
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
    if (!options.nativeApp) {
      console.log("Starting pjs server on", hostUrl);
    }
    
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
    var connectionCount = 0;

    io.sockets.on('connection', function (socket) {
      if (options.nativeApp && connectionCount) {
        process.exit(0);
      }
      connectionCount++;
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
      });

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
        if (options.nativeApp) {
          process.exit(0);
        }
      });
    });
  }

  function nativeApp(options, routes) {
    startServer({ 
      host: "localhost", 
      port: 46240, 
      nativeApp: true,
    }, [ { url: '/nativeApp', controller: options.main } ]);
    var args = [
      '--app=http://localhost:46240/nativeApp',
      '--app-window-size='+(options.width || 700)+','+(options.height || 500),
      '--user-data-dir=./tmp'
    ];
    require('child_process').spawn('google-chrome', args);
  }

  module.exports = {
    startServer: startServer,
    nativeApp: nativeApp,

    defineModel: mvc.model.__pjsDefine,
    defineView: mvc.view.__pjsDefine,
    defineController: mvc.controller.__pjsDefine,

    element: PjsElement,
    model: mvc.model.__pjsCreate,
    view: mvc.view.__pjsCreate,
    controller: mvc.controller.__pjsCreate,

    eventWaitAll: eventWaitAll,
    eventWaitOnce: eventWaitOnce,
    triggerEvent: triggerEvent,
  };
