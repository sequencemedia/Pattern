define(['pattern/storage'], function (Storage) {

	'use strict';

	var ModelStorage = (function () {
		var instance;
		function initialize() {
			var models = {};
			this.allModels = function () {
				return models;
			};
			this.hasModel = function (mid) {
				return (mid in models);
			};
		}
		return function ModelStorage() { /* console.log('(ModelStorage)'); */
			return instance || initialize.call(instance = this);
		};
	}());

	ModelStorage.prototype = new Storage();
	ModelStorage.prototype.store = function (mid, model) {
		(this.all())[mid] = (
		(this.allModels())[mid] = model);
	};
	ModelStorage.prototype.purge = function (mid) {
		delete (this.all())[mid];
		delete (this.allModels())[mid];
	};

	return ModelStorage;

});