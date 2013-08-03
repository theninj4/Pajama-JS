  var require = require || null;

  function PjsDataBindingRequest(data) {
    for (var i in data) {
      this[i] = data[i];
    }
  };

  function PjsBindProperty(model, bind, attr, element) {
    if (!model.hasOwnProperty(bind)) {
      model[bind] = "";
    }
    if (model[bind] instanceof Function) {
      var bindingFunction = function(e) { 
        model[bind].call(model, element.getAttr(attr), e); 
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
          return authoritativeElement.getAttr(attr);
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
  };

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
                bindingItem.element.append(bindingItem.func.call({ }, arguments[0]));
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
                bindingItem.element.prepend(bindingItem.func.call({ }, arguments[0]));
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
              bindingItem.element.append(bindingItem.func.call({ }, model[bind][item]));
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
  };

  var elemCount = 0;
  function PjsElement(data) {
    if (!data) data = {};
    if (!data.tag) data.tag = "div";
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
      var children = self.getNodes();
      for (var i=0; i<children.length; i++) {
        children[i].recycle();
      }
      for (var i=0; i<self.garbage.length; i++) {
        self.garbage[i]();
      }
    };
    self.addClass = function(name) { 
      if (name != "") {
        //self.dom.classList.add(name);
        self.dom.className = self.dom.className || "";
        self.dom.className += " "+name;
      }
    };
    self.removeClass = function(name) { 
      if (name != "") {
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
    }
    self.getAttr = function(name) { return self.dom[name]; }
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
    }
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
        markup += " id='"+self.uuid+"'"
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
      for (var i=0; i<data.classes.length; i++) {
        self.addClass(data.classes[i]);
      }
    }
    if (data.contains) {
      var items = data.contains;
      if ((items instanceof Object) && (Object.keys(items).length==1) && (data.forEach)) {
        var key = Object.keys(items)[0];
        PjsBindArray(items[key], key, self, data.forEach);
      } else {
        if (!(items instanceof Array)) items = [ items ];
        for (var i=0; i<items.length; i++) {
          self.append(items[i]);
        }
      }
    };
    for (var i in data) {
      if ( (i!='classes') && (i!='contains') && (i!='tag') && (i!='forEach') ) {
        var attrValue = data[i];
        if (attrValue instanceof Object) {
          var bindingItems = Object.keys(attrValue);
          for (var j=0; j<bindingItems.length; j++) {
            var prop = bindingItems[j];
            PjsBindProperty(attrValue[prop], prop, i, self);
          }
        } else {
          self.setAttr(i, data[i]);
        }
      }
    }
  };  

  var mvc = { };
  var bits = ['model', 'view'];
  for (var i=0; i<bits.length; i++) {
    (function(type) {
      mvc[type] = {
        __pjsDefine: function(name, definition) {
          if (mvc[type].hasOwnProperty(name)) {
            console.log("Duplicate definition found for "+type, name);
            return; 
          }
          mvc[type][name] = definition;
        },
        __pjsCreate: function(name, args) {
          if (!mvc[type].hasOwnProperty(name)) {
            console.error("Dynamic script loader failed to find "+type+":", name);
            return null;
          }
          var args = Array.prototype.slice.call(arguments);
          args.shift();
          var newObj = { };
          if (type == "view") newObj = new PjsElement({ classes: [ 'view.'+name ] });
        
          mvc[type][name].apply(newObj, args);
          return newObj;
        }
      }
    })(bits[i]);
  };