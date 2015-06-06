define(['pattern/pattern', 'pattern/view/view.manager', 'pattern/model/model'], function (pattern, ViewManager, Model) {

	'use strict';

	var viewManager = new ViewManager;

	function initialize(model, parameters) {
		var vid, mid;
		this.vid = (function (vid) {
			return function () {
				return vid;
			};
		}(vid = pattern.createVID(pattern.createUID())));
		viewManager.dispose(vid, this);
		if (model instanceof Model) {
			if (viewManager.hasModel(mid = model.mid())) {
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

});