var fork3 = require('./index').childInterface();


fork3.on('shutdown', function (respond) {
	console.log('they wanna shut me down....');

	setTimeout(() => respond(), 1000);
});