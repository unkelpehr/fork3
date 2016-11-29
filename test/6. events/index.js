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

describe('events', function () {

	it('(WORKING CHILD) "child-status-change" goes from nothing -> created -> starting -> started', function (done) {
		var count = 0,
			fork3 = _fork3();

		fork3.on('child-status-change', function (child, oldStatus, newStatus, error) {
			count++;

			switch (count) {
				case 1:
					expect(oldStatus).to.equal('nothing');
					expect(newStatus).to.equal('created');
				break;

				case 2:
					expect(oldStatus).to.equal('created');
					expect(newStatus).to.equal('starting');
				break;

				case 3:
					expect(oldStatus).to.equal('starting');
					expect(newStatus).to.equal('started');
					expect(error).to.be.null;
					done();
				break;
			}
		});

		fork3.fork('./child.js');
	});

	it('(WORKING CHILD) child-status-nothing -> child-status-created -> child-status-starting -> child-status-started', function (done) {
		var count = 0,
			fork3 = _fork3();

		function callback (child, oldStatus, newStatus, error) {
			count++;

			switch (count) {
				case 1:
					expect(oldStatus).to.equal('nothing');
					expect(newStatus).to.equal('created');
				break;

				case 2:
					expect(oldStatus).to.equal('created');
					expect(newStatus).to.equal('starting');
				break;

				case 3:
					expect(oldStatus).to.equal('starting');
					expect(newStatus).to.equal('started');
					expect(error).to.be.null;
					done();
				break;
			}
		}

		fork3.on('child-status-nothing', callback);
		fork3.on('child-status-created', callback);
		fork3.on('child-status-starting', callback);
		fork3.on('child-status-started', callback);
		fork3.on('child-status-errored', callback);

		fork3.fork('./child.js');
	});


	it('(BROKEN CHILD) "child-status-change" goes from nothing -> created -> starting -> errored', function (done) {
		var count = 0,
			fork3 = _fork3();

		fork3.on('child-status-change', function (child, oldStatus, newStatus, error) {
			count++;

			switch (count) {
				case 1:
					expect(oldStatus).to.equal('nothing');
					expect(newStatus).to.equal('created');
				break;

				case 2:
					expect(oldStatus).to.equal('created');
					expect(newStatus).to.equal('starting');
				break;

				case 3:
					expect(oldStatus).to.equal('starting');
					expect(newStatus).to.equal('errored');
					expect(error).to.be.an.error;
					done();
				break;
			}
		});

		fork3.fork('./child-broken.js');
	});

	it('(BROKEN CHILD) child-status-nothing -> child-status-created -> child-status-starting -> child-status-errored', function (done) {
		var count = 0,
			fork3 = _fork3();

		function callback (child, oldStatus, newStatus, error) {
			count++;

			switch (count) {
				case 1:
					expect(oldStatus).to.equal('nothing');
					expect(newStatus).to.equal('created');
				break;

				case 2:
					expect(oldStatus).to.equal('created');
					expect(newStatus).to.equal('starting');
				break;

				case 3:
					expect(oldStatus).to.equal('starting');
					expect(newStatus).to.equal('errored');
					expect(error).to.be.an.error;
					done();
				break;
			}
		}

		fork3.on('child-status-nothing', callback);
		fork3.on('child-status-created', callback);
		fork3.on('child-status-starting', callback);
		fork3.on('child-status-started', callback);
		fork3.on('child-status-errored', callback);

		fork3.fork('./child-broken.js');
	});


	it('"child-error"', function (done) {
		var count = 0,
			fork3 = _fork3();

		function callback (child, error) {
			expect(error).to.be.an.error;

			if (++count === 2) {
				done();
			}
		}

		fork3.on('child-error', callback);

		fork3.fork('./child-broken.js');
		fork3.fork('./child-missing.js');
	});
});