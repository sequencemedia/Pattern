define(['pattern/model/model.storage', 'pattern/manager', 'pattern/channel/channel.manager'], function (ModelStorage, Manager, ChannelManager) {

	'use strict';

	var modelStorage = new ModelStorage,
		channelManager = new ChannelManager,
		ModelManager = (function () {
			var instance;
			function initialize() { /* console.log("(ModelManager)[initialize]"); */
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
			return function ModelManager() { /* console.log("(ModelManager)"); */
				return instance || initialize.call(instance = this);
			}
		}());

	ModelManager.prototype = new Manager();
	ModelManager.prototype.allModels = function () { //modelListManager -> modelStorage.allModels()
		return modelStorage.allModels();
	};
	ModelManager.prototype.hasModel = function (mid) { //viewManager -> modelListManager.hasModel()
		return modelStorage.hasModel(mid);
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

	return ModelManager;

});