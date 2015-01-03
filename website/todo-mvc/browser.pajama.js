;(function(window) {
  var require = null;

  function PjsDataBindingRequest(data) {
    for (var i in data) {
      this[i] = data[i];
    }
  }

  function PjsBindProperty(model, bind, attr, element) {
    if (model[bind] === undefined) {
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
      var key;
      if ((items instanceof Object) && (Object.keys(items).length==1) && (data.forEach)) {
        key = Object.keys(items)[0];
        PjsBindArray(items[key], key, self, data.forEach);
      } else if ((items instanceof Object) && (Object.keys(items).length==1) && (data.usingView)) {
        key = Object.keys(items)[0];
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

  function scriptLoader(type, name, callback) {
    var newScript = document.createElement('script');
    var path = window.location.pathname.split('/').slice(0,-1).join('/')+'/';
    newScript.src = window.location.origin+path+type+"/"+name+".js";
    console.log("Loading ["+newScript.src+"]");
    newScript.onload = function(event) {
      setTimeout(function() {
        callback();
      }, 0);
    };
    newScript.onerror = function(err) {
      console.error("Failed to load", type, name, newScript.src);
      callback(err);
    };
    document.querySelectorAll('head')[0].appendChild(newScript);
  }
  
  function loadDependencies(container, type, name, callback) {
    if (container.hasOwnProperty(name)) return callback();

    scriptLoader(type, name, function(err) {
      if (err || !container[name]) return callback(err);

      var functionText = container[name].toString();
      var allDeps = [];
      
      ['model', 'view', 'controller', 'service'].forEach(function(type) {
        var deps = functionText.split("pjs."+type+"(");
        for (var i=1; i<deps.length; i++) {
          deps[i] = deps[i].split(")")[0].split(",")[0].replace(/["' ]/g, "");
          allDeps.push({
            container: mvc[type],
            type: type.substring(0,1).toUpperCase()+type.substring(1),
            name: deps[i]
          });
        }
      });
      var otherViewDeps = functionText.split(/usingView: ?["'](.*?)["']/g);
      for (var i=1; i<otherViewDeps.length; i+=2) {
        allDeps.push({
          container: mvc.view,
          type: type.substring(0,1).toUpperCase()+type.substring(1),
          name: otherViewDeps[i]
        });
      }
      
      if (allDeps.length === 0) return callback();
      var loadedDeps = 0;
      allDeps.forEach(function(dep) {
        loadDependencies(dep.container, dep.type, dep.name, function(err) {
          if (err) return callback(err);
          loadedDeps++;
          if (loadedDeps == allDeps.length) {
            return callback();
          }
        });
      });
    });
  }


  var routes = [ ];

  function routeViaController(container, controllerName) {
    if (!mvc.controller[controllerName]) {
      console.error("Controller", controllerName, "was not loaded, can't route");
      return;
    }
    var body = new pjs.element();
    body.dom = container;
    body.clear();
    clearAllEvents();
    var args = Array.prototype.slice.call(arguments);
    args[0] = controllerName;
    args[1] = body;
    mvc.controller.__pjsCreate.apply({ }, args);
    return this;
  }

  function routeViaUrl(container, url, callback) {
    console.log("Routing to [/"+url+"]");
    var matches, noop = function() { };
    for (var i in routes) {
      matches = url.match(routes[i].path);
      if (matches) {
        matches = Array.prototype.slice.call(matches);
        matches[0] = routes[i].controller;
        var extraParams = getHistory(url);
        if (extraParams) {
          matches = matches.concat(extraParams);
        }
        matches.push(callback || noop);
        matches.unshift(container);
        routeViaController.apply({ }, matches);
        return;
      }
    }
    matches = [ container, routes[Object.keys(routes)[0]].controller, callback || noop ];
    routeViaController.apply({ }, matches);
  }

  function saveItem(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
  function loadItem(key) {
    var result = null;
    try { result = JSON.parse(sessionStorage.getItem(key)); } catch(e) { }
    return result;
  }
  function getHistory(url) {
    return history.state;
  }
  function pushHistory(url, args) {
    history.pushState(args, window.title, "#"+url);
  }

  function routeToNewPage(path) {
    var parts = path.split("*");
    args = Array.prototype.slice.call(arguments);
    args.shift();
    var url = "";
    for (var i=0; i<parts.length; i++) {
      url += parts[i];
      if ((i < (parts.length-1)) && (args.length > 0)) {
        url += args.shift();
      }
    }
    pushHistory(url, args);
    window.location.hash = url;
    window.onpopstate();
  }

  function loadDependenciesFromRoutes(callback) {
    if (routes.length === 0) callback();
    var loadedCount = 0;
    routes.forEach(function(route) {
      loadDependencies(mvc.controller, "Controller", route.controller, function(err) {
        if (err) {
          console.error("Failed to load all dependencies for", route, err);
        }
        loadedCount++;
        if (loadedCount == routes.length) callback();
      });
    });
  }

  function defineRoutes(container, routeList, errorHandler) {
    container.innerHTML = '';
    console.log("Initialising...");
    window.onerror = errorHandler;
  
    window.onpopstate = function(event) {
      routeViaUrl(container, window.location.hash.substring(1));
    };

    for (var item in routeList) {
      routeList[item].path = new RegExp("^"+routeList[item].path.replace(/\//g, "\\/").replace(/\*/g, "([^\\/]{0,})"));
      routes.push(routeList[item]);
    }
    
    loadDependenciesFromRoutes(function(err) {
      console.log("Finished Loading Dependencies");
      routeViaUrl(container, window.location.hash.substring(1));
    });
  }

  window.pjs = {
    defineRoutes: defineRoutes,

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

    route: routeToNewPage
  };
})(window);
