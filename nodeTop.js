
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
      appendChild: function(elem) {
        nodeList.push(elem);
        elem.parentNode = newElement;
      },
      removeChild: function(elem) {
        for (var i=0; i<nodeList.length; i++) {
          if (nodeList[i] == elem) {
            nodeList.splice(i, 1);
            break;
          }
        }
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
