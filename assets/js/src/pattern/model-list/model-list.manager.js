define(['pattern/model/model.storage', 'pattern/model-list/model-list.storage', 'pattern/manager', 'pattern/channel/channel.manager', 'pattern/model/model.manager'], function (ModelStorage, ModelListStorage, Manager, ChannelManager, ModelManager) {

	'use strict';

	var modelStorage = new ModelStorage,
		modelListStorage = new ModelListStorage,
		channelManager = new ChannelManager,
		modelManager = new ModelManager,
		ModelListManager = (function () {
			var instance;
			return function ModelListManager() { /* console.log('(ModelListManager)') */
				return instance || (instance = this);
			}
		}());

	ModelListManager.prototype = new Manager();
	ModelListManager.prototype.allModels = function () {
		return modelManager.allModels();
	};
	ModelListManager.prototype.hasModelList = function (lid) { //modelListManager -> modelListStorage.hasModelList()
		return modelListStorage.hasModelList(lid);
	};
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

	return ModelListManager;

});