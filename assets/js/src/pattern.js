define(['pattern/pattern', 'pattern/model/model', 'pattern/model-list/model-list', 'pattern/view/view', 'pattern/view-list/view-list', 'pattern/controller/controller'], function (pattern, Model, ModelList, View, ViewList, Controller) { /* jshint forin: false, maxerr: 1000 */

	"use strict";

	function discard() {
		var allModels = modelStorage.allModels(),
			allModelLists = modelListStorage.allModelLists(),
			allViews = viewStorage.allViews(),
			allViewLists = viewListStorage.allViewLists(),
			allControllers = controllerStorage.allControllers(),
			mid,
			vid,
			cid,
			lid,
			model,
			modelList,
			view,
			viewList,
			controller;
		for (mid in allModels) {
			model = allModels[mid];
			model.discard();
		}
		for (lid in allModelLists) {
			modelList = allModelLists[lid];
			modelList.discard();
		}
		for (vid in allViews) {
			view = allViews[vid];
			view.discard();
		}
		for (lid in allViewLists) {
			viewList = allViewLists[lid];
			viewList.discard();
		}
		for (cid in allControllers) {
			controller = allControllers[cid];
			controller.discard();
		}
	}

	return {

		Model: Model,
		ModelList: ModelList,
		View: View,
		ViewList: ViewList,
		Controller: Controller,

		discard: discard

	};

});