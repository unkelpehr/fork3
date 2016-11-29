'use strict';

var expect = require('chai').expect;

var _fork3 = function () {
	Object.keys(require.cache).forEach(function (path) {
		if (~path.indexOf('fork3')) {
			delete require.cache[path];
		}
	});

	return require('../../index.js');
}

describe('8. start, stop, restart', function () {
	var fork3 = _fork3();

});