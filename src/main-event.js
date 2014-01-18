
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
