define(['pattern/pattern', 'pattern/controller/controller.manager', 'pattern/view/view', 'pattern/view-list/view-list'], function (pattern, ControllerManager, View, ViewList) {

	'use strict';

	var controllerManager = new ControllerManager,
		ViewController,
		ViewListController;

	function initialize(parameter, parameters) { //parameter, parameters
		var cid;
		this.cid = (function (cid) {
			return function () {
				return cid;
			};
		}(cid = pattern.createCID(pattern.createUID())));
		controllerManager.dispose(cid, this);
	}

	function Controller(parameter, parameters) {
		return (parameter instanceof View) ? new ViewController(parameter, parameters) : (parameter instanceof ViewList) ? new ViewListController(parameter, parameters) : initialize.call(this, parameter, parameters);
	}
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
		function initialize(ancestor, parameter, parameters) {
			this.constructor.call(this, parameter, parameters); //ancestor.constructor.call(this, parameter, parameters);
			controllerManager.ancestor(this.cid(), ancestor);
		}
		function child(Parent, parent, parentParameter, parentParameters) {
			var surrogate = new Parent;
			function Controller(parameter, parameters) {
				initialize.call(this, parent, parameter || parentParameter, pattern.hash.mix(parentParameters, parameters));
			}
			Controller.prototype = surrogate;
			Controller.prototype.ancestor = function () {
				return controllerManager.ancestor(this.cid());
			};
			Controller.prototype.descendant = (function (Parent) {
				return function (parameter, parameters) {
					return child.call(this, Parent, this, parameter || parentParameter, pattern.hash.mix(parentParameters, parameters));
				};
			}(Controller));
			controllerManager.discard(surrogate.cid());
			return pattern.inherit(Parent, Controller);
		}
		return function (parameter, parameters) {
			return child.call(this, Parent, this, parameter, parameters);
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
		function initialize(parameter, parameters) {
			this.constructor.call(this, parameter, parameters); //ancestor.constructor.call(this, parameter, parameters);
		}
		function child(Parent, parentParameter, parentParameters) {
			var surrogate = new Parent;
			function Controller(parameter, parameters) {
				initialize.call(this, parameter || parentParameter, pattern.hash.mix(parentParameters, parameters));
			}
			Controller.prototype = surrogate;
			Controller.descendant = (function (Parent) {
				return function (parameter, parameters) {
					return child.call(this, Parent, parameter || parentParameter, pattern.hash.mix(parentParameters, parameters));
				};
			}(Controller));
			controllerManager.discard(surrogate.cid());
			return pattern.inherit(Parent, Controller);
		}
		return function (parameter, parameters) {
			return child.call(this, Parent, parameter, parameters);
		};
	}(Controller));

	ViewController = (function (Parent) {
		var surrogate = new Parent;
		function Controller(parameter, parameters) {
			var vid, cid;
			initialize.call(this, parameter, parameters);
			if (controllerManager.hasView(vid = parameter.vid())) {
				controllerManager.view(cid = this.cid(), parameter);
				controllerManager.subscribe(cid, vid, parameters || (parameters = {}));
			}
		}
		Controller.prototype = surrogate;
		Controller.prototype.view = function (view) {
			return controllerManager.view(this.cid(), view);
		}
		controllerManager.discard(surrogate.cid());
		return pattern.inherit(Parent, Controller);
	}(Controller));

	ViewListController = (function (Parent) {
		var surrogate = new Parent;
		function Controller(parameter, parameters) {
			var lid, cid;
			initialize.call(this, parameter, parameters);
			if (controllerManager.hasViewList(lid = parameter.lid())) {
				controllerManager.viewList(cid = this.cid(), parameter);
				controllerManager.subscribe(cid, lid, parameters || (parameters = {}));
			}
		}
		Controller.prototype = surrogate;
		Controller.prototype.viewList = function (viewList) {
			return controllerManager.viewList(this.cid(), viewList);
		};
		controllerManager.discard(surrogate.cid());
		return pattern.inherit(Parent, Controller);
	}(Controller));

	return Controller;

});