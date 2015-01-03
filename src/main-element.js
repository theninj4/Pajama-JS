
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
