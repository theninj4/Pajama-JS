
var pjs = pjs || require("./node.pajama.js");

pjs.defineModel("LibraryModel", function() {
  var self = this;
  this.name = "Default";
  this.books = [ { name: 'brochure', pages: 10 }, { name: 'poster', pages: '1' } ];
  this.count = 2;
  this.addBook = function() {
    this.books.push({ name: 'test', pages: Math.round(Math.random()*100) });
  };
  this.sortBooks = function() {
    this.books.sort(function(a, b) { return parseInt(a.pages) - parseInt(b.pages); });
  };
  this.popBook = function() {
    this.books.pop();
  };

  setInterval(function() {
    self.addBook();
    self.count++;
  }, 5000);

});

pjs.defineView("LibraryView", function(myModel) {
  this._container = new pjs.element(
    { tag: 'div', contains: { books: myModel }, forEach: function(book) {
      return [ 
        { tag: 'div', contains: [
          { tag: 'input', value: { name: book } },
          { tag: 'input', value: { pages: book } } 
        ] } 
      ];
    } }
  );
  this._count = { tag: "div", innerHTML: { count: myModel }};
  this._addButton = { tag: "input", type: "button", value: "Add", 
                      click: { addBook: myModel } };
  this._sortButton = { tag: "input", type: "button", value: "Sort", 
                       click: { sortBooks: myModel } };
  this._popButton = { tag: "input", type: "button", value: "Pop", 
                      click: { popBook: myModel } };
  this.append(this._count, this._addButton, this._sortButton, 
              this._popButton, this._container);
});

pjs.defineView("ErrorView", function(myModel) {
  this._message = new pjs.element(
    { tag: 'div', innerHTML: 'Unknown path!' }
  );
  this.append(this._message);
});

pjs.defineView("Loading", function(myModel) {
  this._message = new pjs.element(
    { tag: 'div', innerHTML: 'Loading...' }
  );
  this.append(this._message);
});