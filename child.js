var fork3 = require('./index').childInterface();

fork3.on('hello', function (respond) {
	respond('hello!!!!!');
});