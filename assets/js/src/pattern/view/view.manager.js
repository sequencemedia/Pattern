define(['pattern/view/view.storage', 'pattern/manager', 'pattern/channel/channel.manager', 'pattern/model/model.manager', 'pattern/model/model'], function (ViewStorage, Manager, ChannelManager, ModelManager, Model) {

	'use strict';

	var viewStorage = new ViewStorage,
		channelManager = new ChannelManager,
		modelManager = new ModelManager,
		ViewManager = (function () {
			var instance;
			return function ViewManager() { //console.log('(ViewManager)');
				return instance || (instance = this);
			}
		}());

	ViewManager.prototype = new Manager();
	ViewManager.prototype.allModels = function () { //viewManager -> modelManager -> modelStorage.allModels()
		return modelManager.allModels();
	};
	ViewManager.prototype.hasModel = function (mid) { //viewManager -> modelManager -> modelStorage.hasModel()
		return modelManager.hasModel(mid);
	};
	ViewManager.prototype.modelFor = function (vid) {
		return this.getPredicateValue(vid, 'model');
	};
	ViewManager.prototype.allViews = function () { //viewManager -> viewStorage.allViews()
		return viewStorage.allViews();
	};
	ViewManager.prototype.hasView = function (vid) { //viewManager -> viewStorage.hasView()
		return viewStorage.hasView(vid);
	};
	ViewManager.prototype.viewFor = function (vid) { //viewManager -> viewStorage.viewFor()
		return viewStorage.viewFor(vid);
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
		channelManager.internal.broadcast(vid, 'discard');
		if (mid = ((this.allPredicates())[vid] || {})['model'] || null) {
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
		return (uid) ? this.setPredicateValue(vid, 'ancestor', uid) :
		(uid = this.getPredicateValue(vid, 'ancestor')) ? viewStorage.fetch(uid) : null;
	};
	ViewManager.prototype.model = function (vid, model) {
		var mid = (model instanceof Model) ? model.mid() : null;
		return (mid) ? this.setPredicateValue(vid, 'model', mid) :
		(mid = this.getPredicateValue(vid, 'model')) ? modelStorage.fetch(mid) : null;
	};
	ViewManager.prototype.subscribe = function (vid, mid, parameters) {
		var viewManager = this;
		channelManager.internal.createSubscription(vid, mid, {
			discard: function () {
				channelManager.internal.removeSubscription(vid, mid);
				channelManager.external.removeSubscription(vid, mid);
				delete ((viewManager.allPredicates())[vid] || {})['model'];
			}
		});
		if ('model' in parameters) channelManager.external.createSubscription(vid, mid, parameters.model);
	};

	return ViewManager;

});