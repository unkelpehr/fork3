var fork2 = require('../../index.js').childInterface();

fork2.on('toUpperCase', function (text, respond) {
	respond(text.toUpperCase());
});

fork2.on('handledError', function (respond) {
	respond(new TypeError('handled TypeError'));
});

fork2.on('unhandledError', function (respond) {
	throw new TypeError('unhandled TypeError');
});

fork2.on('noRespond', function () {

});

fork2.on('returnedRespond', function () {
	return 'i want to sleep';
});

fork2.on('respondMultiple', (respond) => respond('uno'))
	.on('respondMultiple', (respond) => respond('dos'))
	.on('respondMultiple', (respond) => respond('tres'));