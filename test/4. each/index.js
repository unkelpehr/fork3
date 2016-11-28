'use strict';

var expect = require('chai').expect;

describe('fork2 return value', function () {


	it('loops a single child', function (done) {
		var fork2 = require('../../index.js');

		fork2.fork('./child.js');

		fork2.each(function (child) {
			expect(child.basename).to.equal('child.js');
			done();
		});
	});

	it('loops a multiple children', function (done) {
		var fork2 = require('../../index.js'),
			left = 3;

		function next () {
			if (!--left) {
				done();
			}
		}
		
		fork2.fork('./child.js');
		fork2.fork('./child.js');
		fork2.fork('./child.js');

		fork2.each(function (child) {
			expect(child.basename).to.equal('child.js');
			next();
		});
	});
});