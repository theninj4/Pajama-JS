/*global pjs */

(function () {
	'use strict';

	function ListModel(existingItems, viewOverride) {
		var self = this;
		self.viewOverride = viewOverride || 'no';
		self[self.viewOverride+'Filter'] = 'selected';
		self.newNoteText = '';

		self.itemList = [];
		existingItems.forEach(function(item) {
			var newItem = new pjs.model('ItemModel', self, item);
			self.itemList.push(newItem);
		});

		self.updateListStats();
	}
	pjs.defineModel('ListModel', ListModel);

	ListModel.prototype.serialise = function() {
		return this.itemList.map(function(item) {
			return item.serialise();
		});
	};

	ListModel.prototype.showAllItems = function() {
		pjs.route('');
	};

	ListModel.prototype.showActiveItems = function() {
		pjs.route('active');
	};

	ListModel.prototype.showCompletedItems = function() {
		pjs.route('completed');
	};

	ListModel.prototype.clearCompletedItems = function() {
		this.itemList = this.itemList.filter(function(listItem) {
			return listItem.status === 'active';
		});
		this.updateListStats();
	};

	ListModel.prototype.createNewItem = function() {
		var self = this;
		var processedText = self.newNoteText.trim();
		self.newNoteText = '';
		if (processedText.length > 0) {
			var newListItem = new pjs.model('ItemModel', self, { text: processedText });
			self.itemList.push(newListItem);
			self.updateListStats();
		}
	};

	ListModel.prototype.removeItem = function(item) {
		this.itemList.splice(this.itemList.indexOf(item), 1);
		this.updateListStats();
	};

	ListModel.prototype.toggleAllComplete = function() {
		var newStatus = (this.allAreComplete !== true) ? 'active' : 'completed';
		this.itemList.forEach(function(listItem) {
			listItem.setStatus(newStatus);
		});
		this.updateListStats();
	};

	ListModel.prototype.updateListStats = function() {
		var self = this;
		var stats = {
			completed: 0,
			active: 0,
			total: 0
		};
		self.itemList.forEach(function(listItem) {
			if (self.viewOverride !== 'no') {
				listItem.showIf(self.viewOverride);
			}
			stats[listItem.status]++;
			stats.total++;
		});
		self.itemCount = ''+stats.active;
		self.itemVerb = (stats.active===1) ? ' item left' : ' items left';
		self.clearListText = 'Clear completed ('+stats.completed+')';
		self.displayControls = (stats.total === 0) ? 'hidden' : '';
		self.allAreComplete = (stats.completed === stats.total);
		self.showClearCompleted = stats.completed === 0 ? 'hidden' : '';
		pjs.triggerEvent('SaveNotes');
	};
})();