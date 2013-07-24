;(function(window) {


  function PjsDataBindingRequest(element, attr, func) {
    this.element = element;
    this.attr = attr;
    this.func = func;
  };

  function PjsBindProperty(model, bind, attr, element) {
    if (!model.hasOwnProperty(bind)) {
      model[bind] = "";
    }
    if (model[bind] instanceof Function) {
      element.addEvent(attr, function(e) { 
        model[bind].call(model, element.getAttr(attr), e); 
      });
      return;
    }
    if (!Object.getOwnPropertyDescriptor(model, bind).hasOwnProperty('get')) {
      var value = model[bind];
      var bindingList = [];
      
      Object.defineProperty(model, bind, {
        get: function() {
          return value;
        },
        set: function(newValue) {
          if (newValue instanceof PjsDataBindingRequest) {
            if (newValue.func) {
              bindingList.push(newValue.rowGenerator);
            } else if (newValue.attr instanceof Function) {
              bindingList.push(newValue.attr);
            } else {
              bindingList.push(function() {
                newValue.element.setAttr(newValue.attr, value);
              });
              newValue.element.setAttr(newValue.attr, value);
              newValue.element.addEvent("change", function(e) {
                model[bind] = newValue.element.getAttr(newValue.attr);
              });
              newValue.element.addEvent("keyup", function(e) {
                if (newValue.element.getAttr(newValue.attr) != value) {
                  model[bind] = newValue.element.getAttr(newValue.attr);
                }
              });
            }
            newValue.element.addClass("pjs.bind."+bind);
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
    model[bind] = new PjsDataBindingRequest(element, attr);
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
    model[bind] = new PjsDataBindingRequest(element, null, func);
  };  
  function PjsElement(data) {
    if (!data) data = {};
    if (!data.tag) data.tag = "div";
    var elem = document.createElement(data.tag);
    var self = this;
    self.dom = elem;
    self.eventList = [];
    elem._view = self;
    
    self.prepend = function(child) { 
      if (child instanceof PjsElement) {
        self.dom.insertBefore(child.dom, self.dom.firstChild); 
      } else {
        self.prepend(new PjsElement(child));
      }
    };
    self.append = function(arg1) { 
      var args = arg1;
      if (!(args instanceof Array)) args = Array.prototype.slice.call(arguments);
      for (var i=0; i<args.length; i++) {
        var child = args[i];
        if (child instanceof PjsElement) {
          self.dom.appendChild(child.dom); 
        } else {
          self.append(new PjsElement(child));
        }
      }
    };
    self.remove = function() { self.dom.parentNode.removeChild(self.dom); };
    self.addClass = function(name) { 
      if (name != "") {
        //self.dom.classList.add(name);
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
    self.setAttr = function(name, value) { self.dom[name] = value; self.dom.setAttribute(name, value); }
    self.getAttr = function(name) { return self.dom[name]; }
    self.addEvent = function(name, callback) { 
      self.dom.addEventListener(name, callback); 
      if (self.eventList.indexOf(name) == -1) self.eventList.push(name);
    };
    self.showHide = function() { (self.dom.style.display != "none")?self.hide():self.show(); };
    self.show = function() { self.dom.style.display = "block"; };
    self.hide = function() { self.dom.style.display = "none"; };
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
        self.dom.removeChild(self.dom.childNodes[0]);
      }
      return self;
    }
    self.fireEvent = function(name) {
      var tmp = document.createEvent("HTMLEvents");
      tmp.initEvent(name, true, true );
      self.dom.dispatchEvent(tmp);
      return self;
    };
    self.getNodes = function() {
      var nodes = [];
      for (var i=0; i<self.dom.childNodes.length; i++) {
        nodes.push(self.dom.childNodes[i]._view);
      }
      return nodes;
    };
    self.toMarkup = function() {
      var markup = "<"+self.dom.tagName;
      for (var attr in self.dom) {
        if (['tagName', 'elemCount', 'classList', 'addEventListener', 'appendChild',
             'removeChild', 'childNodes', 'dispatchEvent', '_view', 'parentNode'].indexOf(attr) < 0) {
          if (typeof self.dom[attr] == "string") {
            markup += ' '+attr+'="'+self.dom[attr]+'"';
          }
        }
      }
      markup += ">";
      if (self.dom.innerHTML) {
        markup += self.dom.innerHTML;
      }
      for (var elem in self.dom.childNodes) {
        markup += self.dom.childNodes[elem]._view.toMarkup();
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
        var val = data[i];
        if ((val instanceof Object) && (Object.keys(val).length==1)) {
          var key = Object.keys(val)[0];
          PjsBindProperty(val[key], key, i, self);
        } else if ((val instanceof Object) && (i == "className")) {
          var keys = Object.keys(val);
          for (var k in keys) {
            (function(key) {
              var oldValue = val[key][key];
              self.addClass(oldValue);
              PjsBindProperty(val[key], key, function(value) {
                if (value != oldValue) {
                  self.removeClass(oldValue);
                  self.addClass(value);
                  oldValue = value;
                }
              }, self);
            })(keys[k]);
          };
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


  window.pjs = {
    defineModel: mvc.model.__pjsDefine,
    defineView: mvc.view.__pjsDefine,
    element: PjsElement,
    model: mvc.model.__pjsCreate,
    view: mvc.view.__pjsCreate
  };
})(window);

