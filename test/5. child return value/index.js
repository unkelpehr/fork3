'use strict';

Object.keys(require.cache).forEach((path) => path.indexOf('fork2') > -1 && delete require.cache[path]);

var expect = require('chai').expect;
var fork2 = require('../../index.js');
var child = fork2.fork('./child.js');

describe('fork2.fork() return value', function () {
	it('child is an object', () => expect(child).to.be.an.object);

	it('child.status is a string', () => expect(child.status).to.be.a.string);
	it('child.isParentInterface equals true', () => expect(child.isParentInterface).to.be.true);
	it('child.isChildInterface equals false', () => expect(child.isChildInterface).to.be.false);

	it('child.modulePath is a string', () => expect(child.modulePath).to.be.a.string);
	it('child.dirname is a string', () => expect(child.dirname).to.be.a.string);
	it('child.basename is a string', () => expect(child.basename).to.be.a.string);

	it('child.lastError is null', () => expect(child.lastError).to.be.null);

	it('child.args is an array', () => expect(child).to.be.an.array);
	it('child.options is an object', () => expect(child).to.be.an.object);

	it('child.start is a function', () => expect(child.start).to.be.a.function);
	it('child.send is a function', () => expect(child.send).to.be.a.function);
	it('child.stop is a function', () => expect(child.stop).to.be.a.function);
});