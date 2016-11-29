var fork3 = require('./index').childInterface();

fork3.on('lolwhut', function (respond) {
	respond('hello!');
});