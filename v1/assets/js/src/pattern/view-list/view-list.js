define(['pattern/pattern', 'pattern/view-list/view-list.manager', 'pattern/view/view', 'pattern/model-list/model-list'], function (pattern, ViewListManager, View, ModelList) {

	'use strict';

	var viewListManager = new ViewListManager;

	function initialize(modelList, parameters) {
		var lid, uid;
		this.lid = (function (lid) {
			return function () {
				return lid;
			};
		}(lid = pattern.createLID(pattern.createUID())));
		viewListManager.dispose(lid, this);
		if (modelList instanceof ModelList) {
			if (viewListManager.hasModelList(uid = modelList.lid())) {
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
	ViewList.discard = function () {
		var lid,
			allViewLists = viewListManager.allViewLists(),
			viewList;
		for (lid in allViewLists) {
			viewList = allViewLists[lid];
			viewList.discard();
		}
	};
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

});