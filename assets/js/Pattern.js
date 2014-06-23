var Pattern = (function () {

	"use strict";

	var Model,
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

			var eventManager;

			function EventManager() { }
			EventManager.prototype.raise = function (type, parameters) { console.log(type, parameters); };

			/*
			function raiseZedEvent(mid, key) {
				eventManager.raise("zed", {
					key: key,
					currentValue: modelManager.getCurrentValue(mid, key),
					changedValue: modelManager.getChangedValue(mid, key),
					target: (modelManager.allModels())[mid]
				});
			}
			*/
			function raiseSetEachEvent(mid) {
				eventManager.raise("setEach", {
					currentValues: modelManager.export(modelManager.currentValuesFor(mid)), // this publishes the cache by reference -- no longer private
					changedValues: modelManager.export(modelManager.changedValuesFor(mid)), // this publishes the cache by reference -- no longer private
					target: (modelManager.allModels())[mid]
				});
			}
			function raiseSetAllEvent(mid) {
				eventManager.raise("setAll", {
					currentValues: modelManager.export(modelManager.currentValuesFor(mid)), // this publishes the cache by reference -- no longer private
					changedValues: modelManager.export(modelManager.changedValuesFor(mid)), // this publishes the cache by reference -- no longer private
					target: (modelManager.allModels())[mid]
				});
			}
			function raiseZedEachEvent(mid) {
				eventManager.raise("zedEach", {
					currentValues: modelManager.export(modelManager.currentValuesFor(mid)), // this publishes the cache by reference -- no longer private
					changedValues: modelManager.export(modelManager.changedValuesFor(mid)), // this publishes the cache by reference -- no longer private
					target: (modelManager.allModels())[mid]
				});
			}
			function raiseZedAllEvent(mid) {
				eventManager.raise("zedAll", {
					currentValues: modelManager.export(modelManager.currentValuesFor(mid)), // this publishes the cache by reference -- no longer private
					changedValues: modelManager.export(modelManager.changedValuesFor(mid)), // this publishes the cache by reference -- no longer private
					target: (modelManager.allModels())[mid]
				});
			}
			function raiseChangeEvent(mid, key) {
				eventManager.raise("change", {
					key: key,
					currentValue: modelManager.getCurrentValue(mid, key),
					changedValue: modelManager.getChangedValue(mid, key),
					target: (modelManager.allModels())[mid]
				});
			}
			function raisePrepareEvent(mid) {
				eventManager.raise("prepare", {
					values: modelManager.export(modelManager.currentValuesFor(mid)),
					target: (modelManager.allModels())[mid]
				});
			}
			/*
			function raiseUnsetEvent(mid, key) {
				eventManager.raise("unset", {
					key: key,
					currentValue: modelManager.getCurrentValue(mid, key),
					changedValue: modelManager.getChangedValue(mid, key),
					target: (modelManager.allModels())[mid]
				});
			}
			*/
			function raiseUnsetEachEvent(mid) {
				eventManager.raise("unsetEach", {
					changedValues: modelManager.export(modelManager.changedValuesFor(mid)),
					currentValues: modelManager.export(modelManager.currentValuesFor(mid)),
					target: (modelManager.allModels())[mid]
				});
			}
			function raiseUnsetAllEvent(mid) {
				eventManager.raise("unsetAll", {
					changedValues: modelManager.export(modelManager.changedValuesFor(mid)),
					currentValues: modelManager.export(modelManager.currentValuesFor(mid)),
					target: (modelManager.allModels())[mid]
				});
			}
			/*
			function raiseResetEvent(mid, key) {
				eventManager.raise("reset", {
					key: key,
					currentValue: modelManager.getCurrentValue(mid, key),
					changedValue: modelManager.getChangedValue(mid, key),
					target: (modelManager.allModels())[mid]
				});
			}
			*/
			function raiseResetEachEvent(mid) {
				eventManager.raise("resetEach", {
					changedValues: modelManager.export(modelManager.changedValuesFor(mid)),
					currentValues: modelManager.export(modelManager.currentValuesFor(mid)),
					target: (modelManager.allModels())[mid]
				});
			}
			function raiseResetAllEvent(mid) {
				eventManager.raise("resetAll", {
					changedValues: modelManager.export(modelManager.changedValuesFor(mid)),
					currentValues: modelManager.export(modelManager.currentValuesFor(mid)),
					target: (modelManager.allModels())[mid]
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
				var defaultAttributes = this.allDefaultAttributes();
				return (defaultAttributes[mid] || (defaultAttributes[mid] = {}));
			};
			ModelManager.prototype.changedValuesFor = function (mid) {
				var changedAttributes = this.allChangedAttributes();
				return (changedAttributes[mid] || (changedAttributes[mid] = {}));
			};
			ModelManager.prototype.currentValuesFor = function (mid) {
				var currentAttributes = this.allCurrentAttributes();
				return (currentAttributes[mid] || (currentAttributes[mid] = {}));
			};
			ModelManager.prototype.validatorsFor = function (mid) {
				var validators = this.allValidators();
				return (validators[mid] || (validators[mid] = {}));
			};
			ModelManager.prototype.getDefaultValue = function (mid, key) {
				return (this.defaultValuesFor(mid))[key];
			};
			ModelManager.prototype.setDefaultValue = function (mid, key, value) {
				(this.defaultValuesFor(mid))[key] = value;
			};
			ModelManager.prototype.isDefaultValue = function (mid, key, value) {
				return (value === this.getDefaultValue(mid, key)) ? true : false;
			};
			ModelManager.prototype.getChangedValue = function (mid, key) {
				return (this.changedValuesFor(mid))[key];
			};
			ModelManager.prototype.setChangedValue = function (mid, key, value) {
				(this.changedValuesFor(mid))[key] = value;
			};
			ModelManager.prototype.isChangedValue = function (mid, key, value) {
				return (value === this.getChangedValue(mid, key)) ? true : false;
			};
			ModelManager.prototype.getCurrentValue = function (mid, key) {
				return (this.currentValuesFor(mid))[key];
			};
			ModelManager.prototype.setCurrentValue = function (mid, key, value) {
				(this.currentValuesFor(mid))[key] = value;
			};
			ModelManager.prototype.isCurrentValue = function (mid, key, value) {
				return (value === this.getCurrentValue(mid, key)) ? true : false;
			};
			ModelManager.prototype.validate = function (mid, key, value) {
				var validator = (this.validatorsFor(mid))[key];
				return (validator || false).constructor === Function ? validator(key, value) : true;
			};
			ModelManager.prototype.import = function (toImport, pairs) { };
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
			ModelManager.prototype.manage = function (mid, model) {
				(this.allModels())[mid] = model;
			};
			ModelManager.prototype.getIDKey = function(mid) {
				return (this.allIdKeys())[mid] || "id";
			};
			ModelManager.prototype.setIDKey = function(mid, key) {
				if (typeof key === "string") (this.allIdKeys())[mid] = key;
			};
			ModelManager.prototype.get = function (mid, key) {
				key = key === "id" ? this.getIDKey(mid) : key;
				return this.getCurrentValue(mid, key);
			};
			ModelManager.prototype.getEach = function (mid, keys) {
				var key, pairs;
				if ((keys || false).constructor === Array) {
					pairs = {};
					while (key = keys.shift()) {
						pairs[key] = this.get(mid, key);
					}
					return pairs;
				}
			};
			ModelManager.prototype.getAll = function (mid) {
				return this.export(this.currentValuesFor(mid));
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
			ModelManager.prototype.setEach = function (mid, pairs) {
				var key, value, changed;
				if ((pairs || false).constructor === Object) {
					for (key in pairs) {
						key = key === "id" ? this.getIDKey(mid) : key;
						value = pairs[key];
						if (!this.isCurrentValue(mid, key, value)) {
							if (this.validate(mid, key, value)) {
								this.setChangedValue(mid, key, this.getCurrentValue(mid, key));
								this.setCurrentValue(mid, key, value);
								raiseChangeEvent(mid, key);
								changed = true;
							}
						}
					}
					if (changed) raiseSetEachEvent(mid, key);
				}
			};
			ModelManager.prototype.setAll = function (mid, value) {
				var key, pairs = this.currentValuesFor(mid), changed;
				for (key in pairs) {
					key = key === "id" ? this.getIDKey(mid) : key;
					if (!this.isCurrentValue(mid, key, value)) {
						if (this.validate(mid, key, value)) {
							this.setChangedValue(mid, key, this.getCurrentValue(mid, key));
							this.setCurrentValue(mid, key, value);
							raiseChangeEvent(mid, key);
							changed = true;
						}
					}
				}
				if (changed) raiseSetAllEvent(mid, key);
			};
			ModelManager.prototype.zed = function (mid, key) {
				var value = this.getChangedValue(mid, key);
				if (!this.isCurrentValue(mid, key, value)) {
					this.setChangedValue(mid, key, this.getCurrentValue(mid, key));
					this.setCurrentValue(mid, key, value);
					raiseChangeEvent(mid, key);
				}
			};
			ModelManager.prototype.zedEach = function (mid, keys) {
				var key, pairs = this.changedValuesFor(mid), value, changed;
				if ((keys || false).constructor === Array) {
					while (key = keys.shift()) {
						//console.log(key, key in pairs, !this.isCurrentValue(mid, key, value));
						if (key in pairs) { //can't zed unknown keys
							value = pairs[key];
							if (!this.isCurrentValue(mid, key, value)) {
								this.setChangedValue(mid, key, this.getCurrentValue(mid, key));
								this.setCurrentValue(mid, key, value);
								raiseChangeEvent(mid, key);
								changed = true;
							}
						}
					}
					if (changed) raiseZedEachEvent(mid, keys);
				}
			};
			ModelManager.prototype.zedAll = function (mid) {
				var key, pairs = this.changedValuesFor(mid), value, changed;
				for (key in pairs) {
					value = pairs[key]; //implicitly is changed
					if (!this.isCurrentValue(mid, key, value)) {
						this.setChangedValue(mid, key, this.getCurrentValue(mid, key));
						this.setCurrentValue(mid, key, value);
						raiseChangeEvent(mid, key);
						changed = true;
					}
				}
				if (changed) raiseZedAllEvent(mid, key);
			};
			ModelManager.prototype.unset = function (mid, key) {
				var pairs = this.currentValuesFor(mid), value;
				if (key in pairs) {
					value = pairs[key];
					if (!this.isChangedValue(mid, key, value)) {
						this.setChangedValue(mid, key, value);
					}
					delete pairs[key];
					raiseChangeEvent(mid, key);
				}
			};
			ModelManager.prototype.unsetEach = function (mid, keys) {
				var key, pairs = this.currentValuesFor(mid), value, changed;
				if ((keys || false).constructor === Array) {
					while (key = keys.shift()) { //can't zed unknown keys
						if (key in pairs) {
							if (!this.isChangedValue(mid, key, value)) {
								this.setChangedValue(mid, key, value);
							}
							delete pairs[key];
							raiseChangeEvent(mid, key);
							changed = true;
						}
					}
					if (changed) raiseUnsetEachEvent(mid, keys);
				}
			};
			ModelManager.prototype.unsetAll = function (mid) {
				var pairs = this.currentValuesFor(mid), key, value, changed;
				for (key in pairs) {
					value = pairs[key];
					if (!this.isChangedValue(mid, key, value)) {
						this.setChangedValue(mid, key, value);
					}
					delete pairs[key];
					raiseChangeEvent(mid, key);
					changed = true;
				}
				if (changed) raiseUnsetAllEvent(mid);
			};
			ModelManager.prototype.reset = function (mid, key) {
				var pairs = thid.defaultValuesFor(mid), value;
				if (key in pairs) {
					value = pairs[key];
					if (!this.isCurrentValue(mid, key, value)) {
						this.setChangedValue(mid, key, this.getCurrentValue(mid, key));
						this.setCurrentValue(mid, key, value);
						raiseChangeEvent(mid, key);
					}
				}
			};
			ModelManager.prototype.resetEach = function (mid, keys) {
				var key, pairs = this.defaultValuesFor(mid), value, changed;
				if ((keys || false).constructor === Array) {
					while (key = keys.shift()) {
						if (key in pairs) { //can't zed unknown keys
							value = pairs[key];
							if (!this.isCurrentValue(mid, key, value)) {
								this.setChangedValue(mid, key, this.getCurrentValue(mid, key));
								this.setCurrentValue(mid, key, value);
								raiseChangeEvent(mid, key);
								changed = true;
							}
						}
					}
					if (changed) raiseResetEachEvent(mid, keys);
				}
			};
			ModelManager.prototype.resetAll = function (mid) {
				var pairs = this.defaultValuesFor(mid), key, value, changed;
				for (key in pairs) {
					value = pairs[key];
					if (!this.isCurrentValue(mid, key, value)) {
						this.setChangedValue(mid, key, this.getCurrentValue(mid, key));
						this.setCurrentValue(mid, key, value);
						raiseChangeEvent(mid, key);
						changed = true;
					}
				}
				if (changed) raiseResetAllEvent(mid);
			};

			eventManager = new EventManager();

			return ModelManager;

		}());

		function Model(pairs, idKey) {
			var mid = this.mid();
			modelManager.prepare(mid, pairs);
			if (idKey !== modelManager.getIDKey(mid)) modelManager.setIDKey(mid, idKey);
			modelManager.manage(mid, this);
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