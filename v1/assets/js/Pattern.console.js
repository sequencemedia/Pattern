var model = new Pattern.Model({ id: 1 });
var modelList = new Pattern.ModelList([{ id: 1 }, { id: 2 }]);
var view = new Pattern.View(model, {
	model: {
		id: function (event) { console.log("View:model.set('id')", event); }
	}
});
var viewList = new Pattern.ViewList(modelList, {
	model: {
		id: function (event) { console.log("View:model.set('id')", event, this); } //subscribes in initialize()
	},
	modelList: {
		add: function (event) { console.log("ViewList:modelList.add(model)", event); },
		remove: function (event) { console.log("ViewList:modelList.remove(model)", event); }
	}
});
var controller = new Pattern.Controller(viewList, {
	view: {
		id: function (event) { console.log("Controller:view.set('id')", event); }
	},
	viewList: {
		add: function (event) { console.log("Controller:viewList.add(view)", event); },
		remove: function (event) { console.log("Controller:viewList.remove(view)", event); }
	} });

You can inherit from the constructor:

var Model1 = Pattern.Model.descendant();

You can then append methods to that constructor as you might with any other:

Model1.prototype.sum = function (x, y) { return x + y; };

You inherit from that constructor:

var Model2 = Model1.descendant();
Model2.prototype.sub = function (x, y) { return x - y; };

Alternatively, you can inherit from an instance of the constructor:

var model = new Pattern.Model();
var Model1 = model.descendant();

And you can inherit again from an instance of that constructor:

var model1 = new Model1();
var Model2 = model1.descendant();

Model1.prototype.sum = function (x, y) { return x + y; };


usage:
	1	var model = new Pattern.Model();
	2	var model = new Pattern.Model({ id: 1 });

Or you can inherit from the instance:

var Model = model.descendant();

Inheriting from an instance initialises descendants with all the attributes of that instance.

var Model1 = Pattern.Model.descendant();
Model1.prototype.sum = function (x, y) { return x + y; };

var Model2 = Pattern.Model.descendant();
Model2.prototype.sub = function (x, y) { return x - y; };

var ModelA = Model1.descendant();
ModelA.prototype.A = function () { return "A"; };

var ModelB = Model2.descendant();
ModelB.prototype.B = function () { return "B"; };

for (key in Model1.prototype) { console.log(key);
	if (Object.prototype.hasOwnProperty.call(Model1.prototype, key) === true) { console.log("a.prototype", key);
		if (Object.prototype.hasOwnProperty.call(Model2.prototype, key) === false) { console.log("o.prototype", key);
			Model2.prototype[key] = Model1.prototype[key];
		}
	}
}

for (key in Model2.prototype) { console.log(key);
	if (Object.prototype.hasOwnProperty.call(Model2.prototype, key) === true) { console.log("a.prototype", key);
		if (Object.prototype.hasOwnProperty.call(Model3.prototype, key) === false) { console.log("o.prototype", key);
			Model3.prototype[key] = Model2.prototype[key];
		}
	}
}

var model1 = new Model1();
var model2 = new Model2();
var model3 = new Model3();

model1.sum;
model1.div;
model1.ply;
model2.sum;
model2.div;
model2.ply;
model3.sum;
model3.div;
model3.ply;

Model2 = Model1.descendant();

			return function (Ancestor) { //descendant

				function Model() {
					initialize.call(this);
				}
				Model.prototype = Ancestor ? new Ancestor : new ancestor.constructor;
				Model.prototype.descendant = (function () {

					return function () {

						return descendant.call(this, Model);

					}

				}(Model));

				return Model;

			}

	function Model() { }
	Model.prototype.descendant = (function () {

	}());

	var descendant = (function () {

		function initialize(ancestor) {

		}

		return (function (Ancestor) {

			return function (Parent, parentPairs, parentIdKey) { //descendant

				var prototype = Parent ? new Parent : new Ancestor,
					parent = this;

				function Model(pairs, idKey) {
					initialize.call(this, parent);
				}
				Model.prototype = prototype;
				Model.prototype.descendant = (function (Parent) {

					return function (pairs, idKey) {
						return descendant.call(this, Parent, pairs, idKey);
					}

				}(Model));

				return Model;

			}

		}(Model));

	}());

	function Model() { }
	Model.prototype.descendant = descendant;
	//Model.descendant = descendant;

		/*
		var descendant = (function (Ancestor) {

			function initialize(ancestor, pairs, idKey) {
				var mid;
				//ancestor.constructor.call(this, pairs, idKey);
				//modelManager.ancestor(mid = this.mid(), ancestor);
				//modelManager.inherit(ancestor.mid(), mid);
			}

			return function (pairs, idKey) {

				return (function (Parent, parentPairs, parentIdKey) {

					var prototype = Parent ? new Ancestor : new Parent;
console.log("Parent", Parent);
					function Model(pairs, idKey) { //merge the pairs object
						initialize.call(this); //, ancestor, pattern.hash.mix(ancestorPairs, pairs), idKey || ancestorIdKey);
					}
					Model.prototype = prototype;
					Model.prototype.ancestor = function () {
						return modelManager.ancestor(this.mid());
					};
					Model.prototype.descendant = (function () {

						return function (pairs, idKey) {

							return descendant.call(this, Model, pairs, idKey);

						}

					}(Model));
					//Model.descendant = descendant;

					return Model; //pattern.inherit(ancestor.constructor, Model);

				}(Model, pairs, idKey));
			};
		}(Model));
		*/

	var ModelA = Model,
		ModelB,
		ModelC,
		modelA,
		modelB,
		modelC;

	ModelA = (new Model).descendant();
	ModelA.prototype.A = function () { };
	modelA = new ModelA();

	ModelB = modelA.descendant();
	ModelB.prototype.B = function () { };
	modelB = new ModelB();

	ModelC = modelB.descendant();
	ModelC.prototype.C = function () { };
	modelC = new ModelC();

	console.log(modelA instanceof Model);
	console.log(modelB instanceof Model);
	console.log(modelC instanceof Model);

	var Model = Pattern.Model,
		ModelA,
		ModelB,
		ModelC,
		model,
		modelA,
		modelB,
		modelC;

	ModelA = (model = new Model).descendant({ ID: 1 }, "ID");
	ModelA.prototype.A = function () { return "A"; };
	ModelA.a = "A";
	modelA = new ModelA();

	ModelB = modelA.descendant({ ID: 2 }, "ID");
	ModelB.prototype.B = function () { return "B"; };
	ModelB.b = "B";
	modelB = new ModelB();

	ModelC = modelB.descendant({ ID: 3 }, "ID");
	ModelC.prototype.C = function () { return "C"; };
	ModelC.c = "C";
	modelC = new ModelC();

	console.log(modelA instanceof Model);
	console.log(modelB instanceof Model);
	console.log(modelC instanceof Model);

	/* EVENTS - SUBSCRIPTIONS */
	var modelList = new Pattern.ModelList([{ id: 1 }, { id: 2 }, { id: 3 }]);
	var viewList = new Pattern.ViewList(modelList, { model: { id: function (event) { console.log(event); this.raise("id", { was: event }); } }, modelList: { add: function (event) { console.log(event); }, remove: function (event) { console.log(event); } } });
	var controller = new Pattern.Controller(viewList, { view: { id: function (event) { console.log(event); this.raise("id", { was: event }); } }, viewList: { add: function (event) { console.log(event); }, remove: function (event) { console.log(event); } } });

	//INCREMENT THE ID OF THE MODEL AND THE SUBSCRIBING VIEW REACTS
	//viewList.modelList().get(0).set("id", viewList.modelList().get(0).get("id") + 1);

	viewList.modelList().add(new patternn.Model({ id: 4 }));
	viewList.modelList().add(new Pattern.Model({ id: 5 }));
	viewList.modelList().add(new Pattern.Model({ id: 6 }));

	var model = new Pattern.Model({ id: 2 });
	viewList.modelList().add(model);
	viewList.modelList().remove(model);

	var modelA = new Pattern.Model({ id: 3 });
	viewList.modelList().add(modelA);

	var modelB = new Pattern.Model({ id: 4 });
	viewList.modelList().add(modelB);

	var viewA = new Pattern.View(modelA, { model: { id: function (event) { console.log(event, this); } } });
	var viewB = new Pattern.View(modelB, { model: { id: function (event) { console.log(event, this); } } });

	viewList.modelList().remove(modelA);

	viewList.modelList().remove(modelB);

	model.set("id", "id");

	modelList.get(0).discard();
	modelList.discard();

	viewList.get(0).discard();
	viewList.discard();

	controller.discard();

/*
window.channelStorage = channelStorage;
window.channelManager = channelManager;

window.modelStorage = modelStorage;
window.modelListStorage = modelListStorage;
window.viewStorage = viewStorage;
window.viewListStorage = viewListStorage;
window.controllerStorage = controllerStorage;

window.modelManager = modelManager;
window.modelListManager = modelListManager;
window.viewManager = viewManager;
window.viewListManager = viewListManager;
window.controllerManager = controllerManager;
*/


		var viewList = this.viewListFor(lid),
			modelList = this.modelListFor(uid), //modelList.all();
			allModels = this.allModels(),
			i, j,
			mid,
			model,
			View = this.ViewFor(lid),
			view,
			vid;
		for (i = 0, j = modelList.length; i < j; i = i + 1) {
			mid = modelList[i];
			model = allModels[mid];
			view = new View(model, parameters);
			vid = view.vid();
			viewList.push(vid);
			viewList[mid] = vid;
			/*
				ViewList SUBSCRIBES TO View (DISCARD)
			*//*
			channels.internal.createSubscription(lid, vid, { //create view list subscription to view discard event
				discard: (function (lid, vid) { //don't bind up "mid" -- get it afresh (model may have been discarded)
					return function () { console.log("ViewListManager.prototype.initialize():channels.internal.createSubscription():discard()", vid, this); //context is "ViewList" not "ViewListManager"
						var viewList = viewListManager.viewListFor(lid),
							i = 0,
							j = viewList.length;
						for (i, j; i < j; i = i + 1) {
							if (viewList[i] === vid) { //console.log(i, vid, mid);
								viewList.splice(i, 1);
								if (mid = viewListManager.modelFor(vid)) { //console.log(i, vid, mid);
									delete viewList[mid];
								}
								channels.internal.removeSubscription(lid, vid); //remove view list subscription to view discard event
								break;
							}
						};
					}
				}(lid, vid))
			}); */
		}
		/*
			ViewList SUBSCRIBES TO ViewList (INSERT + DELETE)
		*/
		/*
		channels.internal.createSubscription(lid, lid, { //create view list subscription to view discard event
			insert: function (vid) { console.log("ViewListManager.prototype.initialize():channels.internal.createSubscription():insert()", vid);
				var mid;
				channels.internal.createSubscription(lid, vid, {
					discard: (function (lid, vid) {
						return function () { console.log("ViewListManager.prototype.initialize():channels.internal.createSubscription():discard()", vid, this); //context is "ViewList" not "ViewListManager"
							var viewList = viewListManager.viewListFor(lid),
								i = 0,
								j = viewList.length,
								mid;
							for (i, j; i < j; i = i + 1) {
								if (viewList[i] === vid) { //console.log(i, vid);
									viewList.splice(i, 1);
									if (mid = viewListManager.modelFor(vid)) { //console.log(i, vid, mid);
										delete viewList[mid];
									}
									channels.internal.removeSubscription(lid, vid); //remove view list subscription to view discard event
									break;
								}
							};
						}
					}(lid, vid))
				});
				if ("model" in parameters) {
					if (mid = viewListManager.modelFor(vid)) { //console.log(i, vid, mid);
						channels.external.createSubscription(vid, mid, parameters.model);
					}
				}
			},
			delete: function (vid) { console.log("ViewListManager.prototype.initialize():channels.internal.createSubscription():delete()", vid);
				var mid;
				channels.internal.removeSubscription(lid, vid);
				if ("model" in parameters) {
					if (mid = viewListManager.modelFor(vid)) { //console.log(i, vid, mid);
						channels.external.removeSubscription(vid, mid);
					}
				}
			}
		});
*/