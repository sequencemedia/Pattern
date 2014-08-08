var Pattern = (function () {

	"use strict";

	var ModelManager,
		modelManager,
		ModelStorage,
		modelStorage,
		ModelListManager,
		modelListManager,
		ModelListStorage,
		modelListStorage,
		ViewManager,
		viewManager,
		ViewStorage,
		viewStorage,
		ViewListManager,
		viewListManager,
		ViewListStorage,
		viewListStorage,
		Model,
		ModelList,
		View,
		ViewList,
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

	function Predicates() {
		var predicates = {};
		this.allPredicates = function () {
			return predicates;
		};
	}
	Predicates.prototype.predicatesFor = function (uid) {
		var predicates = this.allPredicates();
		return (predicates[uid] || (predicates[uid] = {}));
	};
	Predicates.prototype.get = function (uid, key) {
		return (this.predicatesFor(uid))[key];
	};
	Predicates.prototype.set = function (uid, key, value) {
		(this.predicatesFor(uid))[key] = value;
	};

	ModelManager = (function () {

		function ModelManager() {
			var predicates = new Predicates(),
				defaultAttributes = {},
				changedAttributes = {},
				currentAttributes = {},
				validators = {},
				idKeys = {};
			this.predicates = function () {
				return predicates;
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
		ModelManager.prototype.allModels = function () {
			return modelStorage.allModels();
		};
		ModelManager.prototype.allPredicates = function () {
			return this.predicates().allPredicates();
		};
		ModelManager.prototype.predicatesFor = function (mid) {
			return this.predicates().predicatesFor(mid);
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
		ModelManager.prototype.forget = function (mid) {
			delete (this.allPredicates())[mid];
			delete (this.allCurrentAttributes())[mid];
			delete (this.allChangedAttributes())[mid];
			delete (this.allDefaultAttributes())[mid];
			delete (this.allValidators())[mid];
			delete (this.allIdKeys())[mid];
			delete (this.allModels())[mid];
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
			var currentValues = this.currentValuesFor(mid), key, KEY, pairs = {};
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
		ModelManager.prototype.ancestor = function (mid, model) {
			var uid = (model) ? model.mid() : null;
			return (uid) ? this.predicates().set(mid, "ancestor", uid) :
			(uid = this.predicates().get(mid, "ancestor")) ? (this.allModels())[uid] : null;
		};

		eventManager = new EventManager();

		return ModelManager;

	}());

	ModelStorage = (function () {

		function ModelStorage() {
			var models = {};
			this.allModels = function () {
				return models;
			};
		}

		return ModelStorage;

	}());

	ModelListManager = (function () {

		function ModelListManager() {
			var predicates = new Predicates(),
				attributes = {};
			this.allAttributes = function () {
				return attributes;
			};
			this.predicates = function () {
				return predicates;
			};
		}
		ModelListManager.prototype.allModels = function () {
			return modelStorage.allModels();
		};
		ModelListManager.prototype.allModelLists = function () {
			return modelListStorage.allModelLists();
		};
		ModelListManager.prototype.allPredicates = function () {
			return this.predicates().allPredicates();
		};
		ModelListManager.prototype.predicatesFor = function (lid) {
			return this.predicates().predicatesFor(lid);
		};
		ModelListManager.prototype.manage = function (lid, modelList) {
			(this.allModelLists())[lid] = modelList;
		};
		ModelListManager.prototype.forget = function (lid) {
			delete (this.allPredicates())[lid];
			delete (this.allAttributes())[lid];
			delete (this.allModelLists())[lid];
		};
		ModelListManager.prototype.modelListFor = function (lid) {
			var attributes = this.allAttributes();
			return (attributes[lid] || (attributes[lid] = []));
		};
		ModelListManager.prototype.get = function (lid, index) {
			var modelList,
				i, j,
				upperBound,
				lowerBound,
				mid;
			if (typeof index === "number") {
				modelList = this.modelListFor(lid);
				i = 0;
				j = modelList.length;
				if (i < j) {
					upperBound = j - 1;
					lowerBound = 0;
					if (!(index > upperBound || index < lowerBound)) {
						mid = modelList[index];
						return (this.allModels())[mid];
					}
				}
			}
			return null;
		};
		ModelListManager.prototype.set = function (lid, index, model) {
			var modelList,
				i, j,
				upperBound,
				lowerBound,
				mid;
			if (typeof index === "number") {
				modelList = this.modelListFor(lid);
				i = 0;
				j = modelList.length;
				mid = model.mid();
				if (i === j) {
					modelList.push(mid);
				} else {
					upperBound = j - 1; //no need to max() because j > 0
					lowerBound = 0;
					index = index > upperBound ? j : index < lowerBound ? lowerBound : index ;
					do {
						if (modelList[i] === mid) {
							if (i === index) return ;
							modelList.splice(i, 1);
							break;
						}
					} while (++i < j);
					modelList.splice(index, 0, mid);
				}
			}
		};
		ModelListManager.prototype.add = function (lid, model) {
			var modelList = this.modelListFor(lid),
				i = 0, j = modelList.length,
				mid = model.mid();
			if (i < j) {
				do {
					if (modelList[i] === mid) return ;
				} while (++i < j);
			}
			modelList.push(mid);
		};
		ModelListManager.prototype.addEach = function (lid, array) {
			var modelList,
				i, j,
				mid,
				model;
			if ((array || false).constructor === Array) {
				modelList = this.modelListFor(lid);
				i = 0;
				j = modelList.length;
				if (i < j) {

				} else { //only add but dedupe

				}
			}
		};
		ModelListManager.prototype.remove = function (lid, model) {
			var modelList = this.modelListFor(lid),
				i = 0, j = modelList.length,
				mid;
			if (i < j) {
				mid = model.mid();
				do {
					if (modelList[i] === mid) {
						modelList.splice(i, 1);
						break;
					}
				} while (++i < j);
			}
		};
		ModelListManager.prototype.removeEach = function (lid, array) {
			var modelList,
				i, j,
				mid,
				model;
			if ((array || false).constructor === Array) {
				modelList = this.modelListFor(lid);
				i = 0;
				j = modelList.length;
				if (i < j) {

				} // nothing to remove
			}
		};
		ModelListManager.prototype.all = function (lid) {
			var modelList = this.modelListFor(lid),
				i = 0, j = modelList.length, all = [],
				allModels,
				mid,
				model;
			if (i < j) {
				allModels = this.allModels();
				do {
					mid = modelList[i];
					model = allModels[mid];
					all.push(model);
				} while (++i < j);
			}
			return all;
		};
		ModelListManager.prototype.inheritAll = (function () {
			function hasValue(array, value) {
				var i = 0, j = array.length;
				do {
					if (array[i] === value) return true ;
				} while (++i < j);
				return false;
			}
			return function (alpha, omega) { //lid, lid
				var alphaList = this.modelListFor(alpha),
					omegaList = this.modelListFor(omega),
					n = alphaList.length, mid;
				while (n--) { //reverse and unshift
					mid = alphaList[n];
					if (hasValue(omegaList, mid) === false) {
						omegaList.unshift(mid);
					}
				}
			};
		}());
		ModelListManager.prototype.indexOf = function (lid, model) {
			var modelList = this.modelListFor(lid),
				i = 0, j = modelList.length,
				mid;
			if (i < j) {
				mid = model.mid();
				do {
					if (modelList[i] === mid) return i;
				} while (++i < j);
			}
			return -1;
		};
		ModelListManager.prototype.ancestor = function (mid, modelList) {
			var uid = (modelList) ? modelList.lid() : null;
			return (uid) ? this.predicates().set(mid, "ancestor", uid) :
			(uid = this.predicates().get(mid, "ancestor")) ? (this.allModelLists())[uid] : null;
		};
		ModelListManager.prototype.initialize = function (lid, pairsList, idKey) {
			var pairs,
				model,
				mid,
				modelList,
				allModels,
				i, j;
			if ((pairsList || false).constructor === Array) {
				modelList = this.modelListFor(lid);
				allModels = this.allModels();
				for (i = 0, j = pairsList.length; i < j; i = i + 1) {
					pairs = pairsList[i];
					model = new Model(pairs, idKey);
					mid = model.mid();
					modelList.push(mid);
				}
			}
		};

		return ModelListManager;

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

	ViewManager = (function () {

		function ViewManager() {
			var predicates = new Predicates(),
				attributes = {};
			this.allAttributes = function () {
				return attributes;
			};
			this.predicates = function () {
				return predicates;
			};
		}
		ViewManager.prototype.allViews = function () {
			return viewStorage.allViews();
		};
		ViewManager.prototype.allModels = function () {
			return modelStorage.allModels();
		};
		ViewManager.prototype.allPredicates = function () {
			return this.predicates().allPredicates();
		};
		ViewManager.prototype.predicatesFor = function (vid) {
			return this.predicates().predicatesFor(vid);
		};
		ViewManager.prototype.manage = function (vid, view) {
			(this.allViews())[vid] = view;
		};
		ViewManager.prototype.forget = function (vid) {
			delete (this.allPredicates())[vid];
			delete (this.allAttributes())[vid];
			delete (this.allViews())[vid];
		};
		ViewManager.prototype.attributesFor = function (vid) {
			return (this.allAttributes())[vid] || ((this.allAttributes())[vid] = {});
		};
		ViewManager.prototype.ancestor = function (vid, view) {
			var uid = (view) ? view.vid() : null;
			return (uid) ? this.predicates().set(vid, "ancestor", uid) :
			(uid = this.predicates().get(vid, "ancestor")) ? (this.allViews())[uid] : null;
		};
		ViewManager.prototype.model = function (vid, model) {
			var mid = (model) ? model.mid() : null;
			return (mid) ? this.predicates().set(vid, "model", mid) :
			(mid = this.predicates().get(vid, "model")) ? (this.allModels())[mid] : null;
		};
		ViewManager.prototype.initialize = function (vid, model) {
			if (model instanceof Model) {
				this.model(vid, model);
			}
		};

		return ViewManager;

	}());

	ViewStorage = (function () {

		function ViewStorage() {
			var views = {};
			this.allViews = function () {
				return views;
			};
		}

		return ViewStorage;

	}());

	ViewListManager = (function () {

		function ViewListManager() {
			var predicates = new Predicates(),
				attributes = {};
			this.allAttributes = function () {
				return attributes;
			};
			this.predicates = function () {
				return predicates;
			};
		}
		ViewListManager.prototype.allViewLists = function () {
			return viewListStorage.allViewLists();
		};
		ViewListManager.prototype.allModelLists = function () {
			return modelListStorage.allModelLists();
		};
		ViewListManager.prototype.allPredicates = function () {
			return this.predicates().allPredicates();
		};
		ViewListManager.prototype.predicatesFor = function (lid) {
			return this.predicates().predicatesFor(lid);
		};
		ViewListManager.prototype.manage = function (lid, viewList) {
			(this.allViewLists())[lid] = viewList;
		};
		ViewListManager.prototype.forget = function (lid) {
			delete (this.allPredicates())[lid];
			delete (this.allAttributes())[lid];
			delete (this.allViewLists())[lid];
		};
		ViewListManager.prototype.viewListFor = function (lid) {
			var attributes = this.allAttributes();
			return (attributes[lid] || (attributes[lid] = []));
		};
		ViewListManager.prototype.get = function (lid, index) {
			var viewList,
				i, j,
				upperBound,
				lowerBound,
				vid;
			if (typeof index === "number") {
				viewList = this.viewListFor(lid);
				i = 0;
				j = viewList.length;
				if (i < j) {
					upperBound = j - 1;
					lowerBound = 0;
					if (!(index > upperBound || index < lowerBound)) {
						vid = viewList[index];
						return (viewStorage.allViews())[vid];
					}
				}
			}
			return null;
		};
		ViewListManager.prototype.set = function (lid, index, view) {
			var viewList,
				i, j,
				upperBound,
				lowerBound,
				vid;
			if (typeof index === "number") {
				viewList = this.viewListFor(lid);
				i = 0;
				j = viewList.length;
				vid = view.vid();
				if (i === j) {
					viewList.push(vid);
				} else {
					upperBound = j - 1;
					lowerBound = 0;
					index = index > upperBound ? j : index < lowerBound ? lowerBound : index ;
					do {
						if (viewList[i] === vid) {
							if (i === index) return ;
							viewList.splice(i, 1);
							break;
						}
					} while (++i < j);
					viewList.splice(index, 0, vid);
				}
			}
		};
		ViewListManager.prototype.add = function (lid, view) {
			var viewList = this.viewListFor(lid),
				i = 0, j = viewList.length,
				vid = view.vid();
			if (i < j) {
				do {
					if (viewList[i] === vid) return ;
				} while (++i < j);
			}
			viewList.push(vid);
		};
		ViewListManager.prototype.remove = function (lid, view) {
			var viewList = this.viewListFor(lid),
				i = 0, j = viewList.length,
				vid;
			if (i < j) {
				vid = view.vid();
				do {
					if (viewList[i] === vid) {
						viewList.splice(i, 1);
						break;
					}
				} while (++i < j);
			}
		};
		ViewListManager.prototype.all = function (lid) {
			var viewList = this.viewListFor(lid),
				i = 0, j = viewList.length, all = [],
				allViews,
				vid,
				view;
			if (i < j) {
				allViews = viewStorage.allViews();
				do {
					vid = viewList[i];
					view = allViews[vid];
					all.push(view);
				} while (++i < j);
			}
			return all;
		};
		ViewListManager.prototype.indexOf = function (lid, view) {
			var viewList = this.viewListFor(lid),
				i = 0, j = viewList.length,
				vid;
			if (i < j) {
				vid = view.vid();
				do {
					if (viewList[i] === vid) return i;
				} while (++i < j);
			}
			return -1;
		};
		ViewListManager.prototype.ancestor = function (lid, viewList) {
			var uid = (viewList) ? viewList.lid() : null;
			return (uid) ? this.predicates().set(lid, "ancestor", uid) :
			(uid = this.predicates().get(lid, "ancestor")) ? (this.allViewLists())[uid] : null;
		};
		ViewListManager.prototype.modelList = function (lid, modelList) {
			var uid = (modelList) ? modelList.lid() : null;
			return (uid) ? this.predicates().set(lid, "modelList", uid) :
			(uid = this.predicates().get(lid, "modelList")) ? (this.allModelLists())[uid] : null;
		};
		ViewListManager.prototype.initialize = function (lid, modelList) {
			var viewList,
				allModels,
				i, j,
				model,
				view,
				vid;
			if (modelList instanceof ModelList) {
				this.modelList(lid, modelList);
				viewList = this.viewListFor(lid);
				allModels = modelList.all();
				for (i = 0, j = allModels.length; i < j; i = i + 1) {
					model = allModels[i];
					view = new View(model);
					vid = view.vid();
					viewList.push(vid);
				}
			}
		};

		return ViewListManager;

	}());

	ViewListStorage = (function () {

		function ViewListStorage() {
			var viewLists = {};
			this.allViewLists = function () {
				return viewLists;
			};
		}

		return ViewListStorage;

	}());

	Model = (function () {

		var descendant = (function () {
			var hasKey = Object.prototype.hasOwnProperty;
			function inheritAll(alpha, omega) {
				var key;
				alpha = (alpha || false).constructor === Object ? alpha : {};
				omega = (omega || false).constructor === Object ? omega : {};
				for (key in alpha) {
					if (hasKey.call(alpha, key) === true) {
						if (hasKey.call(omega, key) === false) {
							omega[key] = alpha[key];
						}
					}
				}
				return omega;
			}
			function inherit(alpha, omega) {
				var key;
				for (key in alpha) {
					if (hasKey.call(alpha, key) === true) {
						if (hasKey.call(omega, key) === false) {
							omega[key] = alpha[key];
						}
					}
				}
				return omega;
			}
			function initialize(ancestor, pairs, idKey) {
				ancestor.constructor.call(this, pairs, idKey);
				modelManager.ancestor(this.mid(), ancestor);
			}
			return function (pairs, idKey) {

				return (function (ancestor, ancestorPairs, ancestorIdKey) {

					var prototype = new ancestor.constructor();

					function Model(pairs, idKey) {
						initialize.call(this, ancestor, inheritAll(ancestorPairs, pairs), idKey || ancestorIdKey);
					}
					Model.prototype = prototype;
					Model.prototype.ancestor = function () {
						return modelManager.ancestor(this.mid());
					};

					modelManager.forget(prototype.mid());

					return inherit(ancestor.constructor, Model);

				}(this instanceof Model ? this : new this(pairs, idKey), pairs, idKey));

			};
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
		Model.prototype.descendant = descendant;

		Model.descendant = descendant;

		return Model;

	}());

	ModelList = (function () {

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
		ModelList.prototype.descendant = (function () {
			var hasKey = Object.prototype.hasOwnProperty;
			function hasValue(array, value) {
				var i = 0, j = array.length;
				do {
					if (array[i] === value) return true ;
				} while (++i < j);
				return false;
			}
			function inherit(alpha, omega) {
				var key;
				for (key in alpha) {
					if (hasKey.call(alpha, key) === true) {
						if (hasKey.call(omega, key) === false) {
							omega[key] = alpha[key];
						}
					}
				}
				return omega;
			}
			function inheritAll(alpha, omega) {
				var n, value;
				alpha = (alpha || false).constructor === Array ? alpha : [];
				omega = (omega || false).constructor === Array ? omega : [];
				n = alpha.length;
				while (n--) {
					value = alpha[n];
					if (hasValue(omega, value) === false) {
						omega.unshift(value);
					}
				}
				return omega;
			}
			function initialize(ancestor, pairsList, idKey) {
				var lid;
				ancestor.constructor.call(this, pairsList, idKey);
				modelListManager.ancestor(lid = this.lid(), ancestor);
				modelListManager.inheritAll(ancestor.lid(), lid);
			}
			return function (pairsList, idKey) {

				return (function (ancestor, ancestorPairsList, ancestorIdKey) {

					var prototype = new ancestor.constructor();

					function ModelList(pairsList, idKey) {
						initialize.call(this, ancestor, inheritAll(ancestorPairsList, pairsList), idKey || ancestorIdKey);
					}
					ModelList.prototype = ancestor;
					ModelList.prototype.ancestor = function () {
						return modelListManager.ancestor(this.lid());
					};

					modelListManager.forget(prototype.lid());

					return inherit(ancestor.constructor, ModelList);

				}(this, pairsList, idKey));

			};
		}());

		ModelList.descendant = (function () {
			var hasKey = Object.prototype.hasOwnProperty;
			function hasValue(array, value) {
				var i = 0, j = array.length;
				do {
					if (array[i] === value) return true ;
				} while (++i < j);
				return false;
			}
			function inherit(alpha, omega) {
				var key;
				for (key in alpha) {
					if (hasKey.call(alpha, key) === true) {
						if (hasKey.call(omega, key) === false) {
							omega[key] = alpha[key];
						}
					}
				}
				return omega;
			}
			function inheritAll(alpha, omega) {
				var n, value;
				alpha = (alpha || false).constructor === Array ? alpha : [];
				omega = (omega || false).constructor === Array ? omega : [];
				n = alpha.length;
				while (n--) {
					value = alpha[n];
					if (hasValue(omega, value) === false) {
						omega.unshift(value);
					}
				}
				return omega;
			}
			function initialize(ancestor, pairsList, idKey) {
				ancestor.constructor.call(this, pairsList, idKey);
				modelListManager.ancestor(this.lid(), ancestor);
			}
			return function (pairsList, idKey) {

				return (function (ancestor, ancestorPairsList, ancestorIdKey) {

					var prototype = new ancestor.constructor();

					function ModelList(pairsList, idKey) {
						initialize.call(this, ancestor, inheritAll(ancestorPairsList, pairsList), idKey || ancestorIdKey);
					}
					ModelList.prototype = ancestor;
					ModelList.prototype.ancestor = function () {
						return modelListManager.ancestor(this.lid());
					};

					modelListManager.forget(prototype.lid());

					return inherit(ancestor.constructor, ModelList);

				}(new this(pairsList, idKey), pairsList, idKey));

			};
		}());

		return ModelList;

	}());

	View = (function () {

		var descendant = (function () {
			var hasKey = Object.prototype.hasOwnProperty;
			function inherit(alpha, omega) {
				var key;
				for (key in alpha) {
					if (hasKey.call(alpha, key) === true) {
						if (hasKey.call(omega, key) === false) {
							omega[key] = alpha[key];
						}
					}
				}
				return omega;
			}
			function initialize(ancestor, model) {
				ancestor.constructor.call(this, model);
				viewManager.ancestor(this.vid(), ancestor);
			}
			return function (model) {

				return (function (ancestor, ancestorModel) {

					var prototype = new ancestor.constructor();

					function View(model) { //ancestor.constructor.call(this, model);
						initialize.call(this, ancestor, model || ancestorModel);
					}
					View.prototype = prototype;
					View.prototype.ancestor = function () {
						return viewManager.ancestor(this.vid());
					};

					viewManager.forget(prototype.vid());

					return inherit(ancestor.constructor, View);

				}(this instanceof View ? this : new this(model), model));

			};
		}());

		function initialize(model) {
			var vid;
			this.vid = (function (vid) {
				return function () {
					return vid;
				};
			}(vid = createVID(createUID())));
			viewManager.manage(vid, this);
			viewManager.initialize(vid, model);
		}

		function View(model) {
			initialize.call(this, model);
		}
		View.prototype.model = function () {
			return viewManager.model(this.vid());
		};
		View.prototype.descendant = descendant;

		View.descendant = descendant;

		return View;

	}());

	ViewList = (function () {

		var descendant = (function () {
			var hasKey = Object.prototype.hasOwnProperty;
			function inherit(alpha, omega) {
				var key;
				for (key in alpha) {
					if (hasKey.call(alpha, key) === true) {
						if (hasKey.call(omega, key) === false) {
							omega[key] = alpha[key];
						}
					}
				}
				return omega;
			}
			function initialize(ancestor, modelList) {
				ancestor.constructor.call(this, modelList);
				viewListManager.ancestor(this.lid(), ancestor);
			}
			return function (modelList) {

				return (function (ancestor, ancestorModelList) {

					var prototype = new ancestor.constructor();

					function ViewList(modelList) {
						initialize.call(this, ancestor, modelList || ancestorModelList);
					}
					ViewList.prototype = prototype;
					ViewList.prototype.ancestor = function () {
						return viewListManager.ancestor(this.lid());
					};

					viewListManager.forget(prototype.lid());

					return inherit(ancestor.constructor, ViewList);

				}(this instanceof ViewList ? this : new this(modelList), modelList));

			};
		}());

		function initialize(modelList) {
			var lid;
			this.lid = (function (lid) {
				return function () {
					return lid;
				};
			}(lid = createLID(createUID())));
			viewListManager.manage(lid, this);
			viewListManager.initialize(lid, modelList);
		}

		function ViewList(modelList) {
			initialize.call(this, modelList);
		}
		ViewList.prototype.get = function (index) {
			return viewListManager.get(this.lid(), index);
		};
		ViewList.prototype.set = function (index, view) {
			viewListManager.set(this.lid(), index, view);
		};
		ViewList.prototype.add = function (view) {
			viewListManager.add(this.lid(), view);
		};
		ViewList.prototype.remove = function (view) {
			viewListManager.remove(this.lid(), view);
		};
		ViewList.prototype.all = function () {
			return viewListManager.all(this.lid());
		};
		ViewList.prototype.indexOf = function (view) {
			return viewListManager.indexOf(this.lid(), view);
		};
		ViewList.prototype.modelList = function () {
			return viewListManager.modelList(this.lid());
		};
		ViewList.prototype.descendant = descendant;

		ViewList.descendant = descendant;

		return ViewList;

	}());

	function Controller() {}

	modelManager = new ModelManager();
	modelStorage = new ModelStorage();
	modelListManager = new ModelListManager();
	modelListStorage = new ModelListStorage();
	viewManager = new ViewManager();
	viewStorage = new ViewStorage();
	viewListManager = new ViewListManager();
	viewListStorage = new ViewListStorage();

	window.pattern = {
		modelStorage: modelStorage,
		modelListStorage: modelListStorage,
		viewStorage: viewStorage,
		viewListStorage: viewListStorage
	};

	return {

		Model: Model,
		ModelList: ModelList,
		View: View,
		ViewList: ViewList,
		Controller: Controller

	};

}());