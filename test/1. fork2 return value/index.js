'use strict';

var expect = require('chai').expect,
	fork2 = require('../../index.js');

describe('fork2 return value', function () {
	it('fork2 is an object', () => expect(fork2).to.be.an.object);

	it('fork2.isParentInterface equals true', () => expect(fork2.isParentInterface).to.equal(true));
	it('fork2.isChildInterface equals false', () => expect(fork2.isChildInterface).to.equal(false));

	it('fork2.collection is an object', () => expect(fork2.collection).to.be.an.object);
	it('fork2.workingDir should equal this __dirname', () => expect(fork2.workingDir).to.equal(__dirname));

	it('fork2.each is a function', () => expect(fork2.each).to.be.a.function);
	it('fork2.fork is a function', () => expect(fork2.fork).to.be.a.function);
	it('fork2.resolve is a function', () => expect(fork2.resolve).to.be.a.function);
	it('fork2.childInterface is a function', () => expect(fork2.childInterface).to.be.a.function);

	it('fork2.on is a function', () => expect(fork2.on).to.be.a.function);
	it('fork2.off is a function', () => expect(fork2.off).to.be.a.function);
	it('fork2.once is a function', () => expect(fork2.once).to.be.a.function);
	it('fork2.emit is a function', () => expect(fork2.emit).to.be.a.function);
	it('fork2.hasListeners is a function', () => expect(fork2.hasListeners).to.be.a.function);
});