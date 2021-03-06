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

describe('fork3.fork', function () {
	var fork3 = _fork3();

	it('fork3.fork([]) throws TypeError', function () {
		expect(() => fork3.fork([])).to.throw(TypeError)
	});

	it('fork3.fork({}) throws TypeError', function () {
		expect(() => fork3.fork({})).to.throw(TypeError)
	});

	it('fork3.fork("") throws TypeError', function () {
		expect(() => fork3.fork("")).to.throw(TypeError)
	});

	it('fork3.fork(true) throws TypeError', function () {
		expect(() => fork3.fork(true)).to.throw(TypeError)
	});

	it('fork3.fork(false) throws TypeError', function () {
		expect(() => fork3.fork(false)).to.throw(TypeError)
	});

	it('fork3.fork(1) throws TypeError', function () {
		expect(() => fork3.fork(1)).to.throw(TypeError)
	});

	it('fork3.fork("./child.js") does not throw', function () {
		var fork3 = require('../../index.js');
		expect(() => fork3.fork('./child.js')).to.not.throw()
	});

	it('fork("./child.js", ["test"]) adds "test" to the child process` arguments list', function () {
		var fork3 = require('../../index.js');
		expect(fork3.fork('./child.js', ['test']).args[0]).to.equal('test');
	});

	it('fork("./child.js", [], {foo: "bar"}) adds {foo: "bar"} to the child process` options object', function () {
		var fork3 = require('../../index.js');
		expect(fork3.fork('./child.js', [], {foo: 'bar'}).options.foo).to.equal('bar');
	});

	it('fork("./child.js", {foo: "bar"}) adds {foo: "bar"} to the child process` options object', function () {
		var fork3 = require('../../index.js');
		expect(fork3.fork('./child.js', {foo: 'bar'}).options.foo).to.equal('bar');
	});

	it('fork() callback function is executed for non-faulty child', function (done) {
		var fork3 = require('../../index.js');

		fork3.fork('./child.js', function (err) {
			expect(err).to.be.null;
			done();
		});
	});

	it('fork() callback function is executed for faulty child', function (done) {
		var fork3 = require('../../index.js');

		fork3.fork('./child-broken.js', function (err) {
			expect(err).to.be.an('object');
			done();
		});
	});

	it('fork() callback function is executed for missing child', function (done) {
		var fork3 = require('../../index.js');

		fork3.fork('./child-missing.js', function (err) {
			expect(err).to.be.an.error;
			done();
		});
	});
});