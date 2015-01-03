
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
