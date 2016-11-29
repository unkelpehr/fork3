var fork3 = require('./index');


fork3.on('child-status-change', function (child, oldStatus, newStatus) {
	console.log('%s went from %s -> %s', child.basename, oldStatus, newStatus);
}).on('child-restarting', function (child, oldStatus, newStatus) {
	console.log('%s is restarting', child.basename);
}).on('child-restarted', function (child, oldStatus, newStatus) {
	console.log('%s is restarted', child.basename);
});

fork3.fork('./child').restart();
return;
fork3.fork('./child', function (err) {
	var child = this;

	//child.restart();

	child.restart().send('lolwhut', function (err) {
		if (err) {
			throw err;
		}

		console.log('response!');
	});

});

/*

child.js went from nothing -> created
child.js went from created -> starting
child.js went from starting -> started
child.js is restarting
child.js went from started -> stopping
child.js went from stopping -> stopped
child.js went from stopped -> starting
child.js is restarted
child.js went from starting -> started


child.js went from nothing -> created
child.js went from created -> starting
child.js went from starting -> started
child.js is restarting
child.js went from started -> stopping
child.js went from stopping -> stopped
child.js went from stopped -> starting
child.js is restarted
child.js went from starting -> started

*/