before(function() {
	Object.keys(require.cache).forEach(function(key) {
			delete require.cache[key];
	});
});
beforeEach(function() {
	Object.keys(require.cache).forEach(function(key) {
			delete require.cache[key];
	});
});

after(function() {
	Object.keys(require.cache).forEach(function(key) {
			delete require.cache[key];
	});
});
afterEach(function() {
	Object.keys(require.cache).forEach(function(key) {
			delete require.cache[key];
	});
});