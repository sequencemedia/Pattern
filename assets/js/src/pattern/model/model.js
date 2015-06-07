define(['pattern/pattern', 'pattern/model/model.manager'], function (pattern, ModelManager) {

	'use strict';

	var modelManager = new ModelManager;

	function initialize(pairs, parameters) {
		var mid;
		this.mid = (function (mid) {
			return function () {
				return mid;
			};
		}(mid = pattern.createMID(pattern.createUID())));
		modelManager.dispose(mid, this);
		modelManager.initialize(mid, pairs, parameters);
	}

	function Model(pairs, parameters) {
		initialize.call(this, pairs, parameters);
	}
	Model.prototype.get = function (key) {
		return modelManager.get(this.mid(), key);
	};
	Model.prototype.getEach = function (keys) {
		return modelManager.getEach(this.mid(), keys);
	};
	Model.prototype.getAll = function () {
		return modelManager.getAll(this.mid());
	};
	Model.prototype.set = function (key, value) {
		modelManager.set(this.mid(), key, value);
	};
	Model.prototype.setEach = function (pairs) {
		modelManager.setEach(this.mid(), pairs);
	};
	Model.prototype.setAll = function (value) {
		modelManager.setAll(this.mid(), value);
	};
	Model.prototype.zed = function (key) {
		modelManager.zed(this.mid(), key);
	};
	Model.prototype.zedEach = function (keys) {
		modelManager.zedEach(this.mid(), keys);
	};
	Model.prototype.zedAll = function () {
		modelManager.zedAll(this.mid());
	};
	Model.prototype.unset = function (key) {
		modelManager.unset(this.mid(), key);
	};
	Model.prototype.unsetEach = function (keys) {
		modelManager.unsetEach(this.mid(), keys);
	};
	Model.prototype.unsetAll = function () {
		modelManager.unsetAll(this.mid());
	};
	Model.prototype.reset = function (key) {
		modelManager.reset(this.mid(), key);
	};
	Model.prototype.resetEach = function (keys) {
		modelManager.resetEach(this.mid(), keys);
	};
	Model.prototype.resetAll = function () {
		modelManager.resetAll(this.mid());
	};
	Model.prototype.discard = function () {
		modelManager.discard(this.mid());
	};
	Model.prototype.descendant = (function (Parent) {
		function initialize(ancestor, pairs, parameters) {
			var mid;
			this.constructor.call(this, pairs, parameters); //ancestor.constructor.call(this, pairs, parameters);
			modelManager.ancestor(mid = this.mid(), ancestor);
			modelManager.inherit(ancestor.mid(), mid);
		}
		function child(Parent, parent, parentPairs, parentParameters) {
			var surrogate = new Parent;
			function Model(pairs, parameters) {
				initialize.call(this, parent, pattern.hash.mix(parentPairs, pairs), pattern.hash.mix(parentParameters, parameters));
			}
			Model.prototype = surrogate;
			Model.prototype.ancestor = function () {
				return modelManager.ancestor(this.mid());
			};
			Model.prototype.descendant = (function (Parent) {
				return function (pairs, parameters) {
					return child.call(this, Parent, this, pattern.hash.mix(parentPairs, pairs), pattern.hash.mix(parentParameters, parameters));
				};
			}(Model));
			modelManager.discard(surrogate.mid());
			return pattern.inherit(Parent, Model);
		}
		return function (pairs, parameters) {
			return child.call(this, Parent, this, pairs, parameters);
		};
	}(Model));
	Model.discard = function () {
		var mid,
			allModels = modelManager.allModels(),
			model;
		for (mid in allModels) {
			model = allModels[mid];
			model.discard();
		}
	};
	Model.descendant = (function (Parent) {
		function initialize(pairs, parameters) {
			this.constructor.call(this, pairs, parameters);
		}
		function child(Parent, parentPairs, parentParameters) {
			var surrogate = new Parent;
			function Model(pairs, parameters) {
				initialize.call(this, pattern.hash.mix(parentPairs, pairs), pattern.hash.mix(parentParameters, parameters));
			}
			Model.prototype = surrogate;
			Model.descendant = (function (Parent) {
				return function (pairs, parameters) {
					return child.call(this, Parent, pattern.hash.mix(parentPairs, pairs), pattern.hash.mix(parentParameters, parameters));
				};
			}(Model));
			modelManager.discard(surrogate.mid());
			return pattern.inherit(Parent, Model);
		}
		return function (pairs, parameters) {
			return child.call(this, Parent, pairs, parameters);
		};
	}(Model));

	return Model;

});