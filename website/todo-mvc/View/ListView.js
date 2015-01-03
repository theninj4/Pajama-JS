/*global pjs */

(function () {
	'use strict';

	pjs.defineView('ListView', function(todoList) {

		this.append({ tag: 'section', id: 'todoapp', contains: [
			{ tag: 'header', id: 'header', contains: [
				{ tag: 'h1', innerHTML: 'todos' },
				{ tag: 'input', id: 'new-todo', placeholder: 'What needs to be done?', autofocus: 'autofocus',
					value: { newNoteText: todoList }, change: { createNewItem: todoList }
				}
			]},
			{ tag: 'section', id: 'main', className: { displayControls: todoList }, contains: [
				{ tag: 'input', id: 'toggle-all', type: 'checkbox', 
					checked: { allAreComplete: todoList }, change: { toggleAllComplete: todoList } },
				{ tag: 'ul', id: 'todo-list', contains: { itemList: todoList }, usingView: 'ItemView' }
			]},
			{ tag: 'footer', id: 'footer', className: { displayControls: todoList }, contains: [
				{ tag: 'span', id: 'todo-count', contains: [
					{ tag: 'strong', innerHTML: { itemCount: todoList } },
					{ tag: 'span', innerHTML: { itemVerb: todoList } }
				]},
				{ tag: 'ul', id: 'filters', contains: [
					{ tag: 'li', contains: [
						{ tag: 'a', className: { noFilter: todoList }, click: { showAllItems: todoList }, innerHTML: 'All' }
					]},
					{ tag: 'li', contains: [
						{ tag: 'a', className: { activeFilter: todoList }, click: { showActiveItems: todoList },  innerHTML: 'Active' }
					]},
					{ tag: 'li', contains: [
						{ tag: 'a', className: { completedFilter: todoList }, click: { showCompletedItems: todoList },  innerHTML: 'Completed' }
					]}
				]},
				{ tag: 'button', id: 'clear-completed', className: { showClearCompleted: todoList }, 
					click: { clearCompletedItems: todoList }, innerHTML: { clearListText: todoList } }
			]}
		]}, { tag: 'footer', id: 'info', contains: [
			{ tag: 'p', innerHTML: 'Double-click to edit a todo' },
			{ tag: 'p', innerHTML: 'Written by Oliver Rumbelow' },
			{ tag: 'p', innerHTML: 'Part of TodoMVC' }
		]});

	});
})();