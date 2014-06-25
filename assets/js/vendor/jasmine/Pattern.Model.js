describe("Pattern.Model", function () {

	var model;

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

				describe("Setting the id from an instance of the model", function () {
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
						expect(model.set("a", 3)).toBeUndefined();
						expect(model.get("a")).toBe(3);
						expect(model.set("b", 4)).toBeUndefined();
						expect(model.get("b")).toBe(4);
						expect(model.set("c", 5)).toBeUndefined();
						expect(model.get("c")).toBe(5);
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

				describe("Setting the id from an instance of the model", function () {
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
						expect(model.set("a", 3)).toBeUndefined();
						expect(model.get("a")).toBe(3);
						expect(model.set("b", 4)).toBeUndefined();
						expect(model.get("b")).toBe(4);
						expect(model.set("c", 5)).toBeUndefined();
						expect(model.get("c")).toBe(5);
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

			describe("Setting the id from an instance of the model", function () {
				it("Sets the id", function () {
					expect(model.set("id", "Changed ID")).toBeUndefined();
					expect(model.get("id")).toBe("Changed ID");
				});
			});

			describe("Getting a value from an instance of the model", function () {
				it("Gets undefined", function () {
					expect(model.get("a")).toBeUndefined();
					expect(model.get("b")).toBeUndefined();
				});
			});

			describe("Setting values on an instance of the model", function () {
				it("Sets the values", function () {
					expect(model.set("a", 3)).toBeUndefined();
					expect(model.get("a")).toBe(3);
					expect(model.set("b", 4)).toBeUndefined();
					expect(model.get("b")).toBe(4);
				});
			});

		});

	});

});