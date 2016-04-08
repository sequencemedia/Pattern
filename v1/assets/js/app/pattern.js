require(['common'], function () {
	/*
		baseUrl is 'src' but, y'know, require ... :(
	*/
	require(['../src/pattern'], function (Pattern) {

		console.log(Pattern)

		var model = new Pattern.Model({ id: 1 }),
			modelList = new Pattern.ModelList([{ id: 2 }]),
			view = new Pattern.View(model),
			viewList = new Pattern.ViewList(modelList),
			viewController = new Pattern.Controller(view),
			viewListController = new Pattern.Controller(viewList);
		var i, j;

		for (i = 0, j = 1000; i < j; i++) {
			model = new Pattern.Model({ id: i + 1 });
			view = new Pattern.View(model);
			viewController = new Pattern.Controller(view);
		}

		for (i = 0, j = 1000; i < j; i++) {
			modelList = new Pattern.ModelList([{ id: i + 1 }]);
			viewList = new Pattern.ViewList(modelList);
			viewListController = new Pattern.Controller(viewList);
		}

		console.log(model, model.get('id'));
		console.log(modelList, modelList.get(0).get('id'));
		console.log(view);
		console.log(viewList);
		console.log(viewController, viewController instanceof Pattern.Controller);
		console.log(viewListController, viewListController instanceof Pattern.Controller);
		console.log(viewController.view() instanceof Pattern.View);
		console.log(viewListController.viewList() instanceof Pattern.ViewList);

		Pattern.discard();

	});

});