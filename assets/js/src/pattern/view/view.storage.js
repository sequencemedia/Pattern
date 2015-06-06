define(['pattern/storage'], function (Storage) {

	'use strict';

	var ViewStorage = (function () {
		var instance;
		function initialize() {
			var views = {};
			this.allViews = function () {
				return views;
			};
			this.hasView = function (vid) {
				return (vid in views);
			};
		}
		return function ViewStorage() { //console.log('(ViewStorage)');
			return instance || initialize.call(instance = this);
		};
	}());

	ViewStorage.prototype = new Storage();
	ViewStorage.prototype.store = function (vid, view) {
		(this.all())[vid] = (
		(this.allViews())[vid] = view);
	};
	ViewStorage.prototype.purge = function (vid) {
		delete (this.all())[vid];
		delete (this.allViews())[vid];
	};

	return ViewStorage;

});