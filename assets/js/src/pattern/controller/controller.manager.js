define(['pattern/pattern', 'pattern/view/view.storage', 'pattern/view-list/view-list.storage', 'pattern/controller/controller.storage', 'pattern/manager', 'pattern/channel/channel.manager', 'pattern/view/view.manager', 'pattern/view-list/view-list.manager', 'pattern/view/view', 'pattern/view-list/view-list'], function (pattern, ViewStorage, ViewListStorage, ControllerStorage, Manager, ChannelManager, ViewManager, ViewListManager, View, ViewList) {

	'use strict';

	var pid = pattern.createPID(),
		viewStorage = new ViewStorage,
		viewListStorage = new ViewListStorage,
		controllerStorage = new ControllerStorage,
		channelManager = new ChannelManager,
		viewManager = new ViewManager,
		viewListManager = new ViewListManager,
		ControllerManager = (function () {
			var instance;
			return function ControllerManager() { /* console.log('(ControllerManager)'); */
				return instance || (instance = this);
			}
		}());

	ControllerManager.prototype = new Manager();
	ControllerManager.prototype.hasView = function (vid) { //controllerManager -> viewManager -> viewStorage.hasView()
		return viewManager.hasView(vid);
	};
	ControllerManager.prototype.viewFor = function (vid) { //controllerManager -> viewManager -> viewStorage.hasView()
		return viewManager.viewFor(vid);
	};
	ControllerManager.prototype.view = function (cid, view) {
		var uid = (view instanceof View) ? view.vid() : null;
		return (uid) ? this.setPredicateValue(cid, 'view', uid) :
		(uid = this.getPredicateValue(cid, 'view')) ? viewStorage.fetch(uid) : null;
	};
	ControllerManager.prototype.hasViewList = function (lid) { //controllerManager -> viewListManager -> viewListStorage.hasViewList()
		return viewListManager.hasViewList(lid);
	};
	ControllerManager.prototype.viewListFor = function (lid) { //controllerManager -> viewListManager -> viewListStorage.viewListFor()
		return viewListManager.viewListFor(lid);
	};
	ControllerManager.prototype.viewList = function (cid, viewList) {
		var uid = (viewList instanceof ViewList) ? viewList.lid() : null;
		return (uid) ? this.setPredicateValue(cid, 'viewList', uid) :
		(uid = this.getPredicateValue(cid, 'viewList')) ? viewListStorage.fetch(uid) : null;
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
			if ('view' in parameters) { //controller creating subscription to custom view events
				i = 0;
				for (i, j; i < j; i = i + 1) {
					vid = viewList[i];
					channelManager.external.createSubscription(cid, vid, parameters.view);
				}
			}
			if ('view' in parameters) channelManager.external.createSubscription(cid, lid, parameters.viewList)
			else if ('viewList' in parameters) channelManager.external.createSubscription(cid, lid, parameters.viewList); //controller creating subscription to custom viewList events
			if ('controller' in parameters) channelManager.external.createSubscription(cid, pid, parameters.controller); //controller creating subscription to custom Pattern events
		};
	}());
	ControllerManager.prototype.ancestor = function (cid, controller) {
		var uid = (controller instanceof Controller) ? controller.cid() : null;
		return (uid) ? this.setPredicateValue(cid, 'ancestor', uid) :
		(uid = this.getPredicateValue(cid, 'ancestor')) ? controllerStorage.fetch(uid) : null;
	};

	return ControllerManager;

});