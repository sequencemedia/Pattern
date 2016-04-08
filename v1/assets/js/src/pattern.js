define(['pattern/model/model', 'pattern/model-list/model-list', 'pattern/view/view', 'pattern/view-list/view-list', 'pattern/controller/controller'], function (Model, ModelList, View, ViewList, Controller) { /* jshint forin: false, maxerr: 1000 */

	'use strict';

	return {

		Model: Model,
		ModelList: ModelList,
		View: View,
		ViewList: ViewList,
		Controller: Controller,

		discard: function () {
			Model.discard();
			ModelList.discard();
			View.discard();
			ViewList.discard();
			Controller.discard();
		}

	};

});