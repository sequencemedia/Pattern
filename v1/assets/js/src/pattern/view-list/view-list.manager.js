define(['pattern/view-list/view-list.storage', 'pattern/manager', 'pattern/channel/channel.manager', 'pattern/model/model.manager', 'pattern/model-list/model-list.manager', 'pattern/view/view.manager', 'pattern/model-list/model-list'], function (ViewListStorage, Manager, ChannelManager, ModelManager, ModelListManager, ViewManager, ModelList) {

	'use strict';

	var viewListStorage = new ViewListStorage,
		channelManager = new ChannelManager,
		modelManager = new ModelManager,
		modelListManager = new ModelListManager,
		viewManager = new ViewManager,
		ViewListManager = (function () {
			var instance;
			return function ViewListManager() { /* console.log('(ViewListManager)'); */
				return instance || (instance = this);
			}
		}());

	ViewListManager.prototype = new Manager();
	ViewListManager.prototype.allModels = function () { //viewListManager -> modelManager -> modelStorage.allModels()
		return modelManager.allModels();
	};
	ViewListManager.prototype.hasModel = function (mid) { //viewListManager -> modelManager -> modelStorage.hasModel()
		return modelManager.hasModel(mid);
	};
	ViewListManager.prototype.modelFor = function (mid) { //viewListManager -> modelManager -> modelStorage.modelFor()
		return modelManager.modelFor(mid);
	};
	ViewListManager.prototype.allModelLists = function () { //viewListManager -> modelListManager -> modelListStorage.allModelLists()
		return modelListManager.allModelLists();
	};
	ViewListManager.prototype.hasModelList = function (lid) { //viewListManager -> modelListManager -> modelListStorage.hasModelList()
		return modelListManager.hasModelList(lid);
	};
	ViewListManager.prototype.modelListFor = function (lid) { //viewListManager -> modelListManager.modelListFor()
		return modelListManager.modelListFor(lid);
	};
	ViewListManager.prototype.allViews = function () { //viewListManager -> viewManager.allViews()
		return viewManager.allViews();
	};
	ViewListManager.prototype.hasView = function (vid) { //viewListManager -> viewManager.hasView()
		return viewManager.hasView(vid);
	};
	ViewListManager.prototype.viewFor = function (vid) { //viewListManager -> viewManager.viewFor()
		return viewManager.viewFor(vid);
	};
	ViewListManager.prototype.allViewLists = function () { //viewListManager -> viewListStorage.allViewLists()
		return viewListStorage.allViewLists();
	};
	ViewListManager.prototype.hasViewList = function (lid) { //viewListManager -> viewListStorage.hasViewList()
		return viewListStorage.hasViewList(lid);
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
		channelManager.internal.broadcast(lid, 'discard');
		if (uid = ((this.allPredicates())[lid] || {})['modelList'] || null) {
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
			if (typeof index === 'number') {
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
			if (typeof index === 'number' && view instanceof View) {
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
					this.broadcast(lid, 'insert', vid);
					this.raise(lid, 'add', vid);
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
									this.broadcast(lid, 'insert', vid);
									this.raise(lid, 'add', vid);
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
										this.broadcast(lid, 'insert', vid);
										this.raise(lid, 'add', vid);
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
								this.broadcast(lid, 'delete', vid);
								this.raise(lid, 'remove', vid);
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
											this.broadcast(lid, 'delete', vid);
											this.raise(lid, 'remove', vid);
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
		return (uid) ? this.setPredicateValue(lid, 'ancestor', uid) :
		(uid = this.getPredicateValue(lid, 'ancestor')) ? viewListStorage.fetch(uid) : null;
	};
	ViewListManager.prototype.modelList = function (lid, modelList) {
		var uid = (modelList instanceof ModelList) ? modelList.lid() : null;
		return (uid) ? this.setPredicateValue(lid, 'modelList', uid) :
		(uid = this.getPredicateValue(lid, 'modelList')) ? modelListStorage.fetch(uid) : null;
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
		function discard(viewListManager, lid, vid) { //don't bind up 'mid' -- get i
			return function () { //console.log('viewListManager', viewListManager, lid, vid);
				/*
				Get the list of view instances for this viewList
				*/
				var viewList = viewListManager.viewListFor(lid),
					i = 0,
					j = viewList.length,
					mid;
				for (i, j; i < j; i = i + 1) {
					/*
					Find the view instance in this viewList
					*/
					if (viewList[i] === vid) {
						/*
						Remove this view instance from this viewList
						*/
						viewList.splice(i, 1);
						if (mid = viewListManager.modelFor(vid)) {
							/*
							Remove the hashmap reference of this view instance to its model
							*/
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
				channelManager.internal.createSubscription(lid, vid, { discard: (discard(this, lid, vid)) });
			}
			/*
				ViewList SUBSCRIBES TO ViewList INTERNAL (INSERT, DELETE, DISCARD)
			*/
			channelManager.internal.createSubscription(lid, lid, {
				insert: function (vid) {
					var mid;
					channelManager.internal.createSubscription(lid, vid, { discard: (discard(this, lid, vid)) });
					if ('model' in parameters && (mid = viewListManager.modelFor(vid))) channelManager.external.createSubscription(vid, mid, parameters.model);
				},
				delete: function (vid) {
					var mid;
					channelManager.internal.removeSubscription(vid, mid);
					if ('model' in parameters && (mid = viewListManager.modelFor(vid))) channelManager.external.removeSubscription(vid, mid);
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
				insert: (function (viewListManager) {
					return function (mid) {
						var viewList = viewListManager.viewListFor(lid),
							vid = (new this.View(modelStorage.fetch(mid))).vid();
						viewList.push(vid);
						viewList[mid] = vid;
						viewListManager.broadcast(lid, 'insert', vid);
						viewListManager.queue(lid, 'add', vid);
					}
				}(this)),
				delete: (function (viewListManager) {
					return function (mid) {
						var viewList = viewListManager.viewListFor(lid),
							vid, i, j;
						if (vid = viewList[mid]) {
							i = 0;
							j = viewList.length;
							for (i, j; i < j; i = i + 1) {
								if (viewList[i] === vid) {
									viewList.splice(i, 1);
									delete viewList[mid];
									viewListManager.broadcast(lid, 'delete', vid);
									viewListManager.queue(lid, 'remove', vid);
								}
							}
						}
					}
				}(this)),
				discard: (function (viewListManager) {
					return function () {
						channelManager.internal.removeSubscription(lid, uid);
						channelManager.external.removeSubscription(lid, uid);
						delete ((viewListManager.allPredicates())[lid] || {})['modelList'];
					};
				}(this))
			});
			if ('model' in parameters) {
				i = 0;
				for (i, j; i < j; i = i + 1) {
					vid = viewList[i];
					if (mid = viewListManager.modelFor(vid)) channelManager.external.createSubscription(vid, mid, parameters.model);
				}
			}
			if ('modelList' in parameters) channelManager.external.createSubscription(lid, uid, parameters.modelList);
		};
	}());
	ViewListManager.prototype.ViewFor = function (lid) {
		return (viewListStorage.fetch(lid) || Pattern).View;
	};

	return ViewListManager;

});