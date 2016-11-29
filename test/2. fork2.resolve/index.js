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

describe('fork3.resolve', function () {
	var fork3 = _fork3();
	
	it('resolvs ./file1.js', function () {
		expect(() => fork3.resolve('./file1.js')).to.not.throw()
	});

	it('resolvs ./folder1/file1.js', function () {
		expect(() => fork3.resolve('./folder1/file2.js')).to.not.throw()
	});

	it('resolvs ./folder2', function () {
		expect(() => fork3.resolve('./folder2')).to.not.throw()
	});

	it('resolvs ./folder2/index', function () {
		expect(() => fork3.resolve('./folder2/index')).to.not.throw()
	});

	it('resolvs ./file1.js', function () {
		expect(() => fork3.resolve('./file1.js')).to.not.throw()
	});

	it('resolvs ./folder2/index.js', function () {
		expect(() => fork3.resolve('./folder2/index.js')).to.not.throw()
	});

});
