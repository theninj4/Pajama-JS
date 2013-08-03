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