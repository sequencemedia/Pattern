var Pattern = (function () {

	"use strict";

	var Model,
		ModelList,
		createUID;

	function createLID(uid) { return "lid-" + uid; }
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

	var eventManager;

	function EventManager() { }
	EventManager.prototype.publish = function (event, parameters) {

		//console.log(event, parameters);

	};

	var ModelStorage,
		modelStorage,
		ModelListStorage,
		modelListStorage;

	ModelStorage = (function () {

		function ModelStorage() {
			var models = {};
			this.allModels = function () {
				return models;
			};
		}

		return ModelStorage;

	}());

	ModelListStorage = (function () {

		function ModelListStorage() {
			var modelLists = {};
			this.allModelLists = function () {
				return modelLists;
			};
		}

		return ModelListStorage;

	}());

	Model = (function () {

		var ModelManager,
			modelManager;

		ModelManager = (function () {

			function ModelManager() {
				var changedAttributes = {},
					currentAttributes = {},
					defaultAttributes = {},
					validators = {},
					idKeys = {};
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
			ModelManager.prototype.allModels = function () {
				return modelStorage.allModels();
			};
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
			};
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
			};
			ModelManager.prototype.initialize = function (mid, pairs, idKey) {
				var key, value, changedKeys = [];
				for (key in pairs) {
					value = pairs[key];
					this.setDefaultValue(mid, key, value);
					this.setChangedValue(mid, key, value);
					this.setCurrentValue(mid, key, value);
					changedKeys.push(key);
				}
				if (idKey !== this.getIDKey(mid)) this.setIDKey(mid, idKey);
				this.reportAll("initialize", mid, changedKeys);
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
				var currentValues = this.currentValuesFor(mid), key, KEY, value, pairs = {};
				for (key in currentValues) {
					KEY = key === "id" ? this.getIDKey(mid) : key;
					pairs[key] = currentValues[KEY];
				}
				return pairs;
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
				var key, currentValues = this.currentValuesFor(mid), changedKeys = [];
				for (key in currentValues) {
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
				var changedValues, changedKeys, i, j, key, KEY, value;
				if ((keys || false).constructor === Array) {
					changedValues = this.changedValuesFor(mid);
					changedKeys = [];
					for (i = 0, j = keys.length; i < j; i = i + 1) {
						key = keys[i];
						KEY = key === "id" ? this.getIDKey(mid) : key;
						if (KEY in changedValues) { //can't zed unchanged keys
							value = changedValues[KEY];
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
				var key, changedValues = this.changedValuesFor(mid), value, changedKeys = [];
				for (key in changedValues) {
					value = changedValues[key]; //implicitly is changed
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
					currentValues = this.currentValuesFor(mid), value;
				if (KEY in currentValues) {
					value = currentValues[KEY];
					if (!this.isChangedValue(mid, KEY, value)) {
						this.setChangedValue(mid, KEY, value);
					}
					delete currentValues[KEY];
					this.report("change", mid, key);
				}
			};
			ModelManager.prototype.unsetEach = function (mid, keys) {
				var currentValues, changedKeys, i, j, key, KEY, value;
				if ((keys || false).constructor === Array) {
					currentValues = this.currentValuesFor(mid);
					changedKeys = [];
					for (i = 0, j = keys.length; i < j; i = i + 1) {
						key = keys[i];
						KEY = key === "id" ? this.getIDKey(mid) : key;
						if (KEY in currentValues) { //can't zed unknown keys
							value = currentValues[KEY];
							if (!this.isChangedValue(mid, KEY, value)) {
								this.setChangedValue(mid, KEY, value);
							}
							delete currentValues[KEY];
							this.report("change", mid, key);
							changedKeys.push(key);
						}
					}
					if (changedKeys.length > 0) this.report("unsetEach", mid, changedKeys);
				}
			};
			ModelManager.prototype.unsetAll = function (mid) {
				var key, currentValues = this.currentValuesFor(mid), value, /* KEY = this.getIDKey(mid), */ changedKeys = [];
				for (key in currentValues) {
					value = currentValues[key];
					if (!this.isChangedValue(mid, key, value)) {
						this.setChangedValue(mid, key, value);
					}
					delete currentValues[key];
					this.report("change", mid, key);
					changedKeys.push(key);
				}
				if (changedKeys.length > 0) this.report("unsetAll", mid, changedKeys);
			};
			ModelManager.prototype.reset = function (mid, key) {
				var KEY = key === "id" ? this.getIDKey(mid) : key,
					currentValues = this.currentValuesFor(mid), value;
				value = currentValues[KEY];
				if (!this.isDefaultKey(mid, KEY)) { //unset
					if (!this.isChangedValue(mid, KEY, value)) {
						this.setChangedValue(mid, KEY, value);
					}
					delete currentValues[KEY];
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
				var currentValues, changedKeys, i, j, key, KEY, value;
				if ((keys || false).constructor === Array) {
					currentValues = this.currentValuesFor(mid);
					changedKeys = [];
					for (i = 0, j = keys.length; i < j; i = i + 1) {
						key = keys[i];
						KEY = key === "id" ? this.getIDKey(mid) : key;
						value = currentValues[KEY];
						if (!this.isDefaultKey(mid, KEY)) { //unset
							if (!this.isChangedValue(mid, KEY, value)) {
								this.setChangedValue(mid, KEY, value);
							}
							delete currentValues[KEY];
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
				var currentValues = this.currentValuesFor(mid), key, value, KEY, changedKeys = [];
				for (key in currentValues) {
					KEY = key === "id" ? this.getIDKey(mid) : key;
					value = currentValues[KEY];
					if (!this.isDefaultKey(mid, KEY)) { //unset
						if (!this.isChangedValue(mid, KEY, value)) {
							this.setChangedValue(mid, KEY, value);
						}
						delete currentValues[KEY];
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

		function initialize(pairs, idKey) {
			var mid;
			this.mid = (function (mid) {
				return function () {
					return mid;
				};
			}(mid = createMID(createUID())));
			modelManager.manage(mid, this);
			modelManager.initialize(mid, pairs, idKey);
		}

		function Model(pairs, idKey) {
			initialize.call(this, pairs, idKey);
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

	ModelList = (function () {

		var ModelListManager,
			modelListManager;

		ModelListManager = (function () {

			function ModelListManager() {
				var attributes = {};
				this.allAttributes = function () {
					return attributes;
				};
			}
			ModelListManager.prototype.allModelLists = function () {
				return modelListStorage.allModelLists();
			};
			ModelListManager.prototype.manage = function (lid, modelList) {
				(this.allModelLists())[lid] = modelList;
			};
			ModelListManager.prototype.modelListFor = function (lid) {
				var attributes = this.allAttributes();
				return (attributes[lid] || (attributes[lid] = []));
			};
			ModelListManager.prototype.get = function (lid, id) {
				var mid,
					modelList = this.modelListFor(lid),
					allModels = modelStorage.allModels(),
					MODEL, i = 0, j = modelList.length;
				do {
					mid = modelList[i];
					MODEL = allModels[mid];
					if (MODEL.get("id") === id) {
						return MODEL;
					}
				} while (++i < j);
				return null;
			};
			ModelListManager.prototype.set = function (lid, id, model) {
				var mid,
					modelList = this.modelListFor(lid),
					allModels = modelStorage.allModels(),
					MODEL, i = 0, j = modelList.length;
				do {
					mid = modelList[i];
					MODEL = allModels[mid];
					if (MODEL.get("id") === id) {
						modelList.splice(i, 1);
						return;
					}
				} while (++i < j);
				mid = model.mid();
				modelList.push(mid);
			};
			ModelListManager.prototype.all = function (lid) {
				var mid,
					modelList = this.modelListFor(lid),
					allModels = modelStorage.allModels(),
					MODEL, i = 0, j = modelList.length,
					all = [];
				do {
					mid = modelList[i];
					MODEL = allModels[mid];
					all.push(MODEL);
				} while (++i < j);
				return all;
			};
			ModelListManager.prototype.initialize = function (lid, pairsList, idKey) {
				var pairs,
					model,
					id,
					mid,
					modelList,
					allModels,
					i, j,
					n, m,
					MODEL;
				if ((pairsList || false).constructor === Array) {
					modelList = this.modelListFor(lid);
					allModels = modelStorage.allModels();
					for (i = 0, j = pairsList.length; i < j; i = i + 1) {
						pairs = pairsList[i];
						model = new Model(pairs, idKey);
						id = model.get("id");
						for (n = 0, m = modelList.length; n < m; n = n + 1) {
							mid = modelList[n];
							MODEL = allModels[mid];
							if (MODEL.get("id") === id) {
								modelList.splice(n, 1);
								break;
							}
						}
						mid = model.mid();
						modelList.push(mid);
					}
				}
			}

			return ModelListManager;

		}());

		function initialize(pairsList, idKey) {
			var lid;
			this.lid = (function (lid) {
				return function () {
					return lid;
				};
			}(lid = createLID(createUID())));
			modelListManager.manage(lid, this);
			modelListManager.initialize(lid, pairsList, idKey);
		}

		function ModelList(pairsList, idKey) {
			initialize.call(this, pairsList, idKey);
		}
		ModelList.prototype.get = function (id) {
			return modelListManager.get(this.lid(), id);
		};
		ModelList.prototype.set = function (id, model) {
			modelListManager.set(this.lid(), id, model);
		};
		ModelList.prototype.all = function () {
			return modelListManager.all(this.lid());
		};
		ModelList.prototype.add = function (id, model) { };
		ModelList.prototype.remove = function (id) { };
		ModelList.prototype.addEach = function (ids) { };
		ModelList.prototype.removeEach = function (ids) { };

		modelListManager = new ModelListManager();

		return ModelList;

	}());

	function View(model) {
	}

	function ViewList(modelList) { }
	ViewList.prototype.add = function () { };
	ViewList.prototype.remove = function () { };

	function Controller() {
	}

	modelStorage = new ModelStorage();
	modelListStorage = new ModelListStorage();

	return {

		Model: Model,
		ModelList: ModelList,
		View: View,
		ViewList: ViewList,
		Controller: Controller

	};

}());