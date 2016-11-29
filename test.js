var fork3 = require('./index');

fork3.on('child-status-change', function (child, oldStatus, newStatus) {
	console.log('%s went from %s -> %s', child.basename, oldStatus, newStatus);
}).on('child-restarting', function (child, oldStatus, newStatus) {
	console.log('%s is restarting', child.basename);
}).on('child-restarted', function (child, oldStatus, newStatus) {
	console.log('%s is restarted', child.basename);
});

fork3.fork('./child').restart().restart().restart(function (err) {
	console.log('restarted!');
}).send('hello', function (err) {
	console.log('response!');
});
