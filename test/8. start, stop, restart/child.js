var fork3 = require('../../index.js').childInterface();

fork3.on('shutdown', function (respond) {
	setTimeout(() => respond(), 1000);
});