define(function () {

	'use strict';

	/*
	"attributes" and "predicates" are private
	*/

	function Manager() {
		var attributes = {},
			predicates = {};
		this.allAttributes = function () { //console.log(attributes);
			return attributes;
		};
		this.allPredicates = function () { //console.log(predicates);
			return predicates;
		};
	}

	Manager.prototype = {
		attributesFor: function (uid) {
			var attributes = this.allAttributes();
			return (attributes[uid] || (attributes[uid] = {}));
		},
		getAttributeValue: function (uid, key) {
			return (this.attributesFor(uid))[key];
		},
		setAttributeValue: function (uid, key, value) {
			(this.attributesFor(uid))[key] = value;
		},
		predicatesFor: function (uid) {
			var predicates = this.allPredicates();
			return (predicates[uid] || (predicates[uid] = {}));
		},
		getPredicateValue: function (uid, key) {
			return (this.predicatesFor(uid))[key];
		},
		setPredicateValue: function (uid, key, value) {
			(this.predicatesFor(uid))[key] = value;
		}
	};

	return Manager;

});