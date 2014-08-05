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
						return (modelStorage.allModels())[mid];
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
				modelList = this.modelListFor(lid),
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
				modelList = this.modelListFor(lid),
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
				allModels = modelStorage.allModels();
				do {
					mid = modelList[i];
					model = allModels[mid];
					all.push(model);
				} while (++i < j);
			}
			return all;
		};
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
		ModelListManager.prototype.initialize = function (lid, pairsList, idKey) {
			var pairs,
				model,
				mid,
				modelList,
				allModels,
				i, j;
			if ((pairsList || false).constructor === Array) {
				modelList = this.modelListFor(lid);
				allModels = modelStorage.allModels();
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
			var attributes = {};
			this.allAttributes = function () {
				return attributes;
			};
		}
		ViewManager.prototype.allViews = function () {
			return viewStorage.allViews();
		};
		ViewManager.prototype.manage = function (vid, view) {
			(this.allViews())[vid] = view;
		};
		ViewManager.prototype.initialize = function (vid, model) {
			if (model instanceof Model) {

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
			var attributes = {};
			this.allAttributes = function () {
				return attributes;
			};
		}
		ViewListManager.prototype.allViewLists = function () {
			return viewListStorage.allViewLists();
		};
		ViewListManager.prototype.manage = function (lid, viewList) {
			(this.allViewLists())[lid] = viewList;
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
		ViewListManager.prototype.initialize = function (lid, modelList) {
			var viewList,
				allModels,
				i, j,
				model,
				view,
				vid;
			if (modelList instanceof ModelList) {
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
		/*
		ViewList.prototype.modelList = function () {

		};
		*/

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

		function descendant(pairs, idKey) {
			function mix(alpha, omega) {
				var key, has = Object.prototype.hasOwnProperty;
				for (key in alpha) {
					if (has.call(alpha, key)) {
						if ((key in omega) === false) {
							omega[key] = alpha[key];
						}
					}
				}
				return omega;
			}
			return (function (Ancestor, ancestorPairs, ancestorIdKey) {
				var ancestor = new Ancestor(ancestorPairs, ancestorIdKey);
				function Model(pairs, idKey) {
					initialize.call(this, (ancestorPairs || false).constructor === Object ? (pairs || false).constructor === Object ? mix(ancestorPairs, pairs) : ancestorPairs : pairs, idKey || ancestorIdKey);
				}
				Model.prototype = ancestor;
				Model.prototype.ancestor = function () {
					return ancestor;
				};
				return mix(Ancestor, Model);
			}(this, pairs, idKey));
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

		function descendant(pairsList, idKey) {
			function mixList(alpha, omega) {
				var i, j, value;
				function has(array, value) {
					var i = 0, j = array.length;
					do {
						if (array[i] === value) return true ;
					} while (++i < j);
					return false;
				}
				for (i = 0, j = alpha.length; i < j; i = i + 1) {
					value = alpha[i];
					if (has(omega, value) === false) {
						omega.push(value);
					}
				}
				return omega;
			}
			function mix(alpha, omega) {
				var key, has = Object.prototype.hasOwnProperty;
				for (key in alpha) {
					if (has.call(alpha, key)) {
						if ((key in omega) === false) {
							omega[key] = alpha[key];
						}
					}
				}
				return omega;
			}
			return (function (Ancestor, ancestorPairsList, ancestorIdKey) {
				var ancestor = new Ancestor(ancestorPairsList, ancestorIdKey);
				function ModelList(pairsList, idKey) {
					initialize.call(this, (ancestorPairsList || false).constructor === Array ? (pairsList || false).constructor === Array ? mixList(ancestorPairsList, pairsList) : ancestorPairsList : pairsList, idKey || ancestorIdKey);
				}
				ModelList.prototype = ancestor;
				ModelList.prototype.ancestor = function () {
					return ancestor;
				};
				return mix(Ancestor, ModelList);
			}(this, pairsList, idKey));
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
		ModelList.descendant = descendant;

		return ModelList;

	}());

	View = (function () {

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

		function descendant(model) {
			function mix(alpha, omega) {
				var key, has = Object.prototype.hasOwnProperty;
				for (key in alpha) {
					if (has.call(alpha, key)) {
						if ((key in omega) === false) {
							omega[key] = alpha[key];
						}
					}
				}
				return omega;
			}
			return (function (Ancestor, ancestorModel) {
				var ancestor = new Ancestor(ancestorModel);
				function View(model) {
					initialize.call(this, model || ancestorModel);
				}
				View.prototype = ancestor;
				View.prototype.ancestor = function () {
					return ancestor;
				};
				return mix(Ancestor, View);
			}(this, model));
		}

		function View(model) {
			initialize.call(this, model);
		}
		/*
		View.prototype.model = function () {

		};
		*/
		View.descendant = descendant;

		return View;

	}());

	ViewList = (function () {

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

		function descendant(modelList) {
			var hasOwnProperty = Object.prototype.hasOwnProperty;
			function has(modelList, mid) {
				var i = 0, j = modelList.length;
				do {
					if (modelList[i] === mid) return true ;
				} while (++i < j);
				return false;
			}
			function mixList(alpha, omega) {
				var alphaList = modelListManager.modelListFor(alpha.lid()),
					omegaList = modelListManager.modelListFor(omega.lid()),
					n = alphaList.length, mid;
				while (n--) { //reverse and unshift
					mid = alphaList[n]; console.log(mid);
					if (has(omegaList, mid) === false) {
						omegaList.unshift(mid);
					}
				}
				return omegaList;
			}
			function mix(alpha, omega) {
				var key;
				for (key in alpha) {
					if (hasOwnProperty.call(alpha, key)) {
						if ((key in omega) === false) {
							omega[key] = alpha[key];
						}
					}
				}
				return omega;
			}
			return (function (Ancestor, ancestorModelList) {
				var ancestor = new Ancestor(ancestorModelList);
				console.log(ancestor);
				function ViewList(modelList) {
					initialize.call(this, (ancestorModelList instanceof ModelList) ? (modelList instanceof ModelList) ? mixList(ancestorModelList, modelList) : ancestorModelList : modelList);
				}
				ViewList.prototype = ancestor;
				ViewList.prototype.ancestor = function () {
					return ancestor;
				};
				return mix(Ancestor, ViewList);;
			}(this, modelList));
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

	/*
	window.pattern = {
		modelStorage: modelStorage,
		modelListStorage: modelListStorage,
		viewStorage: viewStorage,
		viewListStorage: viewListStorage
	};
	*/

	return {

		Model: Model,
		ModelList: ModelList,
		View: View,
		ViewList: ViewList,
		Controller: Controller

	};

}());