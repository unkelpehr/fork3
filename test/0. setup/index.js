afterEach(function() {
	Object.keys(require.cache).forEach(function(key) {
		delete require.cache[key];
	});
});