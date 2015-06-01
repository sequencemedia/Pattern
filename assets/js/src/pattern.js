var Pattern = (function () { /* jshint forin: false, maxerr: 1000 */

	"use strict";

	var pattern,
		createPID,
		createUID,
		Storage,
		channelStorage,
		modelStorage,
		modelListStorage,
		viewStorage,
		viewListStorage,
		controllerStorage,
		channelManager,
		modelManager,
		modelListManager,
		viewManager,
		viewListManager,
		controllerManager,
		pid,
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
			};
		}())
	};

	createPID = (function () {
		var uidPattern = "nn-n-n-n-nnn",
			expression = /n/ig;
		function uid() {
			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		}
		return function () {
			return uidPattern.replace(expression, uid);
		};
	}());

	createUID = (function () {
		var count = 1e9;
		return function () {
			return (count = count + 1).toString(16);
		};
	}());

	Storage = (function () {
		var all = {};
		function Storage() {}
		Storage.prototype.all = function () {
			return all;
		};
		return Storage;
	}());
	Storage.prototype.fetch = function (key) {
		return (this.all())[key];
	};
	Storage.prototype.store = function (key, value) {
		(this.all())[key] = value;
	};
	Storage.prototype.purge = function (key) {
		delete (this.all())[key];
	};
	Storage.prototype.has = function (key) {
		return (key in this.all());
	};

	function ChannelStorage() { }
	ChannelStorage.prototype = new Storage();

	function ModelStorage() {
		var models = {};
		this.allModels = function () {
			return models;
		};
		this.hasModel = function (mid) {
			return (mid in models);
		};
	}
	ModelStorage.prototype = new Storage();
	ModelStorage.prototype.store = function (mid, model) {
		(this.all())[mid] = (
		(this.allModels())[mid] = model);
	};
	ModelStorage.prototype.purge = function (mid) {
		delete (this.all())[mid];
		delete (this.allModels())[mid];
	};

	function ModelListStorage() {
		var modelLists = {};
		this.allModelLists = function () {
			return modelLists;
		};
		this.hasModelList = function (lid) {
			return (lid in modelLists);
		};
	}
	ModelListStorage.prototype = new Storage();
	ModelListStorage.prototype.store = function (lid, modelList) {
		(this.all())[lid] = (
		(this.allModelLists())[lid] = modelList);
	};
	ModelListStorage.prototype.purge = function (lid) {
		delete (this.all())[lid];
		delete (this.allModelLists())[lid];
	};

	function ViewStorage() {
		var views = {};
		this.allViews = function () {
			return views;
		};
		this.hasView = function (vid) {
			return (vid in views);
		};
	}
	ViewStorage.prototype = new Storage();
	ViewStorage.prototype.store = function (vid, view) {
		(this.all())[vid] = (
		(this.allViews())[vid] = view);
	};
	ViewStorage.prototype.purge = function (vid) {
		delete (this.all())[vid];
		delete (this.allViews())[vid];
	};

	function ViewListStorage() {
		var viewLists = {};
		this.allViewLists = function () {
			return viewLists;
		};
		this.hasViewList = function (lid) {
			return (lid in viewLists);
		};
	}
	ViewListStorage.prototype = new Storage();
	ViewListStorage.prototype.store = function (lid, viewList) {
		(this.all())[lid] = (
		(this.allViewLists())[lid] = viewList);
	};
	ViewListStorage.prototype.purge = function (lid) {
		delete (this.all())[lid];
		delete (this.allViewLists())[lid];
	};

	function ControllerStorage() {
		var controllers = {};
		this.allControllers = function () {
			return controllers;
		};
		this.hasController = function (cid) {
			return (cid in controllers);
		};
	}
	ControllerStorage.prototype = new Storage();
	ControllerStorage.prototype.store = function (cid, controller) {
		(this.all())[cid] = (
		(this.allControllers())[cid] = controller);
	};
	ControllerStorage.prototype.purge = function (cid) {
		delete (this.all())[cid];
		delete (this.allControllers())[cid];
	};

	function Manager() {
		var attributes = {},
			predicates = {};
		this.allAttributes = function () {
			return predicates;
		};
		this.allPredicates = function () {
			return attributes;
		};
	}
	Manager.prototype.allModels = function () {
		return modelStorage.allModels();
	};
	Manager.prototype.allModelLists = function () {
		return modelListStorage.allModelLists();
	};
	Manager.prototype.allViews = function () {
		return viewStorage.allViews();
	};
	Manager.prototype.allViewLists = function () {
		return viewListStorage.allViewLists();
	};
	Manager.prototype.allControllers = function () {
		return controllerStorage.allControllers();
	};
	Manager.prototype.attributesFor = function (uid) {
		var attributes = this.allAttributes();
		return (attributes[uid] || (attributes[uid] = {}));
	};
	Manager.prototype.getAttributeValue = function (uid, key) {
		return (this.attributesFor(uid))[key];
	};
	Manager.prototype.setAttributeValue = function (uid, key, value) {
		(this.attributesFor(uid))[key] = value;
	};
	Manager.prototype.predicatesFor = function (uid) {
		var predicates = this.allPredicates();
		return (predicates[uid] || (predicates[uid] = {}));
	};
	Manager.prototype.getPredicateValue = function (uid, key) {
		return (this.predicatesFor(uid))[key];
	};
	Manager.prototype.setPredicateValue = function (uid, key, value) {
		(this.predicatesFor(uid))[key] = value;
	};
	Manager.prototype.modelListFor = function (lid) {
		return modelListManager.modelListFor(lid);
	};
	Manager.prototype.viewListFor = function (lid) {
		return viewListManager.viewListFor(lid);
	};

	function ChannelManager() {
		var channelManager = this;
		function Channel() {
			var subscriptions = {},
				queued = [];
			this.allSubscriptions = function () {
				return subscriptions;
			};
			this.allQueued = function () {
				return queued;
			};
		}
		Channel.prototype.createSubscription = function (subscriber, publisher, methods) {
			var key, subscribers, method;
			for (key in methods) {
				if (typeof (method = methods[key]) === "function") {
					subscribers = this.subscribersFor(publisher, key);
					subscribers[subscriber] = method;
				}
			}
		};
		Channel.prototype.removeSubscription = (function () {
			function not(object) {
				var key;
				for (key in object) return false;
				return true;
			}
			return function (subscriber, publisher) {
				var subscriptions = this.allSubscriptions(), //{ publisher: { key: { subscriber: method } } }
					key,
					keys = subscriptions[publisher], //{ key: { subscriber: method } }
					subscribers;
				for (key in keys) {
					subscribers = keys[key]; //{ subscriber: method }
					delete subscribers[subscriber];
					if (not(subscribers)) delete keys[key];
				}
				if (not(keys)) delete subscriptions[publisher];
			};
		}());
		Channel.prototype.keysFor = function (uid) {
			var subscriptions = this.allSubscriptions();
			return (subscriptions[uid] || (subscriptions[uid] = {}));
		};
		Channel.prototype.subscribersFor = function (uid, key) {
			var keys = this.keysFor(uid);
			return (keys[key] || (keys[key] = {}));
		};
		Channel.prototype.broadcast = function (uid, key, parameters) {
			var subscribers = this.subscribersFor(uid, key),
				subscriber,
				method;
			for (subscriber in subscribers) {
				method = subscribers[subscriber];
				method.call(channelManager.contextFor(subscriber), parameters);
			}
		};
		Channel.prototype.queue = function (uid, key, parameters) {
			this.allQueued().push({ uid: uid, key: key, parameters: parameters });
		};
		Channel.prototype.raise = function (uid, key, parameters) {
			var subscribers = this.subscribersFor(uid, key), //publisher and key { publisher: { key: { subscriber: method } } }
				subscriber,
				method,
				queued;
			for (subscriber in subscribers) {
				method = subscribers[subscriber];
				method.call(channelManager.contextFor(subscriber), parameters);
			}
			if (queued = this.allQueued().shift()) {
				this.raise(queued.uid, queued.key, queued.parameters);
			}
		};
		this.internal = new Channel();
		this.external = new Channel();
	}
	ChannelManager.prototype = new Manager();
	ChannelManager.prototype.contextFor = function (uid) {
		return channelStorage.fetch(uid);
	};

	function ModelManager() {
		var defaultAttributes = {},
			changedAttributes = {},
			currentAttributes = {},
			validators = {};
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
	}
	ModelManager.prototype = new Manager();
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
		return (validator || false).constructor === Function ? validator.call(modelStorage.fetch(mid), value) : true;
	};
	ModelManager.prototype.removeCurrentValue = function (mid, key, changed) {
		(this.changedValuesFor(mid))[key] = changed;
		delete (this.currentValuesFor(mid))[key];
	};
	ModelManager.prototype.updateCurrentValue = function (mid, key, changed, current) {
		(this.changedValuesFor(mid))[key] = changed;
		(this.currentValuesFor(mid))[key] = current;
	};
	ModelManager.prototype.broadcast = function (mid, key, changed, current) {
		channelManager.external.broadcast(mid, key, {
			changed: changed,
			current: current,
			model: modelStorage.fetch(mid)
		});
	};
	ModelManager.prototype.dispose = function (mid, model) {
		modelStorage.store(mid, model);
	};
	ModelManager.prototype.discard = function (mid) {
		channelManager.internal.broadcast(mid, "discard");
		delete (channelManager.internal.allSubscriptions())[mid];
		delete (channelManager.external.allSubscriptions())[mid];
		delete (this.allPredicates())[mid];
		delete (this.allCurrentAttributes())[mid];
		delete (this.allChangedAttributes())[mid];
		delete (this.allDefaultAttributes())[mid];
		delete (this.allValidators())[mid];
		modelStorage.purge(mid);
	};
	ModelManager.prototype.get = function (mid, key) {
		return this.getCurrentValue(mid, key);
	};
	ModelManager.prototype.getEach = function (mid, keys) {
		var pairs, i, j, key;
		if ((keys || false).constructor === Array) {
			pairs = {};
			for (i = 0, j = keys.length; i < j; i = i + 1) {
				key = keys[i];
				pairs[key] = this.getCurrentValue(mid, key);
			}
			return pairs;
		}
	};
	ModelManager.prototype.getAll = function (mid) {
		var currentValues = this.currentValuesFor(mid), key, pairs = {};
		for (key in currentValues) {
			pairs[key] = currentValues[key];
		}
		return pairs;
	};
	ModelManager.prototype.set = function (mid, key, value) {
		var currentValue;
		if (!this.isCurrentValue(mid, key, value)) {
			if (this.validate(mid, key, value)) {
				this.updateCurrentValue(mid, key, currentValue = this.getCurrentValue(mid, key), value);
				this.broadcast(mid, key, currentValue, value);
			}
		}
	};
	ModelManager.prototype.setEach = function (mid, pairs) {
		var key, value, currentValue;
		if ((pairs || false).constructor === Object) {
			for (key in pairs) {
				value = pairs[key]; //use external key!
				if (!this.isCurrentValue(mid, key, value)) {
					if (this.validate(mid, key, value)) {
						this.updateCurrentValue(mid, key, currentValue = this.getCurrentValue(mid, key), value);
						this.broadcast(mid, key, currentValue, value);
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
					this.updateCurrentValue(mid, key, currentValue = this.getCurrentValue(mid, key), value);
					this.broadcast(mid, key, currentValue, value);
				}
			}
		}
	};
	ModelManager.prototype.zed = function (mid, key) {
		var value = this.getChangedValue(mid, key), currentValue;
		if (!this.isCurrentValue(mid, key, value)) {
			this.updateCurrentValue(mid, key, currentValue = this.getCurrentValue(mid, key), value);
			this.broadcast(mid, key, currentValue, value);
		}
	};
	ModelManager.prototype.zedEach = function (mid, keys) {
		var changedValues, i, j, key, value, currentValue;
		if ((keys || false).constructor === Array) {
			changedValues = this.changedValuesFor(mid);
			for (i = 0, j = keys.length; i < j; i = i + 1) {
				key = keys[i];
				if (key in changedValues) { //can't zed unchanged keys
					value = changedValues[key];
					if (!this.isCurrentValue(mid, key, value)) {
						this.updateCurrentValue(mid, key, currentValue = this.getCurrentValue(mid, key), value);
						this.broadcast(mid, key, currentValue, value);
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
				this.updateCurrentValue(mid, key, currentValue = this.getCurrentValue(mid, key), value);
				this.broadcast(mid, key, currentValue, value);
			}
		}
	};
	ModelManager.prototype.unset = function (mid, key) {
		var currentValues = this.currentValuesFor(mid), value;
		if (key in currentValues) {
			value = currentValues[key];
			this.removeCurrentValue(mid, key, value);
			this.broadcast(mid, key, value);
		}
	};
	ModelManager.prototype.unsetEach = function (mid, keys) {
		var currentValues, i, j, key, value;
		if ((keys || false).constructor === Array) {
			currentValues = this.currentValuesFor(mid);
			for (i = 0, j = keys.length; i < j; i = i + 1) {
				key = keys[i];
				if (key in currentValues) { //can't zed unknown keys
					value = currentValues[key];
					this.removeCurrentValue(mid, key, value);
					this.broadcast(mid, key, value);
				}
			}
		}
	};
	ModelManager.prototype.unsetAll = function (mid) {
		var key, currentValues = this.currentValuesFor(mid), value;
		for (key in currentValues) {
			value = currentValues[key];
			this.removeCurrentValue(mid, key, value);
			this.broadcast(mid, key, value);
		}
	};
	ModelManager.prototype.reset = function (mid, key) {
		var value = this.getCurrentValue(mid, key), defaultValue;
		if (!this.isDefaultKey(mid, key)) { //unset
			this.removeCurrentValue(mid, key, value);
			this.broadcast(mid, key, value);
		} else {
			if (!this.isDefaultValue(mid, key, value)) { //reset
				this.updateCurrentValue(mid, key, value, defaultValue = this.getDefaultValue(mid, key));
				this.broadcast(mid, key, value, defaultValue);
			}
		}
	};
	ModelManager.prototype.resetEach = function (mid, keys) {
		var currentValues, i, j, key, value, defaultValue;
		if ((keys || false).constructor === Array) {
			currentValues = this.currentValuesFor(mid);
			for (i = 0, j = keys.length; i < j; i = i + 1) {
				key = keys[i];
				value = currentValues[key];
				if (!this.isDefaultKey(mid, key)) { //unset
					this.removeCurrentValue(mid, key, value);
					this.broadcast(mid, key, value);
				} else {
					if (!this.isDefaultValue(mid, key, value)) { //reset
						this.updateCurrentValue(mid, key, value, defaultValue = this.getDefaultValue(mid, key));
						this.broadcast(mid, key, value, defaultValue);
					}
				}
			}
		}
	};
	ModelManager.prototype.resetAll = function (mid) {
		var currentValues = this.currentValuesFor(mid), key, value, defaultValue;
		for (key in currentValues) {
			value = currentValues[key];
			if (!this.isDefaultKey(mid, key)) { //unset
				this.removeCurrentValue(mid, key, value);
				this.broadcast(mid, key, value);
			} else {
				if (!this.isDefaultValue(mid, key, value)) { //reset
					this.updateCurrentValue(mid, key, value, defaultValue = this.getDefaultValue(mid, key));
					this.broadcast(mid, key, value, defaultValue);
				}
			}
		}
	};
	ModelManager.prototype.inherit = (function () {
		var has = Object.prototype.hasOwnProperty;
		return function (alpha, omega) { //lid, lid
			var alphaValues = this.currentValuesFor(alpha),
				omegaValues = this.currentValuesFor(omega),
				key;
			for (key in alphaValues) {
				if (has.call(omegaValues, key) !== true) {
					omegaValues[key] = alphaValues[key];
				}
			}
		};
	}());
	ModelManager.prototype.ancestor = function (mid, model) {
		var uid = (model instanceof Model) ? model.mid() : null;
		return (uid) ? this.setPredicateValue(mid, "ancestor", uid) :
		(uid = this.getPredicateValue(mid, "ancestor")) ? modelStorage.fetch(uid) : null;
	};
	ModelManager.prototype.initialize = function (mid, pairs, parameters) {
		var key, value,
			defaultValues,
			changedValues,
			currentValues,
			validators;
		if ((pairs || false).constructor === Object) {
			defaultValues = this.defaultValuesFor(mid);
			changedValues = this.changedValuesFor(mid);
			currentValues = this.currentValuesFor(mid);
			for (key in pairs) {
				value = pairs[key];
				defaultValues[key] = value;
				changedValues[key] = value;
				currentValues[key] = value;
			}
			if ((parameters || false).constructor === Object) {
				validators = this.validatorsFor(mid);
				for (key in parameters) {
					value = parameters[key];
					validators[key] = value;
				}
			}
		}
	};

	function ModelListManager() {}
	ModelListManager.prototype = new Manager();
	ModelListManager.prototype.modelListFor = function (lid) {
		var attributes = this.allAttributes();
		return (attributes[lid] || (attributes[lid] = []));
	};
	ModelListManager.prototype.broadcast = function (lid, key, mid) {
		channelManager.internal.broadcast(lid, key, mid);
	};
	ModelListManager.prototype.queue = function (lid, key, mid) {
		channelManager.external.queue(lid, key, {
			modelList: modelListStorage.fetch(lid),
			model: modelStorage.fetch(mid)
		});
	};
	ModelListManager.prototype.raise = function (lid, key, mid) {
		channelManager.external.raise(lid, key, {
			modelList: modelListStorage.fetch(lid),
			model: modelStorage.fetch(mid)
		});
	};
	ModelListManager.prototype.dispose = function (lid, modelList) {
		modelListStorage.store(lid, modelList);
	};
	ModelListManager.prototype.discard = function (lid) {
		channelManager.internal.broadcast(lid, "discard");
		delete (channelManager.internal.allSubscriptions())[lid];
		delete (channelManager.external.allSubscriptions())[lid];
		delete (this.allPredicates())[lid];
		delete (this.allAttributes())[lid];
		modelListStorage.purge(lid);
	};
	ModelListManager.prototype.get = function (lid, index) {
		var modelList,
			i, j,
			upperBound,
			lowerBound,
			mid;
		if (modelListStorage.hasModelList(lid)) {
			if (typeof index === "number") {
				modelList = this.modelListFor(lid);
				i = 0;
				j = modelList.length;
				if (i < j) {
					upperBound = j - 1;
					lowerBound = 0;
					if (!(index > upperBound || index < lowerBound)) {
						mid = modelList[index];
						return modelStorage.fetch(mid);
					}
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
		if (modelListStorage.hasModelList(lid)) {
			if (typeof index === "number" && model instanceof Model) {
				if (modelStorage.hasModel(mid = model.mid())) {
					modelList = this.modelListFor(lid);
					i = 0;
					j = modelList.length;
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
					}
				}
			}
		}
	};
	ModelListManager.prototype.add = function (lid, model) {
		var mid,
			modelList,
			i, j;
		if (modelListStorage.hasModelList(lid)) {
			if (model instanceof Model) {
				if (modelStorage.hasModel(mid = model.mid())) {
					modelList = this.modelListFor(lid);
					i = 0;
					j = modelList.length;
					if (i < j) {
						do {
							if (modelList[i] === mid) return ;
						} while (++i < j);
					}
					modelList.push(mid);
					this.broadcast(lid, "insert", mid);
					this.raise(lid, "add", mid);
				}
			}
		}
	};
	ModelListManager.prototype.addEach = function (lid, array) {
		var i, j,
			modelList,
			model,
			mid,
			n, m;
		if (modelListStorage.hasModelList(lid)) {
			if ((array || false).constructor === Array) {
				i = 0;
				j = array.length;
				if (i < j) {
					modelList = this.modelListFor(lid);
					do {
						model = array[i];
						if (model instanceof Model) {
							if (modelStorage.hasModel(mid = model.mid())) {
								n = 0;
								m = modelList.length;
								if (n === m) {
									modelList.push(mid);
									this.broadcast(lid, "insert", mid);
									this.raise(lid, "add", mid);
								} else {
									do {
										if (modelList[n] === mid) {
											break;
										}
									} while (++n < m);
									if (n === m) {
										modelList.push(mid);
										this.broadcast(lid, "insert", mid);
										this.raise(lid, "add", mid);
									}
								}
							}
						}
					} while (++i < j);
				}
			}
		}
	};
	ModelListManager.prototype.remove = function (lid, model) {
		var mid,
			modelList,
			i, j;
		if (modelListStorage.hasModelList(lid)) {
			if (model instanceof Model) {
				if (modelStorage.hasModel(mid = model.mid())) { //there's no point looking in the model list if the model is not in storage
					modelList = this.modelListFor(lid);
					i = 0;
					j = modelList.length;
					if (i < j) {
						do {
							if (modelList[i] === mid) {
								modelList.splice(i, 1);
								this.broadcast(lid, "delete", mid);
								this.raise(lid, "remove", mid);
								break;
							}
						} while (++i < j);
					}
				}
			}
		}
	};
	ModelListManager.prototype.removeEach = function (lid, array) {
		var i, j,
			modelList,
			model,
			mid,
			n, m;
		if (modelListStorage.hasModelList(lid)) {
			if ((array || false).constructor === Array) {
				i = 0;
				j = array.length;
				if (i < j) {
					modelList = this.modelListFor(lid);
					do {
						model = array[i];
						if (model instanceof Model) {
							if (modelStorage.hasModel(mid = model.mid())) { //as above, so below
								n = 0;
								m = modelList.length;
								if (n < m) {
									do {
										if (modelList[n] === mid) {
											modelList.splice(n, 1);
											this.broadcast(lid, "delete", mid);
											this.raise(lid, "remove", mid);
											break;
										}
									} while (++n < m);
								}
							}
						}
					} while (++i < j);
				}
			}
		}
	};
	ModelListManager.prototype.all = function (lid) {
		var modelList,
			i, j,
			allModels,
			mid,
			model,
			all = [];
		if (modelListStorage.hasModelList(lid)) {
			modelList = this.modelListFor(lid);
			i = 0;
			j = modelList.length;
			if (i < j) {
				allModels = this.allModels();
				do {
					mid = modelList[i];
					model = allModels[mid];
					all.push(model);
				} while (++i < j);
			}
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
					if (modelList[i] === mid) return i;
				} while (++i < j);
			}
		}
		return -1;
	};
	ModelListManager.prototype.ancestor = function (mid, modelList) {
		var uid = (modelList instanceof ModelList) ? modelList.lid() : null;
		return (uid) ? this.setPredicateValue(mid, "ancestor", uid) :
		(uid = this.getPredicateValue(mid, "ancestor")) ? modelListStorage.fetch(uid) : null;
	};
	ModelListManager.prototype.initialize = function (lid, pairsList, parameters) {
		var Model,
			modelList,
			allModels,
			pairs,
			model,
			mid,
			i, j;
		if ((pairsList || false).constructor === Array) {
			Model = this.ModelFor(lid);
			modelList = this.modelListFor(lid);
			allModels = this.allModels();
			for (i = 0, j = pairsList.length; i < j; i = i + 1) {
				pairs = pairsList[i];
				model = new Model(pairs, parameters);
				mid = model.mid();
				modelList.push(mid);
			}
		}
	};
	ModelListManager.prototype.subscribe = (function () {
		function discard(lid, mid) {
			return function () {
				var modelList = viewListManager.modelListFor(lid),
					i = 0,
					j = modelList.length;
				for (i, j; i < j; i = i + 1) {
					if (modelList[i] === mid) {
						modelList.splice(i, 1);
						channelManager.internal.removeSubscription(lid, mid);
						break;
					}
				}
			};
		}
		return function (lid) {
			var modelList = this.modelListFor(lid),
				i = 0,
				j = modelList.length,
				mid;
			for (i, j; i < j; i = i + 1) {
				mid = modelList[i];
				channelManager.internal.createSubscription(lid, mid, { discard: (discard(lid, mid)) });
			}
			/*
			Models with validators are instantiated from the values passed in the "pairsList" and "parameters" arguments of the
			ModelList constructor. All of the Models instantiated when the the ModelList is instantiated will use the
			validators in the "parameters" argument.

				var modelList = new Pattern.ModelList([{ id: 1 }], { id: function (v) { return v > 1; } }); // creates a model list with a model having a validator

			The "add" and "remove" methods of the ModelList only accept Model instances which could or should have had validators
			passed in the "parameters" argument of the Model constructor.

				var model = new Pattern.Model({ id: 2 }, { id: function (v) { return v > 2; } }); // creates a model having a validator

				modelList.add(model); // validators passed as an argument to the ModelList constructor are not added to the model
				modelList.remove(model); // validators passed as an argument to the ModelList constructor are not removed from the model

			Pattern does not want to decide whether validators passed to the ModelList or the Model constructor have primacy.
			*/
			channelManager.internal.createSubscription(lid, lid, {
				insert: function (mid) {
					channelManager.internal.createSubscription(lid, mid, { discard: (discard(lid, mid)) });
				},
				delete: function (mid) {
					channelManager.internal.removeSubscription(lid, mid);
				},
				discard: function () {
					channelManager.internal.removeSubscription(lid, lid);
				}
			});
		};
	}());
	ModelListManager.prototype.ModelFor = function (lid) {
		return (modelListStorage.fetch(lid) || Pattern).Model;
	};

	function ViewManager() {}
	ViewManager.prototype = new Manager();
	ViewManager.prototype.modelFor = function (vid) {
		return this.getPredicateValue(vid, "model");
	};
	ViewManager.prototype.queue = function (vid, key, etc) {
		channelManager.external.queue(vid, key, {
			view: viewStorage.fetch(vid),
			etc: etc
		});
	};
	ViewManager.prototype.raise = function (vid, key, etc) {
		channelManager.external.raise(vid, key, {
			view: viewStorage.fetch(vid),
			etc: etc
		});
	};
	ViewManager.prototype.dispose = function (vid, view) {
		viewStorage.store(vid, view);
	};
	ViewManager.prototype.discard = function (vid) {
		var mid;
		channelManager.internal.broadcast(vid, "discard");
		if (mid = ((this.allPredicates())[vid] || {})["model"] || null) {
			channelManager.internal.removeSubscription(vid, mid);
			channelManager.external.removeSubscription(vid, mid);
		}
		delete (channelManager.internal.allSubscriptions())[vid];
		delete (channelManager.external.allSubscriptions())[vid];
		delete (this.allPredicates())[vid];
		delete (this.allAttributes())[vid];
		viewStorage.purge(vid);
	};
	ViewManager.prototype.ancestor = function (vid, view) {
		var uid = (view instanceof View) ? view.vid() : null;
		return (uid) ? this.setPredicateValue(vid, "ancestor", uid) :
		(uid = this.getPredicateValue(vid, "ancestor")) ? viewStorage.fetch(uid) : null;
	};
	ViewManager.prototype.model = function (vid, model) {
		var mid = (model instanceof Model) ? model.mid() : null;
		return (mid) ? this.setPredicateValue(vid, "model", mid) :
		(mid = this.getPredicateValue(vid, "model")) ? modelStorage.fetch(mid) : null;
	};
	ViewManager.prototype.subscribe = function (vid, mid, parameters) {
		channelManager.internal.createSubscription(vid, mid, {
			discard: function () {
				channelManager.internal.removeSubscription(vid, mid);
				channelManager.external.removeSubscription(vid, mid);
				delete ((viewManager.allPredicates())[vid] || {})["model"];
			}
		});
		if ("model" in parameters) channelManager.external.createSubscription(vid, mid, parameters.model);
	};

	function ViewListManager() {}
	ViewListManager.prototype = new Manager();
	ViewListManager.prototype.modelFor = function (vid) {
		return viewManager.modelFor(vid);
	};
	ViewListManager.prototype.viewListFor = function (lid) { //lists of instances
		var attributes = this.allAttributes();
		return (attributes[lid] || (attributes[lid] = []));
	};
	ViewListManager.prototype.broadcast = function (lid, key, vid) {
		channelManager.internal.broadcast(lid, key, vid);
	};
	ViewListManager.prototype.queue = function (lid, key, vid) {
		channelManager.external.queue(lid, key, {
			viewList: viewListStorage.fetch(lid),
			view: viewStorage.fetch(vid)
		});
	};
	ViewListManager.prototype.raise = function (lid, key, vid) {
		channelManager.external.raise(lid, key, {
			viewList: viewListStorage.fetch(lid),
			view: viewStorage.fetch(vid)
		});
	};
	ViewListManager.prototype.dispose = function (lid, viewList) {
		viewListStorage.store(lid, viewList);
	};
	ViewListManager.prototype.discard = function (lid) {
		var uid;
		channelManager.internal.broadcast(lid, "discard");
		if (uid = ((this.allPredicates())[lid] || {})["modelList"] || null) {
			channelManager.internal.removeSubscription(lid, uid);
			channelManager.external.removeSubscription(lid, uid);
		}
		delete (channelManager.internal.allSubscriptions())[lid];
		delete (channelManager.external.allSubscriptions())[lid];
		delete (this.allPredicates())[lid];
		delete (this.allAttributes())[lid];
		viewListStorage.purge(lid);
	};
	ViewListManager.prototype.get = function (lid, index) {
		var viewList,
			i, j,
			upperBound,
			lowerBound,
			vid;
		if (viewListStorage.hasViewList(lid)) {
			if (typeof index === "number") {
				viewList = this.viewListFor(lid);
				i = 0;
				j = viewList.length;
				if (i < j) {
					upperBound = j - 1;
					lowerBound = 0;
					if (!(index > upperBound || index < lowerBound)) {
						vid = viewList[index];
						return viewStorage.fetch(vid);
					}
				}
			}
		}
		return null;
	};
	ViewListManager.prototype.set = function (lid, index, view) {
		var vid,
			viewList,
			i, j,
			upperBound,
			lowerBound;
		if (viewListStorage.hasViewList(lid)) {
			if (typeof index === "number" && view instanceof View) {
				if (viewStorage.hasView(vid = view.vid())) {
					viewList = this.viewListFor(lid);
					i = 0;
					j = viewList.length;
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
			}
		}
	};
	ViewListManager.prototype.add = function (lid, view) {
		var vid,
			viewList,
			i, j,
			mid;
		if (viewListStorage.hasViewList(lid)) {
			if (view instanceof View) {
				if (viewStorage.hasView(vid = view.vid())) {
					viewList = this.viewListFor(lid);
					i = 0;
					j = viewList.length;
					if (i < j) {
						do {
							if (viewList[i] === vid) return ;
						} while (++i < j);
					}
					viewList.push(vid);
					if (mid = this.modelFor(vid)) {
						viewList[mid] = vid;
					}
					this.broadcast(lid, "insert", vid);
					this.raise(lid, "add", vid);
				}
			}
		}
	};
	ViewListManager.prototype.addEach = function (lid, array) {
		var i, j,
			viewList,
			view,
			vid,
			n, m,
			mid;
		if (viewListStorage.hasViewList(lid)) {
			if ((array || false).constructor === Array) {
				i = 0;
				j = array.length;
				if (i < j) {
					viewList = this.viewListFor(lid);
					do {
						view = array[i];
						if (view instanceof View) {
							if (viewStorage.hasView(vid = view.vid())) {
								n = 0;
								m = viewList.length;
								if (n === m) {
									viewList.push(vid);
									if (mid = this.modelFor(vid)) {
										viewList[mid] = vid;
									}
									this.broadcast(lid, "insert", vid);
									this.raise(lid, "add", vid);
								} else {
									do {
										if (viewList[n] === vid) {
											break;
										}
									} while (++n < m);
									if (n === m) {
										viewList.push(vid);
										if (mid = this.modelFor(vid)) {
											viewList[mid] = vid;
										}
										this.broadcast(lid, "insert", vid);
										this.raise(lid, "add", vid);
									}
								}
							}
						}
					} while (++i < j);
				}
			}
		}
	};
	ViewListManager.prototype.remove = function (lid, view) {
		var vid,
			viewList,
			i, j,
			mid;
		if (viewListStorage.hasViewList(lid)) {
			if (view instanceof View) {
				if (viewStorage.hasView(vid = view.vid())) {
					viewList = this.viewListFor(lid);
					i = 0;
					j = viewList.length;
					if (i < j) {
						do {
							if (viewList[i] === vid) {
								viewList.splice(i, 1);
								if (mid = this.modelFor(vid)) {
									delete viewList[mid];
								}
								this.broadcast(lid, "delete", vid);
								this.raise(lid, "remove", vid);
								break;
							}
						} while (++i < j);
					}
				}
			}
		}
	};
	ViewListManager.prototype.removeEach = function (lid, array) {
		var i, j,
			viewList,
			view,
			vid,
			n, m,
			mid;
		if (viewListStorage.hasViewList(lid)) {
			if ((array || false).constructor === Array) {
				i = 0;
				j = array.length;
				if (i < j) {
					viewList = this.viewListFor(lid);
					do {
						view = array[i];
						if (view instanceof View) {
							if (viewStorage.hasView(vid = view.vid())) {
								n = 0;
								m = viewList.length;
								if (n < m) {
									do {
										if (viewList[n] === vid) {
											viewList.splice(n, 1);
											if (mid = this.modelFor(vid)) {
												delete viewList[mid];
											}
											this.broadcast(lid, "delete", vid);
											this.raise(lid, "remove", vid);
											break;
										}
									} while (++n < m);
								}
							}
						}
					} while (++i < j);
				}
			}
		}
	};
	ViewListManager.prototype.all = function (lid) {
		var viewList,
			i, j,
			allViews,
			vid,
			view,
			all = [];
		if (viewListStorage.hasViewList(lid)) {
			viewList = this.viewListFor(lid);
			i = 0;
			j = viewList.length;
			if (i < j) {
				allViews = viewStorage.allViews();
				do {
					vid = viewList[i];
					view = allViews[vid];
					all.push(view);
				} while (++i < j);
			}
		}
		return all;
	};
	ViewListManager.prototype.indexOf = function (lid, view) {
		var viewList,
			i, j,
			vid;
		if (view instanceof View) {
			viewList = this.viewListFor(lid);
			i = 0;
			j = viewList.length;
			if (i < j) {
				vid = view.vid();
				do {
					if (viewList[i] === vid) return i;
				} while (++i < j);
			}
		}
		return -1;
	};
	ViewListManager.prototype.ancestor = function (lid, viewList) {
		var uid = (viewList instanceof ViewList) ? viewList.lid() : null;
		return (uid) ? this.setPredicateValue(lid, "ancestor", uid) :
		(uid = this.getPredicateValue(lid, "ancestor")) ? viewListStorage.fetch(uid) : null;
	};
	ViewListManager.prototype.modelList = function (lid, modelList) {
		var uid = (modelList instanceof ModelList) ? modelList.lid() : null;
		return (uid) ? this.setPredicateValue(lid, "modelList", uid) :
		(uid = this.getPredicateValue(lid, "modelList")) ? modelListStorage.fetch(uid) : null;
	};
	ViewListManager.prototype.initialize = function (lid, uid) { //, parameters) {
		var viewList = this.viewListFor(lid),
			modelList = this.modelListFor(uid), //modelList.all();
			allModels = this.allModels(),
			i, j,
			mid,
			model,
			View = this.ViewFor(lid),
			view,
			vid;
		for (i = 0, j = modelList.length; i < j; i = i + 1) {
			mid = modelList[i];
			model = allModels[mid];
			view = new View(model); //, parameters);
			vid = view.vid();
			viewList.push(vid);
			viewList[mid] = vid;
		}
	};
	ViewListManager.prototype.subscribe = (function () {
		function discard(lid, vid) { //don't bind up "mid" -- get it afresh (model may have been discarded)
			return function () {
				var viewList = viewListManager.viewListFor(lid),
					i = 0,
					j = viewList.length,
					mid;
				for (i, j; i < j; i = i + 1) {
					if (viewList[i] === vid) {
						viewList.splice(i, 1);
						if (mid = viewListManager.modelFor(vid)) {
							delete viewList[mid];
						}
						channelManager.internal.removeSubscription(lid, vid);
						break;
					}
				}
			};
		}
		return function (lid, uid, parameters) {
			var viewList = this.viewListFor(lid),
				i = 0,
				j = viewList.length,
				vid, mid;
			/*
				ViewList SUBSCRIBES TO View INTERNAL (DISCARD)
			*/
			for (i, j; i < j; i = i + 1) {
				vid = viewList[i];
				channelManager.internal.createSubscription(lid, vid, { discard: (discard(lid, vid)) });
			}
			/*
				ViewList SUBSCRIBES TO ViewList INTERNAL (INSERT, DELETE, DISCARD)
			*/
			channelManager.internal.createSubscription(lid, lid, {
				insert: function (vid) {
					var mid;
					channelManager.internal.createSubscription(lid, vid, { discard: (discard(lid, vid)) });
					if ("model" in parameters && (mid = viewListManager.modelFor(vid))) channelManager.external.createSubscription(vid, mid, parameters.model);
				},
				delete: function (vid) {
					var mid;
					channelManager.internal.removeSubscription(vid, mid);
					if ("model" in parameters && (mid = viewListManager.modelFor(vid))) channelManager.external.removeSubscription(vid, mid);
				},
				discard: function () {
					channelManager.internal.removeSubscription(lid, lid);
					channelManager.external.removeSubscription(lid, lid);
				}
			});
			/*
				ViewList SUBSCRIBES TO ModelList INTERNAL (INSERT, DELETE, DISCARD)
			*/
			channelManager.internal.createSubscription(lid, uid, {
				insert: function (mid) {
					var viewList = viewListManager.viewListFor(lid),
						vid = (new this.View(modelStorage.fetch(mid))).vid();
					viewList.push(vid);
					viewList[mid] = vid;
					viewListManager.broadcast(lid, "insert", vid);
					viewListManager.queue(lid, "add", vid);
				},
				delete: function (mid) {
					var viewList = viewListManager.viewListFor(lid),
						vid, i, j;
					if (vid = viewList[mid]) {
						i = 0;
						j = viewList.length;
						for (i, j; i < j; i = i + 1) {
							if (viewList[i] === vid) {
								viewList.splice(i, 1);
								delete viewList[mid];
								viewListManager.broadcast(lid, "delete", vid);
								viewListManager.queue(lid, "remove", vid);
							}
						}
					}
				},
				discard: function () {
					channelManager.internal.removeSubscription(lid, uid);
					channelManager.external.removeSubscription(lid, uid);
					delete ((viewListManager.allPredicates())[lid] || {})["modelList"];
				}
			});
			if ("model" in parameters) {
				i = 0;
				for (i, j; i < j; i = i + 1) {
					vid = viewList[i];
					if (mid = viewListManager.modelFor(vid)) channelManager.external.createSubscription(vid, mid, parameters.model);
				}
			}
			if ("modelList" in parameters) channelManager.external.createSubscription(lid, uid, parameters.modelList);
		};
	}());
	ViewListManager.prototype.ViewFor = function (lid) {
		return (viewListStorage.fetch(lid) || Pattern).View;
	};

	function ControllerManager() {}
	ControllerManager.prototype = new Manager();
	ControllerManager.prototype.viewList = function (cid, viewList) {
		var uid = (viewList instanceof ViewList) ? viewList.lid() : null;
		return (uid) ? this.setPredicateValue(cid, "viewList", uid) :
		(uid = this.getPredicateValue(cid, "viewList")) ? viewListStorage.fetch(uid) : null;
	};
	ControllerManager.prototype.broadcast = function (cid, key) {
		channelManager.external.broadcast(cid, key, controllerStorage.fetch(cid));
	};
	ControllerManager.prototype.queue = function (cid, key, etc) {
		channelManager.external.queue(pid, key, { //use pid (these are Pattern events)
			controller: controllerStorage.fetch(cid),
			etc: etc
		});
	};
	ControllerManager.prototype.raise = function (cid, key, etc) {
		channelManager.external.raise(pid, key, { //use pid (these are Pattern events)
			controller: controllerStorage.fetch(cid),
			etc: etc
		});
	};
	ControllerManager.prototype.dispose = function (cid, controller) {
		controllerStorage.store(cid, controller);
	};
	ControllerManager.prototype.discard = function (cid) {
		channelManager.internal.removeSubscription(cid, pid);
		channelManager.external.removeSubscription(cid, pid);
		delete (channelManager.internal.allSubscriptions())[cid];
		delete (channelManager.external.allSubscriptions())[cid];
		delete (this.allPredicates())[cid];
		delete (this.allAttributes())[cid];
		controllerStorage.purge(cid);
	};
	ControllerManager.prototype.subscribe = (function () {
		function discard(cid, vid) {
			return function () {
				channelManager.internal.removeSubscription(cid, vid);
				channelManager.external.removeSubscription(cid, vid);
			};
		}
		return function (cid, lid, parameters) {
			var viewList = this.viewListFor(lid),
				i = 0,
				j = viewList.length,
				vid;
			for (i, j; i < j; i = i + 1) {
				vid = viewList[i];
				channelManager.internal.createSubscription(cid, vid, { discard: (discard(cid, vid)) });
			}
			channelManager.internal.createSubscription(cid, lid, { //controller subscribes to discard event of the view list
				insert: function (vid) {
					channelManager.external.createSubscription(cid, vid, parameters.view);
				},
				delete: function (vid) {
					channelManager.external.removeSubscription(cid, vid); //, parameters.view);
				},
				discard: function () {
					channelManager.internal.removeSubscription(cid, lid);
					channelManager.external.removeSubscription(cid, lid);
				}
			});
			if ("view" in parameters) { //controller creating subscription to custom view events
				i = 0;
				for (i, j; i < j; i = i + 1) {
					vid = viewList[i];
					channelManager.external.createSubscription(cid, vid, parameters.view);
				}
			}
			if ("viewList" in parameters) channelManager.external.createSubscription(cid, lid, parameters.viewList); //controller creating subscription to custom viewList events
			if ("controller" in parameters) channelManager.external.createSubscription(cid, pid, parameters.controller); //controller creating subscription to custom Pattern events
		};
	}());
	ControllerManager.prototype.ancestor = function (cid, controller) {
		var uid = (controller instanceof Controller) ? controller.cid() : null;
		return (uid) ? this.setPredicateValue(cid, "ancestor", uid) :
		(uid = this.getPredicateValue(cid, "ancestor")) ? controllerStorage.fetch(uid) : null;
	};

	Model = (function () {

		function initialize(pairs, parameters) {
			var mid;
			this.mid = (function (mid) {
				return function () {
					return mid;
				};
			}(mid = createMID(createUID())));
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

	}());

	ModelList = (function () {

		function initialize(pairsList, parameters) {
			var lid;
			this.lid = (function (lid) {
				return function () {
					return lid;
				};
			}(lid = createLID(createUID())));
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

	}());

	View = (function () {

		function initialize(model, parameters) {
			var vid, mid;
			this.vid = (function (vid) {
				return function () {
					return vid;
				};
			}(vid = createVID(createUID())));
			viewManager.dispose(vid, this);
			if (model instanceof Model) {
				if (modelStorage.hasModel(mid = model.mid())) {
					viewManager.model(vid, model);
					viewManager.subscribe(vid, mid, parameters || (parameters = {}));
				}
			}
		}

		function View(model, parameters) {
			initialize.call(this, model, parameters);
		}
		View.prototype.model = function () {
			return viewManager.model(this.vid());
		};
		View.prototype.queue = function (key, parameters) {
			viewManager.queue(this.vid(), key, parameters);
		};
		View.prototype.raise = function (key, parameters) {
			viewManager.raise(this.vid(), key, parameters);
		};
		View.prototype.discard = function () {
			viewManager.discard(this.vid());
		};
		View.prototype.descendant = (function (Parent) {
			function initialize(ancestor, model, parameters) {
				this.constructor.call(this, model, parameters); //ancestor.constructor.call(this, model, parameters);
				viewManager.ancestor(this.vid(), ancestor);
			}
			function child(Parent, parent, parentModel, parentParameters) {
				var surrogate = new Parent;
				function View(model, parameters) {
					initialize.call(this, parent, model || parentModel, pattern.hash.mix(parentParameters, parameters));
				}
				View.prototype = surrogate;
				View.prototype.ancestor = function () {
					return viewManager.ancestor(this.vid());
				};
				View.prototype.descendant = (function (Parent) {
					return function (model, parameters) {
						return child.call(this, Parent, this, model || parentModel, pattern.hash.mix(parentParameters, parameters));
					};
				}(View));
				viewManager.discard(surrogate.vid());
				return pattern.inherit(Parent, View);
			}
			return function (model, parameters) {
				return child.call(this, Parent, this, model, parameters);
			};
		}(View));
		View.descendant = (function (Parent) {
			function initialize(model, parameters) {
				this.constructor.call(this, model, parameters); //ancestor.constructor.call(this, model, parameters);
			}
			function child(Parent, parentModel, parentParameters) {
				var surrogate = new Parent;
				function View(model, parameters) {
					initialize.call(this, model || parentModel, pattern.hash.mix(parentParameters, parameters));
				}
				View.prototype = surrogate;
				View.descendant = (function (Parent) {
					return function (model, parameters) {
						return child.call(this, Parent, model || parentModel, pattern.hash.mix(parentParameters, parameters));
					};
				}(View));
				viewManager.discard(surrogate.vid());
				return pattern.inherit(Parent, View);
			}
			return function (model, parameters) {
				return child.call(this, Parent, model, parameters);
			};
		}(View));
		return View;

	}());

	ViewList = (function () {

		function initialize(modelList, parameters) {
			var lid, uid;
			this.lid = (function (lid) {
				return function () {
					return lid;
				};
			}(lid = createLID(createUID())));
			viewListManager.dispose(lid, this);
			if (modelList instanceof ModelList) {
				if (modelListStorage.hasModelList(uid = modelList.lid())) {
					viewListManager.modelList(lid, modelList);
					viewListManager.initialize(lid, uid, parameters || (parameters = {}));
					viewListManager.subscribe(lid, uid, parameters);
				}
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
		ViewList.prototype.queue = function (key, parameters) {
			viewListManager.queue(this.lid(), key, parameters);
		};
		ViewList.prototype.raise = function (key, parameters) {
			viewListManager.raise(this.lid(), key, parameters);
		};
		ViewList.prototype.discard = function () {
			viewListManager.discard(this.lid());
		};
		ViewList.prototype.View = View;
		ViewList.prototype.descendant = (function (Parent) {
			function initialize(ancestor, modelList, parameters) {
				this.constructor.call(this, modelList, parameters); //ancestor.constructor.call(this, modelList, parameters);
				viewListManager.ancestor(this.lid(), ancestor);
			}
			function child(Parent, parent, parentModelList, parentParameters) {
				var surrogate = new Parent;
				function ViewList(modelList, parameters) {
					initialize.call(this, parent, pattern.list.mix(parentModelList, modelList), pattern.hash.mix(parentParameters, parameters));
				}
				ViewList.prototype = surrogate;
				ViewList.prototype.ancestor = function () {
					return viewListManager.ancestor(this.lid());
				};
				ViewList.prototype.descendant = (function (Parent) {
					return function (modelList, parameters) {
						return child.call(this, Parent, this, modelList || parentModelList, pattern.hash.mix(parentParameters, parameters));
					};
				}(ViewList));
				viewListManager.discard(surrogate.lid());
				return pattern.inherit(Parent, ViewList);
			}
			return function (modelList, parameters) {
				return child.call(this, Parent, this, modelList, parameters);
			};
		}(ViewList));
		ViewList.descendant = (function (Parent) {
			function initialize(modelList, parameters) {
				this.constructor.call(this, modelList, parameters); //ancestor.constructor.call(this, modelList, parameters);
			}
			function child(Parent, parentModelList, parentParameters) {
				var surrogate = new Parent;
				function ViewList(modelList, parameters) {
					initialize.call(this, pattern.list.mix(parentModelList, modelList), pattern.hash.mix(parentParameters, parameters));
				}
				ViewList.prototype = surrogate;
				ViewList.descendant = (function (Parent) {
					return function (modelList, parameters) {
						return child.call(this, Parent, pattern.list.mix(parentModelList, modelList), pattern.hash.mix(parentParameters, parameters));
					};
				}(ViewList));
				viewListManager.discard(surrogate.lid());
				return pattern.inherit(Parent, ViewList);
			}
			return function (modelList, parameters) {
				return child.call(this, Parent, modelList, parameters);
			};
		}(ViewList));
		return ViewList;

	}());

	Controller = (function () {

		function initialize(viewList, parameters) {
			var cid, lid;
			this.cid = (function (cid) {
				return function () {
					return cid;
				};
			}(cid = createCID(createUID())));
			controllerManager.dispose(cid, this);
			if (viewList instanceof ViewList) {
				if (viewListStorage.hasViewList(lid = viewList.lid())) {
					controllerManager.viewList(cid, viewList);
					controllerManager.subscribe(cid, lid, parameters || (parameters = {}));
				}
			}
		}

		function Controller(viewList, parameters) {
			initialize.call(this, viewList, parameters);
		}
		Controller.prototype.viewList = function (viewList) {
			return controllerManager.viewList(this.cid(), viewList);
		};
		Controller.prototype.queue = function (key, parameters) {
			controllerManager.queue(this.cid(), key, parameters);
		};
		Controller.prototype.raise = function (key, parameters) {
			controllerManager.raise(this.cid(), key, parameters);
		};
		Controller.prototype.discard = function () {
			controllerManager.discard(this.cid());
		};
		Controller.prototype.descendant = (function (Parent) {
			function initialize(ancestor, viewList, parameters) {
				this.constructor.call(this, viewList, parameters); //ancestor.constructor.call(this, viewList, parameters);
				controllerManager.ancestor(this.cid(), ancestor);
			}
			function child(Parent, parent, parentViewList, parentParameters) {
				var surrogate = new Parent;
				function Controller(viewList, parameters) {
					initialize.call(this, parent, viewList || parentViewList, pattern.hash.mix(parentParameters, parameters));
				}
				Controller.prototype = surrogate;
				Controller.prototype.ancestor = function () {
					return controllerManager.ancestor(this.cid());
				};
				Controller.prototype.descendant = (function (Parent) {
					return function (viewList, parameters) {
						return child.call(this, Parent, this, viewList || parentViewList, pattern.hash.mix(parentParameters, parameters));
					};
				}(Controller));
				controllerManager.discard(surrogate.cid());
				return pattern.inherit(Parent, Controller);
			}
			return function (viewList, parameters) {
				return child.call(this, Parent, this, viewList, parameters);
			};
		}(Controller));
		Controller.descendant = (function (Parent) {
			function initialize(viewList, parameters) {
				this.constructor.call(this, viewList, parameters); //ancestor.constructor.call(this, viewList, parameters);
			}
			function child(Parent, parentViewList, parentParameters) {
				var surrogate = new Parent;
				function Controller(viewList, parameters) {
					initialize.call(this, viewList || parentViewList, pattern.hash.mix(parentParameters, parameters));
				}
				Controller.prototype = surrogate;
				Controller.descendant = (function (Parent) {
					return function (viewList, parameters) {
						return child.call(this, Parent, viewList || parentViewList, pattern.hash.mix(parentParameters, parameters));
					};
				}(Controller));
				controllerManager.discard(surrogate.cid());
				return pattern.inherit(Parent, Controller);
			}
			return function (viewList, parameters) {
				return child.call(this, Parent, viewList, parameters);
			};
		}(Controller));
		return Controller;

	}());

	function discard() {
		var allModels = modelStorage.allModels(),
			allModelLists = modelListStorage.allModelLists(),
			allViews = viewStorage.allViews(),
			allViewLists = viewListStorage.allViewLists(),
			allControllers = controllerStorage.allControllers(),
			mid,
			vid,
			cid,
			lid,
			model,
			modelList,
			view,
			viewList,
			controller;
		for (mid in allModels) {
			model = allModels[mid];
			model.discard();
		}
		for (lid in allModelLists) {
			modelList = allModelLists[lid];
			modelList.discard();
		}
		for (vid in allViews) {
			view = allViews[vid];
			view.discard();
		}
		for (lid in allViewLists) {
			viewList = allViewLists[lid];
			viewList.discard();
		}
		for (cid in allControllers) {
			controller = allControllers[cid];
			controller.discard();
		}
	}

	pid = createPID();

	channelStorage = new ChannelStorage();

	modelStorage = new ModelStorage();
	modelListStorage = new ModelListStorage();
	viewStorage = new ViewStorage();
	viewListStorage = new ViewListStorage();
	controllerStorage = new ControllerStorage();

	channelManager = new ChannelManager();

	modelManager = new ModelManager();
	modelListManager = new ModelListManager();
	viewManager = new ViewManager();
	viewListManager = new ViewListManager();
	controllerManager = new ControllerManager();

	return {

		Model: Model,
		ModelList: ModelList,
		View: View,
		ViewList: ViewList,
		Controller: Controller,

		discard: discard

	};

}());