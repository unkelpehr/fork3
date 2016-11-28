'use strict';

var expect = require('chai').expect;

describe('fork2.resolve', function () {

	it('resolvs ./file1.js', function () {
		var fork2 = require('../../index.js');

		expect(() => fork2.resolve('./file1.js')).to.not.throw()
	});

	it('resolvs ./folder1/file1.js', function () {
		var fork2 = require('../../index.js');

		expect(() => fork2.resolve('./folder1/file2.js')).to.not.throw()
	});

	it('resolvs ./folder2', function () {
		var fork2 = require('../../index.js');

		expect(() => fork2.resolve('./folder2')).to.not.throw()
	});

	it('resolvs ./folder2/index', function () {
		var fork2 = require('../../index.js');

		expect(() => fork2.resolve('./folder2/index')).to.not.throw()
	});

	it('resolvs ./file1.js', function () {
		var fork2 = require('../../index.js');

		expect(() => fork2.resolve('./file1.js')).to.not.throw()
	});

	it('resolvs ./folder2/index.js', function () {
		var fork2 = require('../../index.js');

		expect(() => fork2.resolve('./folder2/index.js')).to.not.throw()
	});

});
