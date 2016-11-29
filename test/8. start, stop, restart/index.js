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

	it('can gracefully stop a process', function (done) {
		fork3.fork('./child.js', function (err) {
			var child = this;

			expect(err).to.be.null;

			child.stop(function (err) {
				expect(err).to.be.null;
				expect(child.status).to.equal('stopped');
				done();
			});
		});
	});

	it('can forcefully stop a slow process', function (done) {
		fork3.fork('./child-2-slow.js', function (err) {
			var child = this;

			child.killTimeout = 1000;

			expect(err).to.be.null;

			child.stop(function (err) {
				expect(err).to.be.null;
				expect(child.status).to.equal('stopped');
				done();
			});
		});
	});

	it('can gracefully restart a process', function (done) {
			this.timeout(5000);

		_fork3().on('child-status-change', function (child, oldStatus, newStatus) {
			console.log('%s went from %s -> %s', child.modulePath, oldStatus, newStatus);
		}).fork('./child.js', function (err) {
			var child = this;

			expect(err).to.be.null;

			child.restart(function (err) {
				expect(err).to.be.null;
				expect(child.status).to.equal('started');
				done();
			});
		});
	});
});