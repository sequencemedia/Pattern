var Pattern = (function () {

	"use strict";

	var pattern,
		createUID,
		eventManager,
		modelManager,
		modelStorage,
		modelListManager,
		modelListStorage,
		viewManager,
		viewStorage,
		viewListManager,
		viewListStorage,
		controllerManager,
		controllerStorage,
		Model,
		ModelList,
		View,
		ViewList,
		Controller;

	function createLID(uid) { return "lid-" + uid; }
	function createMID(uid) { return "mid-" + uid; }
	function createVID(uid) { return "vid-" + uid; }
	function createCID(uid) { return "cid-" + uid; }

	pattern = {
		inherit: (function () {
			var has = Object.prototype.hasOwnProperty;
			return function inherit(alpha, omega) {
				var key;
				alpha = (alpha || false).constructor === Function ? alpha : function () { };
				omega = (omega || false).constructor === Function ? omega : function () { };
				for (key in alpha) {
					if (has.call(alpha, key) === true) {
						if (has.call(omega, key) === false) {
							omega[key] = alpha[key];
						}
					}
				}
				return omega;
			};
		}()),
		list : (function () {
			function indexOf(array, value) {
				var i = 0,
					j = array.length;
				do {
					if (array[i] === value) return i;
				} while (++i < j);
				return null;
			}
			return {
				has: function (array, value) {
					return indexOf(array, value) !== null;
				},
				mix: (function() {
					function mix(alpha, omega) {
						var i = 0,
							j = omega.length,
							value;
						for (i, j; i < j; i = i + 1) { //because i and j may be zero
							value = omega[i];
							if (indexOf(alpha, value) === null) {
								alpha.push(value);
							}
						}
						return alpha;
					}
					return function (alpha, omega) {
						return mix(mix([], (alpha || false).constructor === Array ? alpha : []), (omega || false).constructor === Array ? omega : []); //return mix((alpha || false).constructor === Array ? alpha : [], (omega || false).constructor === Array ? omega : []);
					};
				}())
			};
		}()),
		hash : (function () {
			var has = Object.prototype.hasOwnProperty;
			return {
				has: function (object, key) {
					return has.call(object, key);
				},
				mix: (function () {
					function mix (alpha, omega) {
						var key;
						for (key in alpha) {
							if (has.call(alpha, key) === true) {
								if (has.call(omega, key) === false) {
									omega[key] = alpha[key];
								}
							}
						}
						return omega;
					}
					return function (alpha, omega) {
						return mix(mix({}, (alpha || false).constructor === Object ? alpha : {}), (omega || false).constructor === Object ? omega : {});
					};
				}())
			}
		}())
	};

	function Map() { this.map = {}; };
	Map.prototype.get = function (lid, mid) {
		return (this.map[lid] || (this.map[lid] = {}))[mid] || null;
	};
	Map.prototype.set = function (lid, mid, vid) {
		(this.map[lid] || (this.map[lid] = {}))[mid] = vid;
	};

	var map = new Map();

	createUID = (function () {
		var count = 1e9;
		return function () {
			return (count = count + 1).toString(16);
		};
	}());

	function EventManager() {
		var subscriptions = {};
		this.allSubscriptions = function () {
			return subscriptions;
		};
	}
	EventManager.prototype.allModels = function () {
		return modelStorage.allModels();
	};
	EventManager.prototype.allViews = function () {
		return viewStorage.allViews();
	};
	EventManager.prototype.allModelLists = function () {
		return modelListStorage.allModelLists();
	};
	EventManager.prototype.allViewLists = function () {
		return viewListStorage.allViewLists();
	};
	EventManager.prototype.allControllers = function () {
		return controllerStorage.allControllers();
	};
	EventManager.prototype.contextFor = function (uid) {
		return (this.allViews())[uid] || (this.allViewLists())[uid] || (this.allControllers())[uid];
	};
	/*
	EventManager.prototype.on = function () { };
	EventManager.prototype.onList = function () { };
	EventManager.prototype.ante = function () { };
	EventManager.prototype.anteList = function () { };
	EventManager.prototype.post = function () { };
	EventManager.prototype.postList = function () { };
	*/
	EventManager.prototype.publish = function (uid, key, parameters) { //console.log(uid, key, parameters);
		var subscriptions = this.subscriptionsFor(uid, key),
			i = 0,
			j = subscriptions.length,
			subscription,
			context;
		for (i, j; i < j; i = i + 1) {
			subscription = subscriptions[i];
			context = this.contextFor(subscription.cid);
			subscription.handler.call(context, parameters);
		}
	};
	EventManager.prototype.subscriptionsFor = function (uid, key) {
		var subscriptions = this.allSubscriptions();
		return (subscriptions[uid] || (subscriptions[uid] = {}))[key] || (subscriptions[uid][key] = []);
	};
	EventManager.prototype.subscribe = function (subscriber, publisher, parameters) { //console.log(subscriber, publisher, parameters);
		/*
			TODO: Subscription attach/detach -- subscribe/endSubscription
		*/
		var key, subscriptions, handler;
		for (key in parameters) {
			if (typeof (handler = parameters[key]) === "function") {
				subscriptions = this.subscriptionsFor(publisher, key);
				subscriptions.push({ cid: subscriber, handler: handler });
			}
		}
	};
	EventManager.prototype.unsubscribe = function (subscriber, publisher) { //console.log(subscriber, publisher);
		/*
			TODO: Subscription attach/detach -- subscribe/endSubscription
		*/
		var subscriptions = this.allSubscriptions()[publisher];
		if (subscriptions) {

		}
	};

	function ModelManager() {
		var predicates = {},
			defaultAttributes = {},
			changedAttributes = {},
			currentAttributes = {},
			validators = {},
			idKeys = {};
		this.allPredicates = function () {
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
	ModelManager.prototype.predicatesFor = function (mid) {
		var predicates = this.allPredicates();
		return (predicates[mid] || (predicates[mid] = {}));
	};
	ModelManager.prototype.getPredicateValue = function (mid, key) {
		return (this.predicatesFor(mid))[key];
	};
	ModelManager.prototype.setPredicateValue = function (mid, key, value) {
		(this.predicatesFor(mid))[key] = value;
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
	ModelManager.prototype.removeCurrentValue = function (mid, key, changed) {
		(this.changedValuesFor(mid))[key] = changed;
		delete (this.currentValuesFor(mid))[key];
	};
	ModelManager.prototype.updateCurrentValue = function (mid, key, changed, current) {
		(this.changedValuesFor(mid))[key] = changed;
		(this.currentValuesFor(mid))[key] = current;
	};
	ModelManager.prototype.report = function (mid, key, changed, current) {
		eventManager.publish(mid, key, {
			changed: changed,
			current: current,
			model: (this.allModels())[mid]
		});
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
				KEY = (key = keys[i]) === "id" ? this.getIDKey(mid) : key;
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
		var KEY = key === "id" ? this.getIDKey(mid) : key, currentValue;
		if (!this.isCurrentValue(mid, KEY, value)) {
			if (this.validate(mid, KEY, value)) {
				this.updateCurrentValue(mid, KEY, currentValue = this.getCurrentValue(mid, KEY), value); /* change with internal key */
				this.report(mid, key, currentValue, value); /* report with external key */
			}
		}
	};
	ModelManager.prototype.setEach = function (mid, pairs) {
		var key, KEY, value, currentValue;
		if ((pairs || false).constructor === Object) {
			for (key in pairs) {
				KEY = key === "id" ? this.getIDKey(mid) : key;
				value = pairs[key]; //use external key!
				if (!this.isCurrentValue(mid, KEY, value)) {
					if (this.validate(mid, KEY, value)) {
						this.updateCurrentValue(mid, KEY, currentValue = this.getCurrentValue(mid, KEY), value); /* change with internal key */
						this.report(mid, key, currentValue, value); /* report with external key */
					}
				}
			}
		}
	};
	ModelManager.prototype.setAll = function (mid, value) {
		var key, currentValues = this.currentValuesFor(mid), currentValue;
		for (key in currentValues) {
			if (!this.isCurrentValue(mid, key, value)) {
				if (this.validate(mid, key, value)) {
					this.updateCurrentValue(mid, key, currentValue = this.getCurrentValue(mid, key), value); /* change with external key */
					this.report(mid, key, currentValue, value); /* change with external key */
				}
			}
		}
	};
	ModelManager.prototype.zed = function (mid, key) {
		var KEY = key === "id" ? this.getIDKey(mid) : key,
			value = this.getChangedValue(mid, KEY), currentValue;
		if (!this.isCurrentValue(mid, KEY, value)) {
			this.updateCurrentValue(mid, KEY, currentValue = this.getCurrentValue(mid, KEY), value); /* change with internal key */
			this.report(mid, key, currentValue, value); /* report with external key */
		}
	};
	ModelManager.prototype.zedEach = function (mid, keys) {
		var changedValues, i, j, key, KEY, value, currentValue;
		if ((keys || false).constructor === Array) {
			changedValues = this.changedValuesFor(mid);
			for (i = 0, j = keys.length; i < j; i = i + 1) {
				KEY = (key = keys[i]) === "id" ? this.getIDKey(mid) : key;
				if (KEY in changedValues) { //can't zed unchanged keys
					value = changedValues[KEY];
					if (!this.isCurrentValue(mid, KEY, value)) {
						this.updateCurrentValue(mid, KEY, currentValue = this.getCurrentValue(mid, KEY), value); /* change with internal key */
						this.report(mid, key, currentValue, value); /* report with external key */
					}
				}
			}
		}
	};
	ModelManager.prototype.zedAll = function (mid) {
		var key, changedValues = this.changedValuesFor(mid), value, currentValue;
		for (key in changedValues) {
			value = changedValues[key]; //implicitly is changed
			if (!this.isCurrentValue(mid, key, value)) {
				this.updateCurrentValue(mid, key, currentValue = this.getCurrentValue(mid, key), value); /* change with external key */
				this.report(mid, key, currentValue, value); /* report with external key */
			}
		}
	};
	ModelManager.prototype.unset = function (mid, key) {
		var KEY = key === "id" ? this.getIDKey(mid) : key,
			currentValues = this.currentValuesFor(mid), value;
		if (KEY in currentValues) {
			value = currentValues[KEY];
			this.removeCurrentValue(mid, KEY, value); /* delete with internal key */
			this.report(mid, key, value); /* report with external key */
		}
	};
	ModelManager.prototype.unsetEach = function (mid, keys) {
		var currentValues, i, j, key, KEY, value;
		if ((keys || false).constructor === Array) {
			currentValues = this.currentValuesFor(mid);
			for (i = 0, j = keys.length; i < j; i = i + 1) {
				KEY = (key = keys[i]) === "id" ? this.getIDKey(mid) : key;
				if (KEY in currentValues) { //can't zed unknown keys
					value = currentValues[KEY];
					this.removeCurrentValue(mid, KEY, value); /* delete with internal key */
					this.report(mid, key, value); /* report with external key */
				}
			}
		}
	};
	ModelManager.prototype.unsetAll = function (mid) {
		var key, currentValues = this.currentValuesFor(mid), value;
		for (key in currentValues) {
			value = currentValues[key];
			this.removeCurrentValue(mid, key, value);
			this.report(mid, key, value);
		}
	};
	ModelManager.prototype.reset = function (mid, key) {
		var KEY = key === "id" ? this.getIDKey(mid) : key,
			currentValues = this.currentValuesFor(mid), value, defaultValue;
		value = currentValues[KEY];
		if (!this.isDefaultKey(mid, KEY)) { //unset
			this.removeCurrentValue(mid, KEY, value); /* delete with internal key */
			this.report(mid, key, value); /* report with external key */
		} else {
			if (!this.isDefaultValue(mid, KEY, value)) { //reset
				this.updateCurrentValue(mid, KEY, value, defaultValue = this.getDefaultValue(mid, KEY)); /* change with internal key */
				this.report(mid, key, value, defaultValue); /* report with external key */
			}
		}
	};
	ModelManager.prototype.resetEach = function (mid, keys) {
		var currentValues, i, j, key, KEY, value, defaultValue;
		if ((keys || false).constructor === Array) {
			currentValues = this.currentValuesFor(mid);
			for (i = 0, j = keys.length; i < j; i = i + 1) {
				KEY = (key = keys[i]) === "id" ? this.getIDKey(mid) : key;
				value = currentValues[KEY];
				if (!this.isDefaultKey(mid, KEY)) { //unset
					this.removeCurrentValue(mid, KEY, value); /* delete with internal key */
					this.report(mid, key, value); /* report with external key */
				} else {
					if (!this.isDefaultValue(mid, KEY, value)) { //reset
						this.updateCurrentValue(mid, KEY, value, defaultValue = this.getDefaultValue(mid, KEY)); /* change with internal key */
						this.report(mid, key, value, defaultValue); /* report with external key */
					}
				}
			}
		}
	};
	ModelManager.prototype.resetAll = function (mid) {
		var currentValues = this.currentValuesFor(mid), key, KEY, value, defaultValue;
		for (key in currentValues) {
			KEY = key === "id" ? this.getIDKey(mid) : key;
			value = currentValues[KEY];
			if (!this.isDefaultKey(mid, KEY)) { //unset
				this.removeCurrentValue(mid, KEY, value); /* delete with internal key */
				this.report(mid, key, value); /* report with external key */
			} else {
				if (!this.isDefaultValue(mid, KEY, value)) { //reset
					this.updateCurrentValue(mid, KEY, value, defaultValue = this.getDefaultValue(mid, KEY)); /* change with internal key */
					this.report(mid, key, value, defaultValue); /* report with external key */
				}
			}
		}
	};
	ModelManager.prototype.inherit = (function () {
		var has = Object.prototype.hasOwnProperty;
		return function (alpha, omega) { //lid, lid
			var alphaValues = this.currentValuesFor(alpha),
				omegaValues = this.currentValuesFor(omega),
				key, KEY;
			for (key in alphaValues) {
				KEY = key === "id" ? this.getIDKey(omega) : key;
				if (has.call(omegaValues, KEY) !== true) {
					omegaValues[KEY] = alphaValues[KEY];
				}
			}
		};
	}());
	ModelManager.prototype.ancestor = function (mid, model) {
		var uid = (model) ? model.mid() : null;
		return (uid) ? this.setPredicateValue(mid, "ancestor", uid) :
		(uid = this.getPredicateValue(mid, "ancestor")) ? (this.allModels())[uid] : null;
	};
	ModelManager.prototype.initialize = function (mid, pairs, idKey) {
		var key, value,
			defaultValues = this.defaultValuesFor(mid),
			changedValues = this.changedValuesFor(mid),
			currentValues = this.currentValuesFor(mid);
		for (key in pairs) {
			value = pairs[key];
			defaultValues[key] = value;
			changedValues[key] = value;
			currentValues[key] = value;
		}
		if (idKey !== this.getIDKey(mid)) this.setIDKey(mid, idKey);
	};

	function ModelStorage() {
		var models = {};
		this.allModels = function () {
			return models;
		};
	}

	function ModelListManager() {
		var predicates = {},
			attributes = {};
		this.allPredicates = function () {
			return predicates;
		};
		this.allAttributes = function () {
			return attributes;
		};
	}
	ModelListManager.prototype.allModels = function () {
		return modelStorage.allModels();
	};
	ModelListManager.prototype.allModelLists = function () {
		return modelListStorage.allModelLists();
	};
	ModelListManager.prototype.predicatesFor = function (lid) {
		var predicates = this.allPredicates();
		return (predicates[lid] || (predicates[lid] = {}));
	};
	ModelListManager.prototype.getPredicateValue = function (lid, key) {
		return (this.predicatesFor(lid))[key];
	};
	ModelListManager.prototype.setPredicateValue = function (lid, key, value) {
		(this.predicatesFor(lid))[key] = value;
	};
	ModelListManager.prototype.modelListFor = function (lid) {
		var attributes = this.allAttributes();
		return (attributes[lid] || (attributes[lid] = []));
	};
	ModelListManager.prototype.report = function (lid, key, mid) {
		eventManager.publish(lid, key, {
			modelList: (this.allModelLists())[lid],
			model: (this.allModels())[mid]
		});
	};
	ModelListManager.prototype.manage = function (lid, modelList) {
		(this.allModelLists())[lid] = modelList;
	};
	ModelListManager.prototype.forget = function (lid) {
		delete (this.allPredicates())[lid];
		delete (this.allAttributes())[lid];
		delete (this.allModelLists())[lid];
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
		if (typeof index === "number" && model instanceof Model) {
			modelList = this.modelListFor(lid);
			i = 0;
			j = modelList.length;
			mid = model.mid();
			if (i === j) {
				modelList.push(mid);
			} else {
				upperBound = j - 1; //j > 0
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
				//this.report(lid, "set", mid);
			}
		}
	};
	ModelListManager.prototype.add = function (lid, model) {
		var modelList,
			i, j,
			mid;
		if (model instanceof Model) {
			modelList = this.modelListFor(lid);
			i = 0;
			j = modelList.length;
			mid = model.mid();
			if (i < j) {
				do {
					if (modelList[i] === mid) return ;
				} while (++i < j);
			}
			modelList.push(mid);
			this.report(lid, "add", mid);
		}
	};
	ModelListManager.prototype.addEach = function (lid, array) {
		var i, j,
			modelList,
			model,
			mid,
			n, m;
		if ((array || false).constructor === Array) {
			i = 0;
			j = array.length;
			if (i < j) {
				modelList = this.modelListFor(lid);
				do {
					model = array[i];
					if (model instanceof Model) {
						n = 0;
						m = modelList.length;
						mid = model.mid();
						if (n === m) {
							modelList.push(mid);
						} else {
							do {
								if (modelList[n] === mid) {
									break;
								}
							} while (++n < m);
							if (n === m) {
								modelList.push(mid);
								this.report(lid, "add", mid);
							}
						}
					}
				} while (++i < j);
			}
		}
	};
	ModelListManager.prototype.remove = function (lid, model) {
		var modelList,
			i, j,
			mid;
		if (model instanceof Model) {
			modelList = this.modelListFor(lid);
			i = 0;
			j = modelList.length;
			if (i < j) {
				mid = model.mid();
				do {
					if (modelList[i] === mid) {
						modelList.splice(i, 1);
						this.report(lid, "remove", mid);
						break;
					}
				} while (++i < j);
			}
		}
	};
	ModelListManager.prototype.removeEach = function (lid, array) {
		var i, j,
			modelList,
			model,
			mid,
			n, m;
		if ((array || false).constructor === Array) {
			i = 0;
			j = array.length;
			if (i < j) {
				modelList = this.modelListFor(lid);
				do {
					model = array[i];
					if (model instanceof Model) {
						n = 0;
						m = modelList.length;
						if (n < m) {
							mid = model.mid();
							do {
								if (modelList[n] === mid) {
									modelList.splice(n, 1);
									this.report(lid, "remove", mid);
									break;
								}
							} while (++n < m);
						}
					}
				} while (++i < j);
			}
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
	ModelListManager.prototype.inherit = (function () {
		function has(array, value) {
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
				if (has(omegaList, mid) === false) {
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
		return (uid) ? this.setPredicateValue(mid, "ancestor", uid) :
		(uid = this.getPredicateValue(mid, "ancestor")) ? (this.allModelLists())[uid] : null;
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

	function ModelListStorage() {
		var modelLists = {};
		this.allModelLists = function () {
			return modelLists;
		};
	}

	function ViewManager() {
		var predicates = {},
			attributes = {};
		this.allPredicates = function () {
			return predicates;
		};
		this.allAttributes = function () {
			return attributes;
		};
	}
	ViewManager.prototype.allModels = function () {
		return modelStorage.allModels();
	};
	ViewManager.prototype.allViews = function () {
		return viewStorage.allViews();
	};
	ViewManager.prototype.predicatesFor = function (vid) {
		var predicates = this.allPredicates();
		return (predicates[vid] || (predicates[vid] = {}));
	};
	ViewManager.prototype.attributesFor = function (vid) {
		var attributes = this.allAttributes();
		return (attributes[vid] || (attributes[vid] = {}));
	};
	ViewManager.prototype.getPredicateValue = function (vid, key) {
		return (this.predicatesFor(vid))[key];
	};
	ViewManager.prototype.setPredicateValue = function (vid, key, value) {
		(this.predicatesFor(vid))[key] = value;
	};
	ViewManager.prototype.report = function (vid, key) {
		eventManager.publish(vid, key, {
			view: (this.allViews())[vid]
		});
	};
	ViewManager.prototype.manage = function (vid, view) {
		(this.allViews())[vid] = view;
	};
	ViewManager.prototype.forget = function (vid) {
		delete (this.allPredicates())[vid];
		delete (this.allAttributes())[vid];
		delete (this.allViews())[vid];
	};
	ViewManager.prototype.ancestor = function (vid, view) {
		var uid = (view) ? view.vid() : null;
		return (uid) ? this.setPredicateValue(vid, "ancestor", uid) :
		(uid = this.getPredicateValue(vid, "ancestor")) ? (this.allViews())[uid] : null;
	};
	ViewManager.prototype.model = function (vid, model) {
		var mid = (model) ? model.mid() : null;
		return (mid) ? this.setPredicateValue(vid, "model", mid) :
		(mid = this.getPredicateValue(vid, "model")) ? (this.allModels())[mid] : null;
	};
	ViewManager.prototype.initialize = function (vid, mid, parameters) {
		//console.error("A Pattern View susbcribes but does not initialize (yet)");
	};
	ViewManager.prototype.subscribe = function (vid, mid, parameters) { //console.log(vid, mid, parameters);
		eventManager.subscribe(vid, mid, {
			id: function (event) {
				eventManager.publish(vid, "id", {
					view: this,
					was: event
				});
			}
		});
		if ("model" in parameters) eventManager.subscribe(vid, mid, parameters.model);
	};

	function ViewStorage() {
		var views = {};
		this.allViews = function () {
			return views;
		};
	}

	function ViewListManager() {
		var predicates = {},
			attributes = {};
		this.allPredicates = function () {
			return predicates;
		};
		this.allAttributes = function () {
			return attributes;
		};
	}
	ViewListManager.prototype.allModels = function () { //instances
		return modelStorage.allModels();
	};
	ViewListManager.prototype.allViews = function () { //instances
		return viewStorage.allViews();
	};
	ViewListManager.prototype.allModelLists = function () { //instances
		return modelListStorage.allModelLists();
	};
	ViewListManager.prototype.allViewLists = function () { //instances
		return viewListStorage.allViewLists();
	};
	ViewListManager.prototype.predicatesFor = function (lid) {
		var predicates = this.allPredicates();
		return (predicates[lid] || (predicates[lid] = {}));
	};
	ViewListManager.prototype.getPredicateValue = function (lid, key) {
		return (this.predicatesFor(lid))[key];
	};
	ViewListManager.prototype.setPredicateValue = function (lid, key, value) {
		(this.predicatesFor(lid))[key] = value;
	};
	ViewListManager.prototype.modelListFor = function (lid) { //lists of instances
		return modelListManager.modelListFor(lid);
	};
	ViewListManager.prototype.viewListFor = function (lid) { //lists of instances
		var attributes = this.allAttributes();
		return (attributes[lid] || (attributes[lid] = []));
	};
	ViewListManager.prototype.report = function (lid, key, vid) {
		eventManager.publish(lid, key, {
			viewList: (this.allViewLists())[lid],
			view: (this.allViews())[vid]
		});
	};
	ViewListManager.prototype.manage = function (lid, viewList) {
		(this.allViewLists())[lid] = viewList;
	};
	ViewListManager.prototype.forget = function (lid) {
		delete (this.allPredicates())[lid];
		delete (this.allAttributes())[lid];
		delete (this.allViewLists())[lid];
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
		if (typeof index === "number" && view instanceof View) {
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
				//this.report(lid, "set", vid);
			}
		}
	};
	ViewListManager.prototype.add = function (lid, view) {
		var viewList,
			i, j,
			vid,
			mid;
		if (view instanceof View) {
			viewList = this.viewListFor(lid);
			i = 0;
			j = viewList.length;
			vid = view.vid();
			if (i < j) {
				do {
					if (viewList[i] === vid) return ;
				} while (++i < j);
			}
			mid = viewManager.getPredicateValue(vid, "model");
			viewList.push(vid);
			viewList[mid] = vid;
			this.report(lid, "add", vid);
		}
	};
	ViewListManager.prototype.addEach = function (lid, array) {
		var i, j,
			viewList,
			view,
			vid,
			n, m,
			mid;
		if ((array || false).constructor === Array) {
			i = 0;
			j = array.length;
			if (i < j) {
				viewList = this.viewListFor(lid);
				do {
					view = array[i];
					if (view instanceof View) {
						n = 0;
						m = viewList.length;
						vid = view.vid();
						if (n === m) {
							mid = viewManager.getPredicateValue(vid, "model");
							viewList.push(vid);
							viewList[mid] = vid;
							this.report(lid, "add", vid);
						} else {
							do {
								if (viewList[n] === vid) {
									break;
								}
							} while (++n < m);
							if (n === m) {
								mid = viewManager.getPredicateValue(vid, "model");
								viewList.push(vid);
								viewList[mid] = vid;
								this.report(lid, "add", vid);
							}
						}
					}
				} while (++i < j);
			}
		}
	};
	ViewListManager.prototype.remove = function (lid, view) {
		var viewList,
			i, j,
			vid,
			mid;
		if (view instanceof View) {
			viewList = this.viewListFor(lid);
			i = 0;
			j = viewList.length;
			if (i < j) {
				vid = view.vid();
				do {
					if (viewList[i] === vid) {
						mid = viewManager.getPredicateValue(vid, "model");
						viewList.splice(i, 1);
						delete viewList[mid];
						this.report(lid, "remove", vid);
						break;
					}
				} while (++i < j);
			}
		}
	};
	ViewListManager.prototype.removeEach = function (lid, array) {
		var i, j,
			viewList,
			view,
			vid,
			n, m
			mid;
		if ((array || false).constructor === Array) {
			i = 0;
			j = array.length;
			if (i < j) {
				viewList = this.viewListFor(lid);
				do {
					view = array[i];
					if (view instanceof View) {
						n = 0;
						m = viewList.length;
						if (n < m) {
							vid = view.vid();
							do {
								if (viewList[n] === vid) {
									mid = viewManager.getPredicateValue(vid, "model");
									viewList.splice(n, 1);
									delete viewList[mid];
									this.report(lid, "remove", vid);
									break;
								}
							} while (++n < m);
						}
					}
				} while (++i < j);
			}
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
		var uid = (viewList instanceof ViewList) ? viewList.lid() : null;
		return (uid) ? this.setPredicateValue(lid, "ancestor", uid) :
		(uid = this.getPredicateValue(lid, "ancestor")) ? (this.allViewLists())[uid] : null;
	};
	ViewListManager.prototype.modelList = function (lid, modelList) {
		var uid = (modelList instanceof ModelList) ? modelList.lid() : null;
		return (uid) ? this.setPredicateValue(lid, "modelList", uid) :
		(uid = this.getPredicateValue(lid, "modelList")) ? (this.allModelLists())[uid] : null;
	};
	ViewListManager.prototype.initialize = function (lid, uid, parameters) { //console.log(lid, uid, parameters);
		var viewList = this.viewListFor(lid),
			modelList = this.modelListFor(uid), //modelList.all();
			allModels = this.allModels(),
			i, j,
			mid,
			model,
			view,
			vid;
		for (i = 0, j = modelList.length; i < j; i = i + 1) {
			mid = modelList[i];
			model = allModels[mid];
			view = new View(model, parameters);
			vid = view.vid();
			viewList.push(vid);
			viewList[mid] = vid;
		}
	};
	ViewListManager.prototype.subscribe = function (lid, uid, parameters) {
		eventManager.subscribe(lid, uid, {
			add: function (event) { //context is "ViewList" not "ViewListManager"
				/*
					TODO: Refine mechanism for mapping from model to view in viewList
				*/
				var viewList = viewListManager.viewListFor(lid),
					model = event.model,
					mid = model.mid(),
					view = new View(model, parameters.model),
					vid = view.vid();
				viewList.push(vid);
				viewList[mid] = vid;
				viewListManager.report(lid, "add", vid);
				/*
					END TODO;
				*/
				eventManager.publish(lid, "add", {
					viewList: this,
					view: view,
					was: event
				});
			},
			remove: function (event) { //context is "ViewList" not "ViewListManager"
				/*
					TODO: Refine mechanism for mapping from model to view in viewList
				*/
				var viewList = viewListManager.viewListFor(lid),
					model = event.model,
					mid = model.mid(),
					vid = viewList[mid],
					i = 0,
					j = viewList.length;
				for (i, j; i < j; i = i + 1) {
					if (viewList[i] === vid) {
						viewList.splice(i, 1);
						break;
					}
				}
				delete viewList[mid];
				viewListManager.report(lid, "remove", vid);
				/*
					END TODO;
				*/
				eventManager.publish(lid, "remove", {
					viewList: this,
					view: (viewListManager.allViews())[vid],
					was: event
				});
			}
		});
		if ("modelList" in parameters) {
			eventManager.subscribe(lid, uid, parameters.modelList);
		}
	};

	function ViewListStorage() {
		var viewLists = {};
		this.allViewLists = function () {
			return viewLists;
		};
	}

	Model = (function () {

		var descendant = (function () {
			function initialize(ancestor, pairs, idKey) {
				var mid;
				ancestor.constructor.call(this, pairs, idKey);
				modelManager.ancestor(mid = this.mid(), ancestor);
				modelManager.inherit(ancestor.mid(), mid);
			}
			return function (pairs, idKey) {

				return (function (ancestor, ancestorPairs, ancestorIdKey) {

					var prototype = new ancestor.constructor();

					function Model(pairs, idKey) { //merge the pairs object
						initialize.call(this, ancestor, pattern.hash.mix(ancestorPairs, pairs), idKey || ancestorIdKey);
					}
					Model.prototype = prototype;
					Model.prototype.ancestor = function () {
						return modelManager.ancestor(this.mid());
					};

					modelManager.forget(prototype.mid());

					return pattern.inherit(ancestor.constructor, Model);

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
			function initialize(ancestor, pairsList, idKey) {
				var lid;
				ancestor.constructor.call(this, pairsList, idKey);
				modelListManager.ancestor(lid = this.lid(), ancestor);
				modelListManager.inherit(ancestor.lid(), lid);
			}
			return function (pairsList, idKey) {

				return (function (ancestor, ancestorPairsList, ancestorIdKey) {

					var prototype = new ancestor.constructor();

					function ModelList(pairsList, idKey) { //merge the ancestorPairsList array
						initialize.call(this, ancestor, pattern.list.mix(ancestorPairsList, pairsList), idKey || ancestorIdKey);
					}
					ModelList.prototype = ancestor;
					ModelList.prototype.ancestor = function () {
						return modelListManager.ancestor(this.lid());
					};

					modelListManager.forget(prototype.lid());

					return pattern.inherit(ancestor.constructor, ModelList);

				}(this, pairsList, idKey));

			};
		}());

		ModelList.descendant = (function () {
			function initialize(ancestor, pairsList, idKey) {
				var lid;
				ancestor.constructor.call(this, pairsList, idKey);
				modelListManager.ancestor(lid = this.lid(), ancestor);
				modelListManager.inherit(ancestor.lid(), lid);
			}
			return function (pairsList, idKey) {

				return (function (ancestor, ancestorIdKey) { //inherits ancestor models with modelListManager.inherit()

					var prototype = new ancestor.constructor();

					function ModelList(pairsList, idKey) {
						initialize.call(this, ancestor, pairsList, idKey || ancestorIdKey);
					}
					ModelList.prototype = ancestor;
					ModelList.prototype.ancestor = function () {
						return modelListManager.ancestor(this.lid());
					};

					modelListManager.forget(prototype.lid());

					return pattern.inherit(ancestor.constructor, ModelList);

				}(new this(pairsList, idKey), idKey));

			};
		}());

		return ModelList;

	}());

	View = (function () {

		var descendant = (function () {
			function initialize(ancestor, model, parameters) {
				ancestor.constructor.call(this, model, parameters);
				viewManager.ancestor(this.vid(), ancestor);
			}
			return function (model, parameters) {

				return (function (ancestor, ancestorModel, ancestorParameters) {

					var prototype = new ancestor.constructor();

					function View(model, parameters) {
						initialize.call(this, ancestor, model || ancestorModel || ancestor.model(), parameters || ancestorParameters);
					}
					View.prototype = prototype;
					View.prototype.ancestor = function () {
						return viewManager.ancestor(this.vid());
					};

					viewManager.forget(prototype.vid());

					return pattern.inherit(ancestor.constructor, View);

				}(this instanceof View ? this : new this(model, parameters), model, parameters));

			};
		}());

		function initialize(model, parameters) { //console.log(model, parameters);
			var vid, mid;
			this.vid = (function (vid) {
				return function () {
					return vid;
				};
			}(vid = createVID(createUID())));
			viewManager.manage(vid, this);
			if (model instanceof Model) {
				viewManager.model(vid, model);
				viewManager.initialize(vid, mid = model.mid(), parameters || (parameters = {}));
				//viewManager.subscribe(vid, mid, parameters);
				//viewManager.initialize(vid, mid = model.mid(), parameters || (parameters = {}));
				viewManager.subscribe(vid, model.mid(), parameters || (parameters = {}));

			}
		}

		function View(model, parameters) {
			initialize.call(this, model, parameters);
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
			function initialize(ancestor, modelList, parameters) {
				ancestor.constructor.call(this, modelList, parameters);
				viewListManager.ancestor(this.lid(), ancestor);
			}
			return function (modelList, parameters) {

				return (function (ancestor, ancestorModelList, ancestorParameters) {

					var prototype = new ancestor.constructor();

					function ViewList(modelList, parameters) {
						initialize.call(this, ancestor, modelList || ancestorModelList || ancestor.modelList(), parameters || ancestorParameters);
					}
					ViewList.prototype = prototype;
					ViewList.prototype.ancestor = function () {
						return viewListManager.ancestor(this.lid());
					};

					viewListManager.forget(prototype.lid());

					return pattern.inherit(ancestor.constructor, ViewList);

				}(this instanceof ViewList ? this : new this(modelList, parameters), modelList, parameters));

			};
		}());

		function initialize(modelList, parameters) { //console.log(parameters);
			var lid, uid;
			this.lid = (function (lid) {
				return function () {
					return lid;
				};
			}(lid = createLID(createUID())));
			viewListManager.manage(lid, this);
			if (modelList instanceof ModelList) {
				viewListManager.modelList(lid, modelList);
				viewListManager.initialize(lid, uid = modelList.lid(), parameters || (parameters = {}));
				viewListManager.subscribe(lid, uid, parameters);
			}
		}

		function ViewList(modelList, parameters) {
			initialize.call(this, modelList, parameters);
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
		ViewList.prototype.addEach = function (array) {
			viewListManager.addEach(this.lid(), array);
		};
		ViewList.prototype.remove = function (view) {
			viewListManager.remove(this.lid(), view);
		};
		ViewList.prototype.removeEach = function (array) {
			viewListManager.removeEach(this.lid(), array);
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

	function ControllerManager() {

		var predicates = {},
			attributes = {};
		this.allPredicates = function () {
			return predicates;
		};
		this.allAttributes = function () {
			return attributes;
		};
		this.allViews = function () {
			return viewStorage.allViews();
		};
		this.allViewLists = function () {
			return viewListStorage.allViewLists();
		};
		this.allControllers = function () {
			return controllerStorage.allControllers();
		};

	}
	ControllerManager.prototype.predicatesFor = function (cid) {
		var predicates = this.allPredicates();
		return (predicates[cid] || (predicates[cid] = {}));
	};
	ControllerManager.prototype.getPredicateValue = function (cid, key) {
		return (this.predicatesFor(cid))[key];
	};
	ControllerManager.prototype.setPredicateValue = function (cid, key, value) {
		(this.predicatesFor(cid))[key] = value;
	};
	ControllerManager.prototype.viewListFor = function (lid) { //lists of instances
		return viewListManager.viewListFor(lid);
	};
	ControllerManager.prototype.viewList = function (cid, viewList) {
		var uid = (viewList instanceof ViewList) ? viewList.lid() : null;
		return (uid) ? this.setPredicateValue(cid, "viewList", uid) :
		(uid = this.getPredicateValue(cid, "viewList")) ? (this.allViewLists())[uid] : null;
	};
	ControllerManager.prototype.manage = function (cid, controller) {
		(this.allControllers())[cid] = controller;
	};
	ControllerManager.prototype.forget = function (cid) {
		delete (this.allControllers())[cid];
	};
	ControllerManager.prototype.initialize = function (cid, lid, parameters) {
		/*
		var viewList,
			allViews,
			i, j,
			vid,
			view,
			model,
			mid,
			lid;
		*/
		//console.error("A Pattern Controller subscribes but does not initialize.");
		/*
		if ("view" in parameters) {
			viewList = this.viewListFor(lid);
			allViews = this.allViews();
			for (i = 0, j = viewList.length; i < j; i = i + 1) {
				vid = viewList[i];
				view = allViews[vid];
				model = view.model();
				mid = model.mid();
				eventManager.subscribe(vid, mid, parameters.view);
			}
		}
		if ("viewList" in parameters) {
			eventManager.subscribe(lid, uid, parameters.viewList);
		}
		*/
	};
	ControllerManager.prototype.subscribe = function (cid, lid, parameters) { //console.log(cid, lid, parameters);
		var viewList = this.viewListFor(lid),
			i, j, vid;
		for (i = 0, j = viewList.length; i < j; i = i + 1) {
			vid = viewList[i];
			eventManager.subscribe(cid, vid, { //controller subscribing to integral view events
				id: function (event) {
					eventManager.publish(cid, "id", {
						controller: this,
						was: event
					});
				}
			});
		}
		if ("view" in parameters) { //controller subscribing to custom view events
			for (i = 0, j = viewList.length; i < j; i = i + 1) {
				vid = viewList[i];
				eventManager.subscribe(cid, vid, parameters.view);
			}
		}
		eventManager.subscribe(cid, lid, { //controller subscribing to integral viewList events
			add: function (event) {
				if ("view" in parameters) {
					eventManager.subscribe(cid, vid, parameters.view); //attachSubscription
				}
				eventManager.publish(cid, "add", {
					controller: this,
					was: event
				});
			},
			remove: function (event) {
				if ("view" in parameters) {
					eventManager.unsubscribe(cid, vid, parameters.view); //detachSubscription
				}
				eventManager.publish(cid, "remove", {
					controller: this,
					was: event
				});
			}
		});
		if ("viewList" in parameters) {
			eventManager.subscribe(cid, lid, parameters.viewList); //controller subscribing to custom view events
		}
	};

	function ControllerStorage() {
		var controllers = {};
		this.allControllers = function () {
			return controllers;
		};
	}

	Controller = (function () {

		function Controller(viewList, parameters) { //console.log(viewList, parameters);
			var cid, lid;
			this.cid = (function (cid) {
				return function () {
					return cid;
				}
			}(cid = createCID(createUID())));
			controllerManager.manage(cid, this);
			if (viewList instanceof ViewList) {
				controllerManager.viewList(cid, viewList);
				//controllerManager.initialize(cid, lid = viewList.lid(), parameters || (parameters = {}));
				//controllerManager.subscribe(cid, lid, parameters);
				controllerManager.subscribe(cid, viewList.lid(), parameters || (parameters = {}));
			}
		}
		Controller.prototype.viewList = function (viewList) {
			return controllerManager.viewList(this.cid(), viewList);
		}

		return Controller;

	}());

	eventManager = new EventManager();
	modelManager = new ModelManager();
	modelStorage = new ModelStorage();
	modelListManager = new ModelListManager();
	modelListStorage = new ModelListStorage();
	viewManager = new ViewManager();
	viewStorage = new ViewStorage();
	viewListManager = new ViewListManager();
	viewListStorage = new ViewListStorage();
	controllerManager = new ControllerManager();
	controllerStorage = new ControllerStorage();

	return {

		Model: Model,
		ModelList: ModelList,
		View: View,
		ViewList: ViewList,
		Controller: Controller,

		uid: (function () {
			var uidPattern = "nn-n-n-n-nnn",
				expression = /n/ig;
			function uid() {
				return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
			}
			return function () {
				return uidPattern.replace(expression, uid);
			};
		}())

	};

}());