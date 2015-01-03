/*global pjs */

(function () {
	'use strict';

	window.onload = function() {
		pjs.defineRoutes(document.querySelectorAll('body>div')[0], [
			{ path: '*', controller: 'TodoController' },
		]);
	};
})();