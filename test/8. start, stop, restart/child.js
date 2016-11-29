var fork2 = require('../../index.js').childInterface();

fork2.on('restart', function (shouldRespond, respond) {
	if (shouldRespond) {
		respond();
	}
});