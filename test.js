var fork3 = require('./index');

fork3.on('child-status-change', function (child, oldStatus, newStatus) {
	console.log('%s went from %s -> %s', child.basename, oldStatus, newStatus);
});

fork3.fork('./child').send('hello', function (err) {
	console.log('response! error:\n', err);
}).on('error', function (err) {
	console.loog('errroorr!', err);
});