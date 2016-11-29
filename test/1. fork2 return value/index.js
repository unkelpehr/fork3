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

	it('fork3 is an object', () => expect(fork3).to.be.an.object);

	it('fork3.isParentInterface equals true', () => expect(fork3.isParentInterface).to.equal(true));
	it('fork3.isChildInterface equals false', () => expect(fork3.isChildInterface).to.equal(false));

	it('fork3.collection is an object', () => expect(fork3.collection).to.be.an.object);
	it('fork3.workingDir should equal this __dirname', () => expect(fork3.workingDir).to.equal(__dirname));

	it('fork3.each is a function', () => expect(fork3.each).to.be.a.function);
	it('fork3.fork is a function', () => expect(fork3.fork).to.be.a.function);
	it('fork3.resolve is a function', () => expect(fork3.resolve).to.be.a.function);
	it('fork3.childInterface is a function', () => expect(fork3.childInterface).to.be.a.function);

	it('fork3.on is a function', () => expect(fork3.on).to.be.a.function);
	it('fork3.off is a function', () => expect(fork3.off).to.be.a.function);
	it('fork3.once is a function', () => expect(fork3.once).to.be.a.function);
	it('fork3.emit is a function', () => expect(fork3.emit).to.be.a.function);
	it('fork3.hasListeners is a function', () => expect(fork3.hasListeners).to.be.a.function);
});