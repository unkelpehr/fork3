var fork2 = require('../../index.js').childInterface();

fork2.on('shutdown', function (respond) {
	setTimeout(() => respond(), 1000);
});