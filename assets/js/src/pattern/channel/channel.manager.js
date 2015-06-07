define(['pattern/channel/channel.storage', 'pattern/manager'], function (ChannelStorage, Manager) {

	'use strict';

	var channelStorage = new ChannelStorage,
		ChannelManager = (function () {
			var instance;
			function initialize() {
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
						if (typeof (method = methods[key]) === 'function') {
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
			};
			return function ChannelManager() { /* console.log('(ChannelManager)'); */
				return instance || initialize.call(instance = this);
			};
		}());

	ChannelManager.prototype = new Manager();
	ChannelManager.prototype.contextFor = function (uid) {
		return channelStorage.fetch(uid);
	};

	return ChannelManager;

});