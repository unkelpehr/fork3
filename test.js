var fork3 = require('./index');

fork3.on('child-status-change', function (child, oldStatus, newStatus) {
	console.log('%s went from %s -> %s', child.modulePath, oldStatus, newStatus);
});

fork3.fork('./child.js').restart(function (err) {
	console.log('restarted!');
});