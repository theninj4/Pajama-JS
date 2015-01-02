
window.onload = function() {
  pjs.defineRoutes(document.body, [
    { path: "*", controller: "TodoController" },
  ]);
};
