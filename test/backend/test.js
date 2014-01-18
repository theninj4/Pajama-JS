var vows = require("vows");
var assert = require("assert");
var pjs = require("./node.pajama.js");

vows.describe('Pajama.js').addBatch({
  'pjs Tests': {
    'Check Array.sort works': function() {
      var testArray = [ 5, 4, 3, 2, 2, 1 ];
      testArray.sort(function(a, b) {
        return a - b;
      });
      assert.deepEqual(testArray, [ 1, 2, 2, 3, 4, 5 ], "Array.sort should work");
    },
    'Check Object.keys works': function() {
      var testObject = { one: 1, two: 2, three: 3 };
      assert.deepEqual(Object.keys(testObject), [ "one", "two", "three" ], "Object.keys should work");
    },  
    'Check pjs.element with no param': function() {
      var element = new pjs.element();
      assert.notEqual(element, null, "Element should not be null");
      assert.ok(element instanceof Object, "Element should be an object");
      assert.ok(element.dom instanceof Object, "Element.dom should be an object");
      assert.equal(element.dom.tagName.toLowerCase(), "div", "Element should default to a div");
      assert.equal(element.dom.parentNode, null, "Element should not be attached to the DOM");
      assert.equal(element.dom.childNodes.length, 0, "Element should not have any children");
      assert.equal(element.dom._view, element, "Element should have a back link");
    },  
    'Check pjs.element with tag:input': function() {
      var element = new pjs.element({ tag: 'input' });
      assert.notEqual(element, null, "Element should not be null");
      assert.ok(element instanceof Object, "Element should be an object");
      assert.ok(element.dom instanceof Object, "Element.dom should be an object");
      assert.equal(element.dom.tagName.toLowerCase(), "input", "Element should default to a div");
      assert.equal(element.dom.parentNode, null, "Element should not be attached to the DOM");
      assert.equal(element.dom.childNodes.length, 0, "Element should not have any children");
      assert.equal(element.dom._view, element, "Element should have a back link");
    },  
    'Check pjs.element with tag:input + value:1': function() {
      var element = new pjs.element({ tag: 'input', value: '1' });
      assert.notEqual(element, null, "Element should not be null");
      assert.ok(element instanceof Object, "Element should be an object");
      assert.ok(element.dom instanceof Object, "Element.dom should be an object");
      assert.equal(element.dom.tagName.toLowerCase(), "input", "Element should default to a div");
      assert.equal(element.dom.parentNode, null, "Element should not be attached to the DOM");
      assert.equal(element.dom.childNodes.length, 0, "Element should not have any children");
      assert.equal(element.dom._view, element, "Element should have a back link");
      assert.equal(element.getAttr('value'), '1', "Element has value: 1");
      assert.equal(element.dom.value, '1', "Element has value: 1");
      assert.equal(element.getValue(), '1', "Element has value: 1");

      element.setValue('2');
      assert.equal(element.getAttr('value'), '2', "Element has value: 2");
      assert.equal(element.dom.value, '2', "Element has value: 2");
      assert.equal(element.getValue(), '2', "Element has value: 2");

      element.setAttr('value', '3');
      assert.equal(element.getAttr('value'), '3', "Element has value: 3");
      assert.equal(element.dom.value, '3', "Element has value: 3");
      assert.equal(element.getValue(), '3', "Element has value: 3");
    },  
    'Check pjs.element with tag:input + value:1 + rand:2': function() {
      var element = new pjs.element({ tag: 'input', value: '1', rand: '2' });
      assert.notEqual(element, null, "Element should not be null");
      assert.ok(element instanceof Object, "Element should be an object");
      assert.ok(element.dom instanceof Object, "Element.dom should be an object");
      assert.equal(element.dom.tagName.toLowerCase(), "input", "Element should default to a div");
      assert.equal(element.dom.parentNode, null, "Element should not be attached to the DOM");
      assert.equal(element.dom.childNodes.length, 0, "Element should not have any children");
      assert.equal(element.dom._view, element, "Element should have a back link");
      assert.equal(element.getAttr('value'), '1', "Element has value: 1");
      assert.equal(element.dom.value, '1', "Element has value: 1");
      assert.equal(element.getValue(), '1', "Element has value: 1");
      assert.equal(element.getAttr('rand'), '2', "Element has rand: 2");
      assert.equal(element.dom.rand, '2', "Element has rand: 2");

      element.setAttr('rand', '3');
      assert.equal(element.getAttr('rand'), '3', "Element has value: 3");
      assert.equal(element.dom.rand, '3', "Element has value: 3");
    },  
    'Check pjs.element appending 1+1 then remove': function() {
      var e1 = new pjs.element();
      var d1 = e1.dom;
      assert.equal(e1, d1._view, "Element1 should have a back link");
      assert.equal(d1.parentNode, null, "Element1 should not be attached to the DOM");

      var e2 = new pjs.element();
      var d2 = e2.dom;
      assert.equal(e2, d2._view, "Element2 should have a back link");
      assert.equal(d2.parentNode, null, "Element2 should not be attached to the DOM");

      assert.notEqual(e1, e2, "Element1 and Element2 are different");
      assert.notEqual(d1, d2, "DOM1 and DOM2 are different");

      e1.prepend(e2);
      assert.equal(e1.getNodes()[0], e2, "Element2 should be a child of Element1");
      assert.equal(e1.getNodes()[0].dom, d2, "DOM2 should be a child of Element1");
      assert.equal(d2.parentNode, d1, "DOM1 should be the parent of DOM2");
      assert.equal(d2.parentNode._view, e1, "Element1 should be the parent of DOM2");

      e2.remove();
      assert.equal(e1.getNodes().length, 0, "Element1 should not have any children");
      assert.equal(d2.parentNode, null, "DOM2 should not have a parent");
    },
    'Check pjs.element appending 1+2 then remove': function() {
      var e1 = new pjs.element();
      var d1 = e1.dom;
      assert.equal(e1, d1._view, "Element1 should have a back link");
      assert.equal(d1.parentNode, null, "Element1 should not be attached to the DOM");

      var e2 = new pjs.element();
      var d2 = e2.dom;
      assert.equal(e2, d2._view, "Element2 should have a back link");
      assert.equal(d2.parentNode, null, "Element2 should not be attached to the DOM");

      var e3 = new pjs.element();
      var d3 = e3.dom;
      assert.equal(e3, d3._view, "Element3 should have a back link");
      assert.equal(d3.parentNode, null, "Element3 should not be attached to the DOM");

      assert.notEqual(e1, e2, "Element1 and Element2 are different");
      assert.notEqual(e2, e3, "Element2 and Element3 are different");
      assert.notEqual(d1, d2, "DOM1 and DOM2 are different");
      assert.notEqual(d2, d3, "DOM2 and DOM3 are different");

      e1.append(e2);
      e1.prepend(e3);
      assert.equal(e1.getNodes()[0], e3, "Element3 should be a child of Element1");
      assert.equal(e1.getNodes()[0].dom, d3, "DOM2 should be a child of Element3");
      assert.equal(d3.parentNode, d1, "DOM1 should be the parent of DOM3");
      assert.equal(d3.parentNode._view, e1, "Element1 should be the parent of DOM3");
      assert.equal(e1.getNodes()[1], e2, "Element2 should be a child of Element1");
      assert.equal(e1.getNodes()[1].dom, d2, "DOM2 should be a child of Element1");
      assert.equal(d2.parentNode, d1, "DOM1 should be the parent of DOM2");
      assert.equal(d2.parentNode._view, e1, "Element1 should be the parent of DOM2");

      e3.remove();
      assert.equal(e1.getNodes()[0], e2, "Element2 should be a child of Element1");
      assert.equal(e1.getNodes()[0].dom, d2, "DOM2 should be a child of Element1");
      assert.equal(d2.parentNode, d1, "DOM1 should be the parent of DOM2");
      assert.equal(d2.parentNode._view, e1, "Element1 should be the parent of DOM2");
      assert.equal(e1.getNodes().length, 1, "Element1 should still contain 1 child");
      assert.equal(d2.parentNode, d1, "DOM1 should still be the parent of DOM2");
    },  
    'Check pjs.element appending 1+2 then clear': function() {
      var e1 = new pjs.element();
      var d1 = e1.dom;
      var e2 = new pjs.element();
      var d2 = e2.dom;
      var e3 = new pjs.element();
      var d3 = e3.dom;

      e1.append(e2, e3);
      e1.clear();

      assert.equal(d1.childNodes.length, 0, "Element1 should not have any children");
      assert.equal(e1.getNodes().length, 0, "Element1 should not have any children");

      assert.equal(d2.parentNode, null, "DOM2 should have no parent node");
      assert.equal(d3.parentNode, null, "DOM3 should have no parent node");
    },  
    'Check pjs.element appends in the correct order #1': function() {
      var elems = [];
      for (var i=0; i<10; i++) {
        elems.push(new pjs.element());
      }
      var e1 = new pjs.element();
      e1.append(elems);
      var children = e1.getNodes();
      for (var i=0; i<10; i++) {
        assert.equal(elems[i], children[i], "Elements should add in the right order");
      }
    },  
    'Check pjs.element appends in the correct order #2': function() {
      var elems = [];
      for (var i=0; i<10; i++) {
        elems.push(new pjs.element());
      }
      var e1 = new pjs.element();
      e1.append.apply(e1, elems);
      var children = e1.getNodes();
      for (var i=0; i<10; i++) {
        assert.equal(elems[i], children[i], "Elements should add in the right order");
      }
    },
    'Check pjs.element prepends in the correct order #1': function() {
      var elems = [];
      for (var i=0; i<10; i++) {
        elems.push(new pjs.element());
      }
      var e1 = new pjs.element();
      e1.prepend(elems);
      var children = e1.getNodes();
      for (var i=0; i<10; i++) {
        assert.equal(elems[i], children[9-i], "Elements should add in the right order");
      }
    },
    'Check pjs.element prepends in the correct order #2': function() {
      var elems = [];
      for (var i=0; i<10; i++) {
        elems.push(new pjs.element());
      }
      var e1 = new pjs.element();
      e1.prepend.apply(e1, elems);
      var children = e1.getNodes();
      for (var i=0; i<10; i++) {
        assert.equal(elems[i], children[9-i], "Elements should add in the right order");
      }
    },
    'Check pjs.element data bind with value': function() {
      var model = {
        property: "value"
      }
      var elem = new pjs.element({ tag: 'input', value: { property: model }});
      assert.equal(elem.getAttr("value"), "value", "Element should have value in model - value");
      
      model.property = "test";
      assert.equal(elem.getAttr("value"), "test", "Element should have value in model - test");
      assert.equal(model.property, "test", "Model should contain - test");

      elem.setAttr("value", "hello");
      elem.fireEvent("change");
      assert.equal(elem.getAttr("value"), "hello", "Element should have value in model - hello");
      assert.equal(model.property, "hello", "Model should react to Element change - hello");

      elem.recycle();
      elem.setAttr("value", "world");
      elem.fireEvent("change");
      assert.equal(elem.getValue(), "world", "Element should have value in model - world");
      assert.equal(model.property, "hello", "Model should still contain - hello");

      model.property = "default";
      assert.equal(elem.getValue(), "world", "Element should have value in model - world");
      assert.equal(model.property, "default", "Model should react to Element change - default");
    },
    /*'Check pjs.element data bind with two binding value parameters': function() {
      var model = {
        a: 1,
        b: 2
      }
      var elem = new pjs.element({ tag: 'input', test: { a: model, b: model }});
      assert.equal(model.a, model.b);
      model.a = 9;
      assert.equal(model.a, model.b);
      model.b = 7;
      assert.equal(model.a, model.b);
    },*/
    'Check pjs.element data bind with two binding function parameters': function() {
      var model = {
        result: 1,
        a: function() {
          this.result++;
        },
        b: function() {
          this.result++;
        }
      }
      var elem = new pjs.element({ tag: 'input', ninj4: { a: model, b: model }});
      elem.fireEvent("ninj4");
      assert.equal(model.result, "3", "Model should have new value - 3")
    },
    'Check pjs.element data bind with function': function() {
      var model = {
        result: "1",
        property: function() {
          this.result = "2";
        }
      }
      var elem = new pjs.element({ tag: 'input', value: { result: model }, change: { property: model }});
      assert.equal(elem.getAttr("value"), "1", "Element should have value in model - 1");

      elem.fireEvent("change");
      assert.equal(model.result, "2", "Model should have new value - 2")
    },
    'Check pjs.element data bind with custom event': function() {
      var model = {
        result: "1",
        property: function() {
          this.result = "2";
        }
      }
      var elem = new pjs.element({ tag: 'input', ninj4: { property: model }});
      elem.fireEvent("ninj4");
      assert.equal(model.result, "2", "Model should have new value - 2")
    },
    'Check pjs.element.contains with static array': function() {
      var elem = new pjs.element({ contains: [
        { id: "1" },
        { id: "2" }
      ]});
      var children = elem.getNodes();
      assert.equal(children.length, 2, "Element should have 2 children");
      assert.equal(children[0].getAttr("id"), 1, "First child should be #1");
      assert.equal(children[1].getAttr("id"), 2, "Second child should be #2");
    },
    'Check pjs.element.contains with dynamic array': function() {
      var model = {
        array: [ { val: 1 }, { val: 2 } ]
      };
      var elem = new pjs.element({ contains: { array: model }, forEach: function(arrayItem) {
        return { id: { val: arrayItem } };
      }});
      var children = elem.getNodes();
      children[0].setAttr("temp", "test");
      assert.equal(children.length, 2, "Element should have 2 children");
      assert.equal(children[0].getAttr("id"), 1, "First child should be #1");
      assert.equal(children[1].getAttr("id"), 2, "Second child should be #2");

      model.array.push({ val: 3 });
      var children = elem.getNodes();
      assert.equal(children.length, 3, "Element should have 3 children");
      assert.equal(children[2].getAttr("id"), 3, "Third child should be #3");
      assert.equal(children[0].getAttr("temp"), "test", "First child should be the original");

      model.array.unshift({ val: 0 });
      var children = elem.getNodes();
      assert.equal(children.length, 4, "Element should have 4 children");
      assert.equal(children[0].getAttr("id"), 0, "New first child should be #0");
      assert.equal(children[1].getAttr("temp"), "test", "Second child should be the original");

      model.array.pop();
      var children = elem.getNodes();
      assert.equal(children.length, 3, "Element should have 3 children");
      assert.equal(children[2].getAttr("id"), 2, "Third child should be #2");
      assert.equal(children[1].getAttr("temp"), "test", "First child should be the original");
      
      model.array.shift();
      var children = elem.getNodes();
      assert.equal(children.length, 2, "Element should have 2 children");
      assert.equal(children[1].getAttr("id"), 2, "Second child should be #2");
      assert.equal(children[0].getAttr("temp"), "test", "First child should be the original");

      model.array.push({ val: 3 });
      model.array.splice(1, 1);
      var children = elem.getNodes();
      assert.equal(children.length, 2, "Element should have 2 children");
      assert.equal(children[1].getAttr("id"), 3, "Second child should be #3");

      model.array.push({ val: 2 });
      model.array.sort(function(a, b) {
        return a.val - b.val;
      });
      var children = elem.getNodes();
      assert.equal(children.length, 3, "Element should have 3 children");
      assert.equal(children[0].getAttr("id"), 1, "First child should be #1");
      assert.equal(children[1].getAttr("id"), 2, "Second child should be #2");
      assert.equal(children[2].getAttr("id"), 3, "Third child should be #3");
      
      model.array.reverse();
      var children = elem.getNodes();
      assert.equal(children.length, 3, "Element should have 3 children");
      assert.equal(children[0].getAttr("id"), 3, "Third child should be #3");
      assert.equal(children[1].getAttr("id"), 2, "Second child should be #2");
      assert.equal(children[2].getAttr("id"), 1, "First child should be #1");
    },
    'Check pjs triggerEvent + eventWaitAll': {
      topic: function() {
        var start = this.callback;
        var total = 0;
        var self = this;
        var listener = pjs.eventWaitAll('test', function(data) {
          total++;
          assert.ok([1, 2].indexOf(total) !== -1);
          if (total == 2) {
            listener.terminate();
            pjs.triggerEvent('test', 3);
            setTimeout(function() {
              start();
            }, 10);
          }
        });

        var listener2 = pjs.eventWaitAll('test', function(data) {
          assert.equal(true, false);
        });
        listener2.terminate();
        
        pjs.triggerEvent('test', 1);
        pjs.triggerEvent('test', 2);
      },
      'done': function() {
        assert.ok(true);
      }
    },
    'Check pjs triggerEvent + eventWaitOnce': {
      topic: function() {
        var start = this.callback;
        var total = 0;
        var self = this;
        var listener = pjs.eventWaitOnce('test', function(data) {
          total++;
          assert.equal(total, 1);
          pjs.triggerEvent('test', 3);
          setTimeout(function() {
            start();
          }, 10);
        });

        var listener2 = pjs.eventWaitOnce('test', function(data) {
          assert.equal(true, false);
        });
        listener2.terminate();
        pjs.triggerEvent('test', 1);
        pjs.triggerEvent('test', 2);
      },
      'done': function() {
        assert.ok(true);
      }
    },
    'Checking className binding 1': function() {
      var model = {
        prop1: 'class1',
        prop2: 'class2'
      };
      var view = new pjs.element({ className: { prop1: model, prop2: model } });

      assert.equal(model.prop1, 'class1');
      assert.equal(model.prop2, 'class2');

      assert.equal(view.hasClass("class1"), true, "Should have class1");
      assert.equal(view.hasClass("class2"), true, "Should have class2");
      model.prop1 = "";
      assert.equal(view.hasClass("class1"), false, "Should not have class1");
      assert.equal(view.hasClass("class2"), true, "Should have class2");
      model.prop2 = "";
      assert.equal(view.hasClass("class1"), false, "Should not have class1");
      assert.equal(view.hasClass("class2"), false, "Should not have class2");
      model.prop1 = "test"

      assert.equal(model.prop1, 'test');
      assert.equal(model.prop2, '');
      assert.equal(view.hasClass("test"), true, "Should have test");
      assert.equal(view.hasClass("class1"), false, "Should not have class1");
      assert.equal(view.hasClass("class2"), false, "Should not have class2");
    },
    'Checking className binding 2': function() {
      var model = {
        prop1: 'class1'
      };
      var view1 = new pjs.element({ className: { prop1: model } });
      var view2 = new pjs.element({ tag: 'input', type: 'text', value: { prop1: model } });

      assert.equal(model.prop1, 'class1');
      assert.equal(view1.hasClass("class1"), true, "Should have class1");
      assert.equal(view2.getAttr('value'), 'class1', 'Should have value of class1');

      model.prop1 = 'class2';
      assert.equal(model.prop1, 'class2');
      assert.equal(view1.hasClass("class1"), false, "Should not have class1");
      assert.equal(view1.hasClass("class2"), true, "Should have class2");
      assert.equal(view2.getAttr('value'), 'class2', 'Should have value of class2');

      view2.setAttr('value', 'foobar');
      view2.fireEvent("change");
      assert.equal(model.prop1, 'foobar');
      assert.equal(view1.hasClass("foobar"), true, "Should have foobar");
      assert.equal(view2.getAttr('value'), 'foobar', 'Should have value of foobar');
    }
  }
}).export(module);
