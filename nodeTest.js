var vows = require("vows");
var assert = require("assert");
var pjs = require("./node.pajama.js");

pjs.defineModel("__pjs.model", function() {
  this.simpleType1 = "simpleType1";
  this.simpleType2 = "simpleType2";
  this.selected = 2;
  this.selectList = [{ value: "1", name: "ONE" }, { value: "2", name: "TWO" }, { value:"3", name: "THREE" }];
  this.complexArray = [ { a: 1, b: 2 }, { a: 3, b: 4 }, { a: 5, b: 6 } ];
  this.counter = 0;
  this.plusOne = function() { 
    this.counter++; 
  };
  this.class1 = "class1";
  this.class2 = "class2";
});

pjs.defineView("__pjs.view", function(testModel) {
  this.e0 = new pjs.element({ id: "0", innerHTML: { simpleType1: testModel }, tag: "div" });
  this.e1 = new pjs.element({ id: "1", value: { simpleType1: testModel }, tag: "input" });
  this.e2 = new pjs.element({ id: "2", value: { simpleType2: testModel }, tag: "input" });
  this.e3 = new pjs.element({ id: "3", innerHTML: { counter: testModel }, tag: "div" });
  this.e4 = new pjs.element({ id: "4", click: { plusOne: testModel }, tag: "input", type: "button" });
  this.e5 = new pjs.element(
    { id: "5", tag: "select", value: { selected: testModel }, contains: { selectList: testModel }, forEach: function(item) {
      return { tag: 'option', value: { value: item }, innerHTML: { name: item } };
    }}
  );
  this.e6 = new pjs.element({ id: "6", contains: { complexArray: testModel }, forEach: function(item) {
    return { tag: 'div', classes: ['table-row'], contains: [
             { tag: 'input', value: { a: item } },
             { tag: 'input', value: { b: item } } 
           ] };
  }});
  this.e7 = new pjs.element({ id: "7", className: { class1: testModel, class2: testModel } });
  this.e8 = new pjs.element({ id: "8", dblclick: { plusOne: testModel }});
  this.e9 = new pjs.element({ id: "9", hover: { plusOne: testModel }});

  this.append(this.e0, this.e1, this.e2, this.e3, this.e4, this.e5, this.e6, this.e7, this.e8, this.e9);
});

vows.describe('Pajama.js').addBatch({
  'pjs Tests': {
    topic: function() {
      var model = new pjs.model("__pjs.model");
      var view = new pjs.view("__pjs.view", model);
      this.callback(model, view);
    },
    'Objects should be added in the correct order': function(model, view) {
      var nodes = view.getNodes();
      for (var i=0; i<nodes.length; i++) {
        assert.equal(nodes[i].dom.id, i, "View added elements in wrong order!");
      }
    },  
    'Simple Binding Test 1, Default Values': function(model, view) {
      assert.equal(view.e0.getValue(), "simpleType1", "Panel 0 should contain default text");
      assert.equal(view.e1.getValue(), "simpleType1", "Panel 1 should contain default text");
      assert.equal(view.e2.getValue(), "simpleType2", "Panel 2 should contain default text");
    },  
    'Simple Binding Test 2, Updating Model': function(model, view) {
      model.simpleType1 = "New Value";
      assert.equal(view.e0.getValue(), "New Value", "Panel 0 should contain new value");
      assert.equal(view.e1.getValue(), "New Value", "Panel 1 should contain new value");
      assert.equal(view.e2.getValue(), "simpleType2", "Panel 2 should contain default text");
    },  
    'Simple Binding Test 3, Updating View': function(model, view) {
      view.e0.setValue("Another Value");
      view.e0.fireEvent("change");
      assert.equal(model.simpleType1, "Another Value", "Model should have updated");
      assert.equal(view.e0.getValue(), "Another Value", "Panel 0 should contain another value");
      assert.equal(view.e1.getValue(), "Another Value", "Panel 1 should contain another value");
      assert.equal(view.e2.getValue(), "simpleType2", "Panel 2 should contain default text");
    },  
    'Simple Binding Test 4, Interference Testing Model': function(model, view) {
      model.simpleType2 = "New Value";
      assert.equal(view.e0.getValue(), "Another Value", "Panel 0 should contain another value");
      assert.equal(view.e1.getValue(), "Another Value", "Panel 1 should contain another value");
      assert.equal(view.e2.getValue(), "New Value", "Panel 2 should contain new value");
    },  
    'Simple Binding Test 4, Interference Testing View': function(model, view) {
      view.e2.setValue("Another Value");
      view.e2.fireEvent("change");
      assert.equal(model.simpleType1, "Another Value", "Model should have updated");
      assert.equal(view.e0.getValue(), "Another Value", "Panel 0 should contain another value");
      assert.equal(view.e1.getValue(), "Another Value", "Panel 1 should contain another value");
      assert.equal(view.e2.getValue(), "Another Value", "Panel 2 should contain another value");
    },  
    'Function Binding Test': function(model, view) {
      assert.equal(view.e3.getValue(), 0, "Panel 3 should contain 0");
      view.e4.fireEvent("click");
      assert.equal(model.counter, 1, "Counter should have incremented");
      assert.equal(view.e3.getValue(), 1, "Panel 3 should contain 1");
      view.e4.fireEvent("click");
      assert.equal(model.counter, 2, "Counter should have incremented");
      assert.equal(view.e3.getValue(), 2, "Panel 3 should contain 2");
    },  
    'Select Binding Test': function(model, view) {
      assert.equal(view.e5.getNodes().length, 3, "Select should contain 3 items");
      assert.equal(view.e5.getValue(), 2, "Select should show 2nd item");
      model.selected = 1;
      assert.equal(view.e5.getValue(), 1, "Select should show 1st item");
      view.e5.setValue("3");
      view.e5.fireEvent("change");
      assert.equal(view.e5.getValue(), 3, "Select should show 3rd item");
      assert.equal(model.selected, 3, "Model should contain 3rd value");
    },  
    'Array Binding Test': function(model, view) {
      assert.equal(view.e6.getNodes().length, 3, "Table should contain 3 items");
      for (var i=0; i<3; i++) {
        var a = view.e6.getNodes()[i].getNodes()[0];
        var b = view.e6.getNodes()[i].getNodes()[1];
        assert.equal(a.getValue(), (i*2)+1, "Table "+i+" = "+((i*2)+1));
        assert.equal(b.getValue(), (i*2)+2, "Table "+i+" = "+((i*2)+2));
        model.complexArray[i].a++;
        model.complexArray[i].b++;
        assert.equal(a.getValue(), (i*2)+2, "Table "+i+" = "+((i*2)+2));
        assert.equal(b.getValue(), (i*2)+3, "Table "+i+" = "+((i*2)+3));
        a.setValue((i*2)+1);
        b.setValue((i*2)+2);
        a.fireEvent("change");
        b.fireEvent("change");
        assert.equal(a.getValue(), (i*2)+1, "Table "+i+" = "+((i*2)+1));
        assert.equal(b.getValue(), (i*2)+2, "Table "+i+" = "+((i*2)+2));
      }
      model.complexArray.push({ a: 7, b: 8 });
      assert.equal(view.e6.getNodes().length, 4, "Table should contain 4 items");
      model.complexArray.shift();
      assert.equal(view.e6.getNodes().length, 3, "Table should contain 3 items");
      assert.equal(view.e6.getNodes()[0].getNodes()[0].getValue(), 3, "Table 1 = 3");
      assert.equal(view.e6.getNodes()[1].getNodes()[0].getValue(), 5, "Table 2 = 5");
      assert.equal(view.e6.getNodes()[2].getNodes()[0].getValue(), 7, "Table 3 = 7");
      model.complexArray.sort(function(a, b) {
        return b.b - a.b;
      });
      assert.equal(view.e6.getNodes()[0].getNodes()[0].getValue(), 7, "Table 1 = 7");
      assert.equal(view.e6.getNodes()[1].getNodes()[0].getValue(), 5, "Table 2 = 5");
      assert.equal(view.e6.getNodes()[2].getNodes()[0].getValue(), 3, "Table 3 = 3");
    },  
    'ClassName Test': function( model, view) {
      assert.equal(view.e7.hasClass("class1"), true, "Should have class1");
      assert.equal(view.e7.hasClass("class2"), true, "Should have class2");
      model.class1 = "";
      assert.equal(view.e7.hasClass("class1"), false, "Should not have class1");
      assert.equal(view.e7.hasClass("class2"), true, "Should have class2");
      model.class2 = "";
      assert.equal(view.e7.hasClass("class1"), false, "Should not have class1");
      assert.equal(view.e7.hasClass("class2"), false, "Should not have class2");
      model.class1 = "test"
      assert.equal(view.e7.hasClass("test"), true, "Should have test");
      assert.equal(view.e7.hasClass("class1"), false, "Should not have class1");
      assert.equal(view.e7.hasClass("class2"), false, "Should not have class2");
    },
    'dblclick Event Test': function(model, view) {
      model.counter = 2;
      view.e8.fireEvent("dblclick");
      assert.equal(3, model.counter, "Data was as expected");
    },
    'hover Event Test': function(model, view) {
      model.counter = 2;
      view.e9.fireEvent("hover");
      assert.equal(3, model.counter, "Data was as expected");
    }
  }
}).export(module);
