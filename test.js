var fork3 = require('./index');

fork3.on('child-status-change', function (child, oldStatus, newStatus) {
	console.log('%s went from %s -> %s', child.modulePath, oldStatus, newStatus);
});

// Works:
//fork3.fork('./child.js').restart(function (err) {
//	console.log('restarted!');
//});

// Don't work:
fork3.fork('./child.js', function (err) {
	var child = this;

	console.log('1 started');

	child.restart(function (err) {
		console.log('restarted!');
	});
});