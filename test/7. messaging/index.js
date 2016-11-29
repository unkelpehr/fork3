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

describe('messaging', function () {

	it('child answers requests', function (done) {
		var fork3 = _fork3(),
			child = fork3.fork('./child.js');

		child.send('toUpperCase', 'lolwhut', function (err, res) {
			if (err) {
				throw err;
			}

			expect(res).to.equal('LOLWHUT');
			done();
		});
	});

	it('error argument is set if there are no listener on the child side', function (done) {
		var fork3 = _fork3(),
			child = fork3.fork('./child.js');

		child.send('asdf', function (err, res) {
			expect(err).to.be.an.error;
			expect(err.name).to.equal('NO_LISTENER_FOUND');
			done();
		});
	});

	it('error argument is set if the child responds with an error object', function (done) {
		var fork3 = _fork3(),
			child = fork3.fork('./child.js');

		child.send('handledError', function (err, res) {
			expect(err).to.be.an.error;
			expect(err.name).to.equal('TypeError');
			done();
		});
	});

	it('error argument is set if the child listener encounters an unhandled error', function (done) {
		var fork3 = _fork3(),
			child = fork3.fork('./child.js');

		child.send('unhandledError', function (err, res) {
			expect(err).to.be.an.error;
			expect(err.name).to.equal('TypeError');
			done();
		});
	});

	it('sending messages to a child which exists without answering executes the callback with an error', function (done) {
		var fork3 = _fork3(),
			child = fork3.fork('./child-empty.js');

		child.send('lolwhut', function (err, res) {
			expect(err).to.be.an.error;
			done();
		});
	});

	// Hur????????????????
	/*it('callback function is executed if the child does not take in the "respond" parameter', function (done) {
		var fork3 = _fork3(),
			child = fork3.fork('./child.js');

		child.send('noRespond', function (err) {
			done();
		});
	});

	// Hur????????????????
	it('callback function is executed if the child does not take in the "respond" parameter but returns a value other than "undefined"', function (done) {
		var fork3 = _fork3(),
			child = fork3.fork('./child.js');

		child.send('returnedRespond', function (err) {
			done();
		});
	});*/

	it('callback function is only executed once even if the child respond multiple times. a global "error" is emitted.', function (done) {
		var fork3 = _fork3(),
			child = fork3.fork('./child.js'),
			left = 3;

		function next () {
			if (!--left) {
				done();
			}
		}

		child.send('respondMultiple', function (err) {
			expect(err).to.be.null;
			next();
		}).on('error', function (err) {
			expect(err).to.be.an.error;
			expect(err.name).to.equal('UNKNOWN_ACKID');
			next();
		});
	});

	// EPIPE???
	/*
	it('sending messages to a child which exists without answering executes the callback with an error', function (done) {
		var fork3 = _fork3(),
			child = fork3.fork('./child-empty.js');

		child.on('status-change', function (oldStatus, newStatus) {
			console.log(oldStatus, newStatus);
		});

		child.send('lolwhut', function (err, res) {
			expect(err).to.be.an.error;
			done();
		});
	});
	*/

	// TODO: Tests for making sure that we can listen to requests from the child process
	/*
	it('sending messages to a child which exists without answering executes the callback with an error', function (done) {
		var fork3 = _fork3(),
			child = fork3.fork('./child-empty.js');

		child.on('status-change', function (oldStatus, newStatus) {
			console.log(oldStatus, newStatus);
		});

		child.send('lolwhut', function (err, res) {
			expect(err).to.be.an.error;
			done();
		});
	});
	*/
});