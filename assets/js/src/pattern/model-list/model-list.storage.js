define(['pattern/storage'], function (Storage) {

	'use strict';

	var ModelListStorage = (function () {
		var instance;
		function initialize() {
			var modelLists = {};
			this.allModelLists = function () {
				return modelLists;
			};
			this.hasModelList = function (lid) {
				return (lid in modelLists);
			};
			this.modelListFor = function (lid) {
				return modelLists[lid] || null;
			};
		}
		return function ModelListStorage() { /* console.log('(ModelListStorage)'); */
			return instance || initialize.call(instance = this);
		}
	}());

	ModelListStorage.prototype = new Storage();
	ModelListStorage.prototype.store = function (lid, modelList) {
		(this.all())[lid] = (
		(this.allModelLists())[lid] = modelList);
	};
	ModelListStorage.prototype.purge = function (lid) {
		delete (this.all())[lid];
		delete (this.allModelLists())[lid];
	};

	return ModelListStorage;

});