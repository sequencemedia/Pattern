define(['pattern/storage'], function (Storage) {

	'use strict';

	var ViewListStorage = (function () {
		var instance;
		function initialize() {
			var viewLists = {};
			this.allViewLists = function () {
				return viewLists;
			};
			this.hasViewList = function (lid) {
				return (lid in viewLists);
			};
		};
		return function ViewListStorage() { /* console.log('(ViewListStorage)'); */
			return instance || initialize.call(instance = this);
		};
	}());

	ViewListStorage.prototype = new Storage();
	ViewListStorage.prototype.store = function (lid, viewList) {
		(this.all())[lid] = (
		(this.allViewLists())[lid] = viewList);
	};
	ViewListStorage.prototype.purge = function (lid) {
		delete (this.all())[lid];
		delete (this.allViewLists())[lid];
	};

	return ViewListStorage;

});