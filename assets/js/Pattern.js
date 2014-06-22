var Pattern = (function () {

	"use strict";

	var Model,
		ModelList,
		View,
		ViewList,
		Controller,
		createUID;

	function createMID(uid) { return "mid-" + uid; }
	function createVID(uid) { return "vid-" + uid; }
	function createCID(uid) { return "cid-" + uid; }

	createUID = (function () {
		var uidPattern = "nn-n-n-n-nnn",
			expression = /n/ig;
		function uid() {
			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		}
		return function () {
			return uidPattern.replace(expression, uid);
		};
	}());

	Model = (function () {

			var ModelManager,
				modelManager;

		ModelManager = (function () {

			var models = {},
				eventManager;

			function EventManager() { };
			EventManager.prototype.raise = function (type, parameters) { console.log(type, parameters); };

			function raiseUndoOneEvent(mid, key) {
				eventManager.raise("undoOne", {
					key: key,
					currentValue: modelManager.getCurrentValue(mid, key),
					changedValue: modelManager.getChangedValue(mid, key),
					target: this
				});
			}
			function raiseUndoAllEvent(mid) {
				eventManager.raise("undoAll", {
					currentValues: modelManager.export(modelManager.currentValuesFor(mid)), // this publishes the cache by reference -- no longer private
					changedValues: modelManager.export(modelManager.changedValuesFor(mid)), // this publishes the cache by reference -- no longer private
					target: this
				});
			}
			function raiseChangeEvent(mid, key) {
				eventManager.raise("change", {
					key: key,
					currentValue: modelManager.getCurrentValue(mid, key),
					changedValue: modelManager.getChangedValue(mid, key),
					target: this
				});
			}
			function raisePrepareEvent(mid) {
				eventManager.raise("prepare", {
					values: modelManager.export(modelManager.currentValuesFor(mid)),
					target: this
				});
			}
			function raiseRestoreEvent(mid) {
				eventManager.raise("restore", {
					values: modelManager.export(modelManager.currentValuesFor(mid)),
					target: this
				});
			}

			function ModelManager() {

				var models = {},
					changedAttributes = {},
					currentAttributes = {},
					defaultAttributes = {},
					validators = {},
					idKeys = {};

				this.allModels = function () {
					return models;
				};
				this.allDefaultAttributes = function () {
					return defaultAttributes;
				};
				this.allChangedAttributes = function () {
					return changedAttributes;
				};
				this.allCurrentAttributes = function () {
					return currentAttributes;
				};
				this.allValidators = function () {
					return validators;
				};
				this.allIdKeys = function () {
					return idKeys;
				};

			}
			ModelManager.prototype.defaultValuesFor = function (mid) {
				return (this.allDefaultAttributes()[mid] || (this.allDefaultAttributes()[mid] = {}));
			};
			ModelManager.prototype.changedValuesFor = function (mid) {
				return (this.allChangedAttributes()[mid] || (this.allChangedAttributes()[mid] = {}));
			};
			ModelManager.prototype.currentValuesFor = function (mid) {
				return (this.allCurrentAttributes()[mid] || (this.allCurrentAttributes()[mid] = {}));
			};
			ModelManager.prototype.validatorsFor = function (mid) {
				return (this.allValidators()[mid] || (this.allValidators()[mid] = {}));
			};
			ModelManager.prototype.getDefaultValue = function (mid, key) {
				return this.defaultValuesFor(mid)[key];
			};
			ModelManager.prototype.setDefaultValue = function (mid, key, value) {
				this.defaultValuesFor(mid)[key] = value;
			};
			ModelManager.prototype.isDefaultValue = function (mid, key, value) {
				return (value === this.getDefaultValue(mid, key));
			};
			ModelManager.prototype.getChangedValue = function (mid, key) {
				return this.changedValuesFor(mid)[key];
			};
			ModelManager.prototype.setChangedValue = function (mid, key, value) {
				this.changedValuesFor(mid)[key] = value;
			};
			ModelManager.prototype.isChangedValue = function (mid, key, value) {
				return (value === this.getChangedValue(mid, key));
			};
			ModelManager.prototype.getCurrentValue = function (mid, key) {
				return this.currentValuesFor(mid)[key];
			};
			ModelManager.prototype.setCurrentValue = function (mid, key, value) {
				this.currentValuesFor(mid)[key] = value;
			};
			ModelManager.prototype.isCurrentValue = function (mid, key, value) {
				return (value === this.getCurrentValue(mid, key));
			};
			ModelManager.prototype.validate = function (mid, key, value) {
				var validator = this.validatorsFor(mid)[key];
				return (validator || false).constructor === Function ? validator(key, value) : true;
			};
			ModelManager.prototype.import = function (toImport) { };
			ModelManager.prototype.export = function (toExport) {
				var key, value, pairs = {};
				for (key in toExport) {
					value = toExport[key];
					pairs[key] = value;
				}
				return pairs;
			};
			ModelManager.prototype.prepare = function (mid, pairs) {
				var key, value;
				for (key in pairs) {
					value = pairs[key];
					this.setDefaultValue(mid, key, value);
					this.setChangedValue(mid, key, value);
					this.setCurrentValue(mid, key, value);
				}
				raisePrepareEvent(mid);
			};
			ModelManager.prototype.restore = function (mid) {
				var pairs = this.currentValuesFor(mid), key, value, changed;
				for (key in pairs) {
					value = pairs[key];
					if (!this.isDefaultValue(mid, key, value)) {
						this.setChangedValue(mid, key, this.getCurrentValue(mid, key));
						this.setCurrentValue(mid, key, this.getDefaultValue(mid, key));
						changed = true;
					}
				}
				if (changed) raiseRestoreEvent(mid);
			};
			ModelManager.prototype.manage = function (mid, model) {
				this.allModels()[mid] = model;
			};
			ModelManager.prototype.getIDKey = function(mid) {
				return (this.allIdKeys()[mid] || "id");
			};
			ModelManager.prototype.setIDKey = function(mid, key) {
				if (typeof key === "string") this.allIdKeys()[mid] = key;
			};
			ModelManager.prototype.get = function (mid, key) {
				key = key === "id" ? this.getIDKey(mid) : key;
				return this.getCurrentValue(mid, key);
			};
			ModelManager.prototype.set = function (mid, key, value) {
				key = key === "id" ? this.getIDKey(mid) : key;
				if (!this.isCurrentValue(mid, key, value)) {
					if (this.validate(mid, key, value)) {
						this.setChangedValue(mid, key, this.getCurrentValue(mid, key));
						this.setCurrentValue(mid, key, value);
						raiseChangeEvent(mid, key);
					}
				}
			};
			ModelManager.prototype.undoOne = function (mid, key) {
				var value;
				key = key === "id" ? this.getIDKey(mid) : key;
				value = this.getChangedValue(mid, key);
				if (!this.isCurrentValue(mid, key, value)) {
					this.setCurrentValue(mid, key, value);
					raiseUndoOneEvent(mid, key);
				}
			};
			ModelManager.prototype.undoAll = function (mid) {
				var pairs = this.changedValuesFor(mid), key, value, changed;
				for (key in pairs) {
					value = pairs[key];
					if (!this.isCurrentValue(mid, key, value)) {
						this.setCurrentValue(mid, key, value);
						changed = true;
					}
				}
				if (changed) raiseUndoAllEvent(mid);
			};

			eventManager = new EventManager();

			return ModelManager;

		}());

		function Model(pairs, idKey) {
			var mid = this.mid();
			modelManager.prepare(mid, pairs);
			if (idKey !== modelManager.getIDKey(mid)) modelManager.setIDKey(mid, idKey);
			modelManager.manage(mid, model);
		}
		Model.prototype.mid = (function () {
			var mid;
			return function () {
				return mid || (mid = createMID(createUID()));
			};
		}());
		Model.prototype.get = function (key) {
			return modelManager.get(this.mid(), key);
		};
		Model.prototype.set = function (key, value) {
			modelManager.set(this.mid(), key, value);
		};
		Model.prototype.undoOne = function (key) {
			modelManager.undoOne(this.mid(), key);
		};
		Model.prototype.undoAll = function () {
			modelManager.undoAll(this.mid());
		};
		Model.prototype.restore = function () {
			modelManager.restore(this.mid());
		};

		modelManager = new ModelManager();

		return Model;

	}());

	function ModelList() { }
	ModelList.prototype.add = function () { };
	ModelList.prototype.remove = function () { };

	function View(model) {
	}

	function ViewList(modelList) { }
	ViewList.prototype.add = function () { };
	ViewList.prototype.remove = function () { };

	function Controller() {
	}

	return {

		Model: Model,
		ModelList: ModelList,
		View: View,
		ViewList: ViewList,
		Controller: Controller


	};

}());