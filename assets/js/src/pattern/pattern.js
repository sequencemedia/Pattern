define(function () {

	'use strict';

	return {
		inherit: (function () {
			var has = Object.prototype.hasOwnProperty;
			return function inherit(alpha, omega) {
				var key;
				alpha = (alpha || false).constructor === Function ? alpha : function () { };
				omega = (omega || false).constructor === Function ? omega : function () { };
				for (key in alpha) {
					if (has.call(alpha, key) === true) {
						if (has.call(omega, key) === false) {
							omega[key] = alpha[key];
						}
					}
				}
				return omega;
			};
		}()),
		list : (function () {
			function indexOf(array, value) {
				var i = 0,
					j = array.length;
				do {
					if (array[i] === value) return i;
				} while (++i < j);
				return null;
			}
			return {
				has: function (array, value) {
					return indexOf(array, value) !== null;
				},
				mix: (function() {
					function mix(alpha, omega) {
						var i = 0,
							j = omega.length,
							value;
						for (i, j; i < j; i = i + 1) { //because i and j may be zero
							value = omega[i];
							if (indexOf(alpha, value) === null) {
								alpha.push(value);
							}
						}
						return alpha;
					}
					return function (alpha, omega) {
						return mix(mix([], (alpha || false).constructor === Array ? alpha : []), (omega || false).constructor === Array ? omega : []); //return mix((alpha || false).constructor === Array ? alpha : [], (omega || false).constructor === Array ? omega : []);
					};
				}())
			};
		}()),
		hash : (function () {
			var has = Object.prototype.hasOwnProperty;
			return {
				has: function (object, key) {
					return has.call(object, key);
				},
				mix: (function () {
					function mix (alpha, omega) {
						var key;
						for (key in alpha) {
							if (has.call(alpha, key) === true) {
								if (has.call(omega, key) === false) {
									omega[key] = alpha[key];
								}
							}
						}
						return omega;
					}
					return function (alpha, omega) {
						return mix(mix({}, (alpha || false).constructor === Object ? alpha : {}), (omega || false).constructor === Object ? omega : {});
					};
				}())
			};
		}()),
		createPID: (function () {
			var uidPattern = "nn-n-n-n-nnn",
				expression = /n/ig;
			function uid() {
				return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
			}
			return function () {
				return uidPattern.replace(expression, uid);
			};
		}()),
		createUID: (function () {
			var count = 1e9;
			return function () {
				return (count = count + 1).toString(16);
			};
		}()),
		createLID: function (uid) { return "lid-" + uid; },
		createMID: function (uid) { return "mid-" + uid; },
		createVID: function (uid) { return "vid-" + uid; },
		createCID: function (uid) { return "cid-" + uid; }
	};

});