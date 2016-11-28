'use strict';

var expect = require('chai').expect;

function _fork2 () {
	Object.keys(require.cache).forEach((path) => path.indexOf('fork2') > -1 && delete require.cache[path]);
	return require('../../index.js');
}

describe('events', function () {

	it('(WORKING CHILD) "child-status-change" goes from nothing -> created -> starting -> started', function (done) {
		var count = 0,
			fork2 = _fork2();

		fork2.on('child-status-change', function (child, oldStatus, newStatus, error) {
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

		fork2.fork('./child.js');
	});

	it('(WORKING CHILD) child-status-nothing -> child-status-created -> child-status-starting -> child-status-started', function (done) {
		var count = 0,
			fork2 = _fork2();

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

		fork2.on('child-status-nothing', callback);
		fork2.on('child-status-created', callback);
		fork2.on('child-status-starting', callback);
		fork2.on('child-status-started', callback);
		fork2.on('child-status-errored', callback);

		fork2.fork('./child.js');
	});


	it('(BROKEN CHILD) "child-status-change" goes from nothing -> created -> starting -> errored', function (done) {
		var count = 0,
			fork2 = _fork2();

		fork2.on('child-status-change', function (child, oldStatus, newStatus, error) {
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

		fork2.fork('./child-broken.js');
	});

	it('(BROKEN CHILD) child-status-nothing -> child-status-created -> child-status-starting -> child-status-errored', function (done) {
		var count = 0,
			fork2 = _fork2();

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

		fork2.on('child-status-nothing', callback);
		fork2.on('child-status-created', callback);
		fork2.on('child-status-starting', callback);
		fork2.on('child-status-started', callback);
		fork2.on('child-status-errored', callback);

		fork2.fork('./child-broken.js');
	});


	it('"child-error"', function (done) {
		var count = 0,
			fork2 = _fork2();

		function callback (child, error) {
			expect(error).to.be.an.error;

			if (++count === 2) {
				done();
			}
		}

		fork2.on('child-error', callback);

		fork2.fork('./child-broken.js');
		fork2.fork('./child-missing.js');
	});
});