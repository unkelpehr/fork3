const
	modulePath = process.env.FORK2,
	errio = require('errio');

if (!modulePath) {
	throw new Error('this is not a fork2 child process!');
}

function onUncaughtException (err) {
	var error = errio.stringify(err, {
		stack: true,
		private: true
	});

	process.send({
		type: 'error',
		name: err.name,
		ackid: -1,
		args: [error]
	}, function () {
		process.exit(1);
	});
}

try {
	require(modulePath);
} catch (e) {
	return onUncaughtException(e);
}

process.send({
	type: 'request',
	name: 'FORK2_started',
	ackid: -1,
	args: []
});

// process.emit('SIGTERM'); <= reemit SIGTERM for windows comp?