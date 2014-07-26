describe("Pattern.Model", function () {

	var model;

	afterEach(function () {
		model = null;
	});

	describe("Instantiating the Model constructor", function () {

		describe("Always", function () {

			it("Instantiates the Model constructor", function () {
				model = new Pattern.Model();
				expect(model instanceof Pattern.Model).toBe(true);
			});

		});

		describe("With pairs of keys and values", function () {

			describe("With an ID key", function () {

				beforeEach(function () {
					model = new Pattern.Model({ id: "ID", a: 1, b: 2, c: 3 }, "c");
				});

				it("Instantiates the Model constructor", function () {
					expect(model instanceof Pattern.Model).toBe(true);
				});

				describe("Getting the id from an instance of the model", function () {
					it("Gets the id", function () {
						expect(model.get("id")).toBe(3);
					});
				});

				describe("Setting the id on an instance of the model", function () {
					it("Sets the id", function () {
						expect(model.set("id", "Changed ID")).toBeUndefined();
						expect(model.get("id")).toBe("Changed ID");
					});
				});

				describe("Getting values from an instance of the model", function () {
					it("Gets the values", function () {
						expect(model.get("a")).toBe(1);
						expect(model.get("b")).toBe(2);
						expect(model.get("c")).toBe(3);
					});
				});

				describe("Setting values on an instance of the model", function () {
					it("Sets the values", function () {
						expect(model.set("a", 4)).toBeUndefined();
						expect(model.get("a")).toBe(4);
						expect(model.set("b", 5)).toBeUndefined();
						expect(model.get("b")).toBe(5);
						expect(model.set("c", 6)).toBeUndefined();
						expect(model.get("c")).toBe(6);
					});
				});

			});

			describe("Without an ID key", function () {

				beforeEach(function () {
					model = new Pattern.Model({ id: "ID", a: 1, b: 2, c: 3 });
				});

				it("Instantiates the Model constructor", function () {
					expect(model instanceof Pattern.Model).toBe(true);
				});

				describe("Getting the id from an instance of the model", function () {
					it("Gets the id", function () {
						expect(model.get("id")).toBe("ID");
					});
				});

				describe("Setting the id on an instance of the model", function () {
					it("Sets the id", function () {
						expect(model.set("id", "Changed ID")).toBeUndefined();
						expect(model.get("id")).toBe("Changed ID");
					});
				});

				describe("Getting values from an instance of the model", function () {
					it("Gets the values", function () {
						expect(model.get("a")).toBe(1);
						expect(model.get("b")).toBe(2);
						expect(model.get("c")).toBe(3);
					});
				});

				describe("Setting values on an instance of the model", function () {
					it("Sets the values", function () {
						expect(model.set("a", 4)).toBeUndefined();
						expect(model.get("a")).toBe(4);
						expect(model.set("b", 5)).toBeUndefined();
						expect(model.get("b")).toBe(5);
						expect(model.set("c", 6)).toBeUndefined();
						expect(model.get("c")).toBe(6);
					});
				});

			});

		});

		describe("Without pairs of keys and values", function () {

			beforeEach(function () {
				model = new Pattern.Model();
			});

			it("Instantiates the Model constructor", function () {
				expect(model instanceof Pattern.Model).toBe(true);
			});

			describe("Getting the id from an instance of the model", function () {
				it("Gets undefined", function () {
					expect(model.get("id")).toBeUndefined();
				});
			});

			describe("Setting the id on an instance of the model", function () {
				it("Sets the id", function () {
					expect(model.set("id", "Changed ID")).toBeUndefined();
					expect(model.get("id")).toBe("Changed ID");
				});
			});

			describe("Getting the value for a key of an undefined pair", function () {
				it("Gets undefined", function () {
					expect(model.get("x")).toBeUndefined();
				});
			});

			describe("Setting values on an instance of the model", function () {
				it("Sets the values", function () {
					expect(model.set("x", 1)).toBeUndefined();
					expect(model.get("x")).toBe(1);
				});
			});

		});

	});

	describe("Getting values from an instance of the model", function () {

		beforeEach(function () {
			model = new Pattern.Model({ id: "ID", a: 1, b: {}, c: true });
		});

		describe("Getting the value for a key of a defined pair", function () {
			it("Gets the defined value", function () {
				expect(model.get("a")).toBe(1);
				expect(model.get("b")).toEqual({});
				expect(model.get("c")).toBe(true);
			});
		});

		describe("Getting the value for a key of an undefined pair", function () {
			it("Gets an undefined value", function () {
				expect(model.get("x")).toBeUndefined();
			});
		});

		describe("Getting the values for a list of keys of defined pairs", function () {
			it("Gets the defined values", function () {
				expect(model.getEach([ "a", "b", "c" ])).toEqual({ a: 1, b: {}, c: true });
			});
		});

		describe("Getting all values for all keys of defined pairs", function () {
			it("Gets the defined values", function () {
				expect(model.getAll()).toEqual({ id: "ID", a: 1, b: {}, c: true });
			});
		});

	});

	describe("Setting values on an instance of the model", function () {

		beforeEach(function () {
			model = new Pattern.Model({ id: "ID", a: 1, b: {}, c: true });
		});

		describe("Setting the value for a key of a defined pair", function () {
			it("Sets the defined key with the value", function () {
				expect(model.set("a", 2)).toBeUndefined();
				expect(model.get("a")).toBe(2);
				expect(model.set("b", null)).toBeUndefined();
				expect(model.get("b")).toBeNull();
				expect(model.set("c", false)).toBeUndefined();
				expect(model.get("c")).toBe(false);
			});
		});

		describe("Setting the value for a key of an undefined pair", function () {
			it("Sets the undefined key with the value", function () {
				expect(model.set("x", 1)).toBeUndefined();
				expect(model.get("x")).toBe(1);
			});
		});

		describe("Setting the values for a list of keys of defined pairs", function () {
			it("Sets the defined values", function () {
				expect(model.setEach({ a: 2, b: null, c: false })).toBeUndefined();
				expect(model.getEach([ "a", "b", "c" ])).toEqual({ a: 2, b: null, c: false });
			});
		});

		describe("Setting all values for all keys of defined pairs", function () {
			it("Sets the defined values", function () {
				expect(model.setAll(null)).toBeUndefined();
				expect(model.getAll()).toEqual({ id: null, a: null, b: null, c: null });
			});
		});

	});

	describe("Zedding values on an instance of the model", function () {

		beforeEach(function () {
			model = new Pattern.Model({ id: "ID", a: 1, b: {}, c: true });
			model.setEach({ "a": 2, "b": null, "c": false, "x": 1 });
		});

		describe("Zedding the value for a key of a defined pair", function () {
			it("Zeds the defined key with the value", function () {
				expect(model.zed("a")).toBeUndefined();
				expect(model.get("a")).toBe(1);
				expect(model.zed("b")).toBeUndefined();
				expect(model.get("b")).toEqual({});
				expect(model.zed("c")).toBeUndefined();
				expect(model.get("c")).toBe(true);
			});
		});

		describe("Zedding the value for a key of an undefined pair", function () {
			it("Zeds the undefined key with the value", function () {
				expect(model.zed("x")).toBeUndefined();
				expect(model.get("x")).toBeUndefined();
			});
		});

		describe("Zedding the values for a list of keys of defined pairs", function () {
			it("Zeds the defined values", function () {
				expect(model.zedEach([ "a", "b", "c" ])).toBeUndefined();
				expect(model.getEach([ "a", "b", "c" ])).toEqual({ a: 1, b: {}, c: true });
			});
		});

		describe("Zedding all values for all keys of defined pairs", function () {
			it("Zeds the defined values", function () {
				expect(model.zedAll()).toBeUndefined();
				expect(model.getAll()).toEqual({ id: "ID", a: 1, b: {}, c: true, x: undefined });
			});
		});

	});

	describe("Unsetting values on an instance of the model", function () {

		beforeEach(function () {
			model = new Pattern.Model({ id: "ID", a: 1, b: {}, c: true });
			model.setEach({ "id": "Changed ID", "a": 2, "b": null, "c": false, "x": 1 });
		});

		describe("Unsetting the value for a key of a defined pair", function () {
			it("Unsets the defined key with the value", function () {
				expect(model.unset("a")).toBeUndefined();
				expect(model.get("a")).toBeUndefined();
				expect(model.unset("b")).toBeUndefined();
				expect(model.get("b")).toBeUndefined();
				expect(model.unset("c")).toBeUndefined();
				expect(model.get("c")).toBeUndefined();
			});
		});

		describe("Unsetting the value for a key of an undefined pair", function () {
			it("Unsets the undefined key with the value", function () {
				expect(model.unset("x")).toBeUndefined();
				expect(model.get("x")).toBeUndefined();
			});
		});

		describe("Unsetting the values for a list of keys of defined pairs", function () {
			it("Unsets the defined values", function () {
				expect(model.unsetEach([ "a", "b", "c" ])).toBeUndefined();
				expect(model.getEach([ "a", "b", "c" ])).toEqual({ a: undefined, b: undefined, c: undefined });
			});
		});

		describe("Unsetting all values for all keys of defined pairs", function () {
			it("Unsets the defined values", function () {
				expect(model.unsetAll()).toBeUndefined();
				expect(model.getAll()).toEqual({});
			});
		});

	});

	describe("Resetting values on an instance of the model", function () {

		beforeEach(function () {
			model = new Pattern.Model({ id: "ID", a: 1, b: {}, c: true }, "potatoes");
			model.setEach({ "id": "Changed ID", "a": 2, "b": null, "c": false, "x": 1 });
		});

		describe("Resetting the value for a key of a defined pair", function () {
			it("Resets the defined key with the value", function () {
				expect(model.reset("a")).toBeUndefined();
				expect(model.get("a")).toBe(1);
				expect(model.reset("b")).toBeUndefined();
				expect(model.get("b")).toEqual({});
				expect(model.reset("c")).toBeUndefined();
				expect(model.get("c")).toBe(true);
			});
		});

		describe("Resetting the value for a key of an undefined pair", function () {
			it("Resets the undefined key with the value", function () {
				expect(model.reset("x")).toBeUndefined();
				expect(model.get("x")).toBeUndefined();
			});
		});

		describe("Resetting the values for a list of keys of defined pairs", function () {
			it("Resets the defined values", function () {
				expect(model.resetEach([ "a", "b", "c" ])).toBeUndefined();
				expect(model.getEach([ "a", "b", "c" ])).toEqual({ a: 1, b: {}, c: true });
			});
		});

		describe("Resetting all values for all keys of defined pairs", function () {
			it("Resets the defined values", function () {
				expect(model.resetAll()).toBeUndefined();
				expect(model.getAll()).toEqual({ id: "ID", a: 1, b: {}, c: true });
			});
		});

	});

});