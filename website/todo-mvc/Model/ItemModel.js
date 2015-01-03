/*global pjs */

(function () {
	'use strict';

	function ItemModel(list, serialisedItem) {
		serialisedItem = serialisedItem || { };
		this.text = serialisedItem.text || 'default text here';
		this.isHidden = '';
		this.isEditing = '';
		this.list = list;
		this.setStatus(serialisedItem.status || 'active');
	}
	pjs.defineModel('ItemModel', ItemModel);

	ItemModel.prototype.toggleStatus = function() {
		this.setStatus(this.completed ? 'completed' : 'active');
	};

	ItemModel.prototype.setStatus = function(newStatus) {
		this.status = newStatus;
		this.completed = (this.status === 'completed');
		pjs.triggerEvent('SaveNotes');
		this.list.updateListStats();
	};

	ItemModel.prototype.showIf = function(status) {
		this.isHidden = (status !== this.status) ? 'hidden' : '';
	};

	ItemModel.prototype.remove = function() {
		this.list.removeItem(this);
	};

	ItemModel.prototype.edit = function() {
		this.updatedText = this.text;
		this.isEditing = 'editing';
	};

	ItemModel.prototype.update = function(keyEvent) {
		if (keyEvent.keyCode === 27) {
			this.isEditing = '';
		} else if (keyEvent.keyCode === 13) {
			this.save();
		}
	};

	ItemModel.prototype.save = function() {
		if (!this.isEditing) {
			return;
		}
		this.isEditing = '';
		var processedText = this.updatedText.trim();
		if (processedText.length > 0) {
			this.text = processedText;
		} else {
			this.remove();
		}
	};

	ItemModel.prototype.serialise = function() {
		return {
			text: this.text,
			status: this.status
		};
	};
})();