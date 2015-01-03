/*global pjs, localStorage */

(function () {
	'use strict';

	pjs.defineController('TodoController', function(container, viewOverride) {

		var existingItems = [ ];
		if (localStorage['todos-pajamajs']) {
			existingItems = JSON.parse(localStorage['todos-pajamajs']);
		}
		pjs.eventWaitAll('SaveNotes', function() {
			localStorage['todos-pajamajs'] = JSON.stringify(listModel.serialise());
		});

		var listModel = new pjs.model('ListModel', existingItems, viewOverride);
		var listView = new pjs.view('ListView', listModel);
		container.append(listView);

	});
})();