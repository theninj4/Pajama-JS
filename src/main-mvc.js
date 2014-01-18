
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
