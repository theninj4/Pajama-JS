
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
                bindingItem.func.call({ }, arguments[0]);
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
                bindingItem.func.call({ }, arguments[0]);
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
              bindingItem.func.call({ }, model[bind][item]);
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
