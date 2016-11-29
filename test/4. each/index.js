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

describe('fork3 return value', function () {
	var fork3 = _fork3();

	it('loops a single child', function (done) {
		var fork3 = require('../../index.js');

		fork3.fork('./child.js');

		
		fork3.each(function (child) {
			expect(child.basename).to.equal('child.js');
			done();
		});
	});

	it('loops a multiple children', function (done) {
		var fork3 = require('../../index.js'),
			left = 3;

		function next () {
			if (!--left) {
				done();
			}
		}
		
		fork3.fork('./child.js');
		fork3.fork('./child.js');
		fork3.fork('./child.js');

		fork3.each(function (child) {
			expect(child.basename).to.equal('child.js');
			next();
		});
	});
});