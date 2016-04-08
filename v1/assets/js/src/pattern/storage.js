define(function () {

	'use strict';

	/*
	'all' is static (accessible by all instances) not private (accessible by an instance)
	*/

	var Storage = (function () {
		var all = {};
		function Storage() {
			this.all = function () { //console.log(all);
				return all;
			};
		}
		return Storage;
	}());

	Storage.prototype = {
		fetch: function (key) {
			return (this.all())[key];
		},
		store: function (key, value) {
			(this.all())[key] = value;
		},
		purge: function (key) {
			delete (this.all())[key];
		},
		has: function (key) {
			return (key in this.all());
		}
	};

	return Storage;

});