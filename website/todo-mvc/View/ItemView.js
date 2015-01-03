/*global pjs */

(function () {
	'use strict';

	pjs.defineView('ItemView', function(todoItem) {
		
		this.append(
			{ tag:'li', dblclick: { edit: todoItem }, className: { status: todoItem, isHidden: todoItem, isEditing: todoItem }, contains: [
				{ tag: 'div', classes: ['view'], contains: [
					{ tag: 'input', classes: ['toggle'], type: 'checkbox',
						checked: { completed: todoItem }, change: { toggleStatus: todoItem } },
					{ tag: 'label', innerHTML: { text: todoItem } },
					{ tag: 'button', classes: ['destroy'], click: { remove: todoItem } }
				]},
				{ tag: 'input', classes: ['edit'], value: { updatedText: todoItem },
					keyup: { update: todoItem }, blur: { save: todoItem } }
			]}
		);

	});
})();