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
			EventManager.prototype.publish = function (event, parameters) {

				//console.log(event, parameters);

			};

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
			ModelManager.prototype.isDefaultKey = function (mid, key) {
				return (key in this.defaultValuesFor(mid));
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
			ModelManager.prototype.isChangedKey = function (mid, key) {
				return (key in this.changedValuesFor(mid));
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
			ModelManager.prototype.isCurrentKey = function (mid, key) {
				return (key in this.currentValuesFor(mid));
			};
			ModelManager.prototype.isCurrentValue = function (mid, key, value) {
				return (value === this.getCurrentValue(mid, key)) ? true : false;
			};
			ModelManager.prototype.validate = function (mid, key, value) {
				var validator = (this.validatorsFor(mid))[key];
				return (validator || false).constructor === Function ? validator(key, value) : true;
			};
			ModelManager.prototype.report = function (eventType, mid, key) {
				var KEY = key === "id" ? this.getIDKey(mid) : key,
					current = this.getCurrentValue(mid, KEY),
					changed = this.getChangedValue(mid, KEY);
				eventManager.publish(eventType, {
					current: current,
					changed: changed,
					model: (modelManager.allModels())[mid]
				});
			}
			ModelManager.prototype.reportAll = function (eventType, mid, keys) {
				var KEY, key,
					changedValues = this.changedValuesFor(mid),
					currentValues = this.currentValuesFor(mid),
					changed = {},
					current = {};
				while (key = keys.shift()) {
					KEY = key === "id" ? this.getIDKey(mid) : key;
					changed[key] = changedValues[KEY];
					current[key] = currentValues[KEY];
				}
				eventManager.publish(eventType, {
					current: current,
					changed: changed,
					model: (modelManager.allModels())[mid]
				});
			}

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
				this.report("prepare", mid);
			};
			ModelManager.prototype.manage = function (mid, model) {
				(this.allModels())[mid] = model;
			};
			ModelManager.prototype.getIDKey = function (mid) {
				return (this.allIdKeys())[mid] || "id";
			};
			ModelManager.prototype.setIDKey = function (mid, key) {
				if (typeof key === "string") (this.allIdKeys())[mid] = key;
			};
			ModelManager.prototype.get = function (mid, key) {
				var KEY = key === "id" ? this.getIDKey(mid) : key;
				return this.getCurrentValue(mid, KEY);
			};
			ModelManager.prototype.getEach = function (mid, keys) {
				var pairs, i, j, key, KEY;
				if ((keys || false).constructor === Array) {
					pairs = {};
					for (i = 0, j = keys.length; i < j; i = i + 1) {
						key = keys[i];
						KEY = key === "id" ? this.getIDKey(mid) : key;
						pairs[key] = this.getCurrentValue(mid, KEY);
					}
					return pairs;
				}
			};
			ModelManager.prototype.getAll = function (mid) {
				return this.export(this.currentValuesFor(mid));
			};
			ModelManager.prototype.set = function (mid, key, value) {
				var KEY = key === "id" ? this.getIDKey(mid) : key;
				if (!this.isCurrentValue(mid, KEY, value)) {
					if (this.validate(mid, KEY, value)) {
						this.setChangedValue(mid, KEY, this.getCurrentValue(mid, KEY));
						this.setCurrentValue(mid, KEY, value);
						this.report("change", mid, key);
					}
				}
			};
			ModelManager.prototype.setEach = function (mid, pairs) {
				var key, KEY, value, changedKeys;
				if ((pairs || false).constructor === Object) {
					changedKeys = [];
					for (key in pairs) {
						KEY = key === "id" ? this.getIDKey(mid) : key;
						value = pairs[key]; //use external key!
						if (!this.isCurrentValue(mid, KEY, value)) {
							if (this.validate(mid, KEY, value)) {
								this.setChangedValue(mid, KEY, this.getCurrentValue(mid, KEY));
								this.setCurrentValue(mid, KEY, value);
								this.report("change", mid, key);
								changedKeys.push(key);
							}
						}
					}
					if (changedKeys.length > 0) this.reportAll("setEach", mid, changedKeys);
				}
			};
			ModelManager.prototype.setAll = function (mid, value) {
				var key, pairs = this.currentValuesFor(mid), changedKeys = [];
				for (key in pairs) {
					if (!this.isCurrentValue(mid, key, value)) {
						if (this.validate(mid, key, value)) {
							this.setChangedValue(mid, key, this.getCurrentValue(mid, key));
							this.setCurrentValue(mid, key, value);
							this.report("change", mid, key);
							changedKeys.push(key);
						}
					}
				}
				if (changedKeys.length > 0) this.reportAll("setAll", mid, changedKeys);
			};
			ModelManager.prototype.zed = function (mid, key) {
				var KEY = key === "id" ? this.getIDKey(mid) : key,
					value = this.getChangedValue(mid, KEY);
				if (!this.isCurrentValue(mid, KEY, value)) {
					this.setChangedValue(mid, KEY, this.getCurrentValue(mid, KEY));
					this.setCurrentValue(mid, KEY, value);
					this.report("change", mid, key);
				}
			};
			ModelManager.prototype.zedEach = function (mid, keys) {
				var pairs, changedKeys, i, j, key, KEY, value;
				if ((keys || false).constructor === Array) {
					pairs = this.changedValuesFor(mid);
					changedKeys = [];
					for (i = 0, j = keys.length; i < j; i = i + 1) {
						key = keys[i];
						KEY = key === "id" ? this.getIDKey(mid) : key;
						if (KEY in pairs) { //can't zed unknown keys
							value = pairs[KEY];
							if (!this.isCurrentValue(mid, KEY, value)) {
								this.setChangedValue(mid, KEY, this.getCurrentValue(mid, KEY));
								this.setCurrentValue(mid, KEY, value);
								this.report("change", mid, key);
								changedKeys.push(key);
							}
						}
					}
					if (changedKeys.length > 0) this.reportAll("zedEach", mid, changedKeys);
				}
			};
			ModelManager.prototype.zedAll = function (mid) {
				var key, pairs = this.changedValuesFor(mid), value, changedKeys = [];
				for (key in pairs) {
					value = pairs[key]; //implicitly is changed
					if (!this.isCurrentValue(mid, key, value)) {
						this.setChangedValue(mid, key, this.getCurrentValue(mid, key));
						this.setCurrentValue(mid, key, value);
						this.report("change", mid, key);
						changedKeys.push(key);
					}
				}
				if (changedKeys.length > 0) this.reportAll("zedAll", mid, changedKeys);
			};
			ModelManager.prototype.unset = function (mid, key) {
				var KEY = key === "id" ? this.getIDKey(mid) : key,
					pairs = this.currentValuesFor(mid), value;
				if (KEY in pairs) {
					value = pairs[KEY];
					if (!this.isChangedValue(mid, KEY, value)) {
						this.setChangedValue(mid, KEY, value);
					}
					delete pairs[KEY];
					this.report("change", mid, key);
				}
			};
			ModelManager.prototype.unsetEach = function (mid, keys) {
				var pairs, changedKeys, i, j, key, KEY, value;
				if ((keys || false).constructor === Array) {
					pairs = this.currentValuesFor(mid);
					changedKeys = [];
					for (i = 0, j = keys.length; i < j; i = i + 1) {
						key = keys[i];
						KEY = key === "id" ? this.getIDKey(mid) : key;
						if (KEY in pairs) { //can't zed unknown keys
							value = pairs[KEY];
							if (!this.isChangedValue(mid, KEY, value)) {
								this.setChangedValue(mid, KEY, value);
							}
							delete pairs[KEY];
							this.report("change", mid, key);
							changedKeys.push(key);
						}
					}
					if (changedKeys.length > 0) this.report("unsetEach", mid, changedKeys);
				}
			};
			ModelManager.prototype.unsetAll = function (mid) {
				var key, pairs = this.currentValuesFor(mid), value, /* KEY = this.getIDKey(mid), */ changedKeys = [];
				for (key in pairs) {
					value = pairs[key];
					if (!this.isChangedValue(mid, key, value)) {
						this.setChangedValue(mid, key, value);
					}
					delete pairs[key];
					this.report("change", mid, key);
					changedKeys.push(key);
				}
				if (changedKeys.length > 0) this.report("unsetAll", mid, changedKeys);
			};
			ModelManager.prototype.reset = function (mid, key) {
				var KEY = key === "id" ? this.getIDKey(mid) : key,
					pairs = this.currentValuesFor(mid), value;
				value = pairs[KEY];
				if (!this.isDefaultKey(mid, KEY)) { //unset
					if (!this.isChangedValue(mid, KEY, value)) {
						this.setChangedValue(mid, KEY, value);
					}
					delete pairs[KEY];
					this.report("change", mid, key);
				} else {
					if (!this.isDefaultValue(mid, KEY, value)) { //reset
						this.setChangedValue(mid, KEY, value);
						this.setCurrentValue(mid, KEY, this.getDefaultValue(mid, KEY));
						this.report("change", mid, key);
					}
				}
			};
			ModelManager.prototype.resetEach = function (mid, keys) {
				var pairs, changedKeys, i, j, key, KEY, value;
				if ((keys || false).constructor === Array) {
					pairs = this.currentValuesFor(mid);
					changedKeys = [];
					for (i = 0, j = keys.length; i < j; i = i + 1) {
						key = keys[i];
						KEY = key === "id" ? this.getIDKey(mid) : key;
						value = pairs[KEY];
						if (!this.isDefaultKey(mid, KEY)) { //unset
							if (!this.isChangedValue(mid, KEY, value)) {
								this.setChangedValue(mid, KEY, value);
							}
							delete pairs[KEY];
							this.report("change", mid, key);
							changedKeys.push(key);
						} else {
							if (!this.isDefaultValue(mid, KEY, value)) { //reset
								this.setChangedValue(mid, KEY, value);
								this.setCurrentValue(mid, KEY, this.getDefaultValue(mid, KEY));
								this.report("change", mid, key);
								changedKeys.push(key);
							}
						}
					}
					if (changedKeys.length > 0) this.report("resetEach", mid, changedKeys);
				}
			};
			ModelManager.prototype.resetAll = function (mid) {
				var pairs = this.currentValuesFor(mid), key, value, KEY, changedKeys = [];
				for (key in pairs) {
					KEY = key === "id" ? this.getIDKey(mid) : key;
					value = pairs[KEY];
					if (!this.isDefaultKey(mid, KEY)) { //unset
						if (!this.isChangedValue(mid, KEY, value)) {
							this.setChangedValue(mid, KEY, value);
						}
						delete pairs[KEY];
						this.report("change", mid, key);
						changedKeys.push(key);
					} else {
						if (!this.isDefaultValue(mid, KEY, value)) { //reset
							this.setChangedValue(mid, KEY, value);
							this.setCurrentValue(mid, KEY, this.getDefaultValue(mid, KEY));
							this.report("change", mid, key);
							changedKeys.push(key);
						}
					}
				}
				if (changedKeys.length > 0) this.report("resetAll", mid, changedKeys);
			};

			eventManager = new EventManager();

			return ModelManager;

		}());

		function Model(pairs, idKey) {
			this.mid = (function () {
				var mid;
				return function () {
					return mid || (mid = createMID(createUID()));
				};
			}());
			var mid = this.mid();
			modelManager.manage(mid, this);
			modelManager.prepare(mid, pairs);
			if (idKey !== modelManager.getIDKey(mid)) modelManager.setIDKey(mid, idKey);

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