define(['pattern/storage'], function (Storage) {

	'use strict';

	var ControllerStorage = (function () {
		var instance;
		function initialize() {
			var controllers = {};
			this.allControllers = function () {
				return controllers;
			};
			this.hasController = function (cid) {
				return (cid in controllers);
			};
		}
		return function ControllerStorage() { /* console.log('(ControllerStorage)'); */
			return instance || initialize.call(instance = this);
		};
	}());

	ControllerStorage.prototype = new Storage();
	ControllerStorage.prototype.store = function (cid, controller) {
		(this.all())[cid] = (
		(this.allControllers())[cid] = controller);
	};
	ControllerStorage.prototype.purge = function (cid) {
		delete (this.all())[cid];
		delete (this.allControllers())[cid];
	};

	return ControllerStorage;

});