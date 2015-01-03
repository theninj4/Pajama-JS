/*global pjs */

(function () {
	'use strict';

	window.onload = function() {
	  pjs.defineRoutes(document.body.children[0], [
	    { path: '*', controller: 'TodoController' },
	  ]);
	};
})();