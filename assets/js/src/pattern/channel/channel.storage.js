define(['pattern/storage'], function (Storage) {

	'use strict';

	function ChannelStorage() { /* console.log('(ChannelStorage)'); */ }
	ChannelStorage.prototype = new Storage();

	return ChannelStorage;

});