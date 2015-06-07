define(['pattern/pattern', 'pattern/controller/controller.manager', 'pattern/view/view', 'pattern/view-list/view-list'], function (pattern, ControllerManager, View, ViewList) {

	'use strict';

	var controllerManager = new ControllerManager;

	function initialize(parameter, parameters) { //parameter, parameters
		var cid, uid;
		this.cid = (function (cid) {
			return function () {
				return cid;
			};
		}(cid = pattern.createCID(pattern.createUID())));
		controllerManager.dispose(cid, this);
		if (parameter instanceof View) {
			if (controllerManager.hasView(uid = parameter.vid())) {
				controllerManager.view(cid, parameter);
				controllerManager.subscribe(cid, uid, parameters || (parameters = {}));
			}
		} else if (parameter instanceof ViewList) {
			if (controllerManager.hasViewList(uid = parameter.lid())) {
				controllerManager.viewList(cid, parameter);
				controllerManager.subscribe(cid, uid, parameters || (parameters = {}));
			}
		}
	}

	function Controller(parameter, parameters) {
		initialize.call(this, parameter, parameters);
	}
	Controller.prototype.view = function (view) {
		return controllerManager.view(this.cid(), view);
	};
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
	Controller.discard = function () {
		var cid,
			allControllers = controllerManager.allControllers(),
			controller;
		for (cid in allControllers) {
			controller = allControllers[cid];
			controller.discard();
		}
	};
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

});