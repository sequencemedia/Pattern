define(['pattern/pattern', 'pattern/model-list/model-list.manager', 'pattern/model/model'], function (pattern, ModelListManager, Model) {

	'use strict';

	var modelListManager = new ModelListManager;

	function initialize(pairsList, parameters) {
		var lid;
		this.lid = (function (lid) {
			return function () {
				return lid;
			};
		}(lid = pattern.createLID(pattern.createUID())));
		modelListManager.dispose(lid, this);
		modelListManager.initialize(lid, pairsList, parameters);
		modelListManager.subscribe(lid);
	}

	function ModelList(pairsList, parameters) {
		initialize.call(this, pairsList, parameters);
	}
	ModelList.prototype.get = function (index) {
		return modelListManager.get(this.lid(), index);
	};
	ModelList.prototype.set = function (index, model) {
		modelListManager.set(this.lid(), index, model);
	};
	ModelList.prototype.add = function (model) {
		modelListManager.add(this.lid(), model);
	};
	ModelList.prototype.remove = function (model) {
		modelListManager.remove(this.lid(), model);
	};
	ModelList.prototype.addEach = function (array) {
		modelListManager.addEach(this.lid(), array);
	};
	ModelList.prototype.removeEach = function (array) {
		modelListManager.removeEach(this.lid(), array);
	};
	ModelList.prototype.all = function () {
		return modelListManager.all(this.lid());
	};
	ModelList.prototype.indexOf = function (model) {
		return modelListManager.indexOf(this.lid(), model);
	};
	ModelList.prototype.queue = function (key, parameters) {
		modelListManager.queue(this.lid(), key, parameters);
	};
	ModelList.prototype.raise = function (key, parameters) {
		modelListManager.raise(this.lid(), key, parameters);
	};
	ModelList.prototype.discard = function () {
		modelListManager.discard(this.lid());
	};
	ModelList.prototype.Model = Model;
	ModelList.prototype.descendant = (function (Parent) {
		function initialize(ancestor, pairsList, parameters) {
			var lid;
			this.constructor.call(this, pairsList, parameters); //ancestor.constructor.call(this, pairsList, parameters);
			modelListManager.ancestor(lid = this.lid(), ancestor);
			modelListManager.inherit(ancestor.lid(), lid);
		}
		function child(Parent, parent, parentPairs, parentParameters) {
			var surrogate = new Parent;
			function ModelList(pairsList, parameters) {
				initialize.call(this, parent, pattern.list.mix(parentPairs, pairsList), pattern.hash.mix(parentParameters, parameters));
			}
			ModelList.prototype = surrogate;
			ModelList.prototype.ancestor = function () {
				return modelListManager.ancestor(this.lid());
			};
			ModelList.prototype.descendant = (function (Parent) {
				return function (pairsList, parameters) {
					/*
						Model instances of this descendant will be appended to the list of Model instances of its ancestor
						(necessarily being a list from all this descendants ancestors) so mixing-in the list here just
						creates duplicate Model instances
					*/
					return child.call(this, Parent, this, pairsList || parentPairs, pattern.hash.mix(parentParameters, parameters));
				};
			}(ModelList));
			modelListManager.discard(surrogate.lid());
			return pattern.inherit(Parent, ModelList);
		}
		return function (pairsList, parameters) {
			return child.call(this, Parent, this, pairsList, parameters);
		};
	}(ModelList));
	ModelList.descendant = (function (Parent) {
		function initialize(pairsList, parameters) {
			this.constructor.call(this, pairsList, parameters);
		}
		function child(Parent, parentPairs, parentParameters) {
			var surrogate = new Parent;
			function ModelList(pairsList, parameters) {
				initialize.call(this, pattern.list.mix(parentPairs, pairsList), pattern.hash.mix(parentParameters, parameters));
			}
			ModelList.prototype = surrogate;
			ModelList.descendant = (function (Parent, parentPairs, parentParameters) {
				return function (pairsList, parameters) {
					return child.call(this, Parent, pattern.list.mix(parentPairs, pairsList), pattern.hash.mix(parentParameters, parameters));
				};
			}(ModelList, parentPairs, parentParameters));
			modelListManager.discard(surrogate.lid());
			return pattern.inherit(Parent, ModelList);
		}
		return function (pairsList, parameters) {
			return child.call(this, Parent, pairsList, parameters);
		};
	}(ModelList));

	return ModelList;

});