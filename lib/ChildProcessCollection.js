'use strict';

const
	fs = require('fs'),
	_path = require('path'),
	EventEmitter = require('YAEventEmitter');

const
	ChildProcess = require('./ChildProcess');

var
	anonymousCounter = 0;

function tryCatch (tryThis, catcher) {
	try {
		tryThis();
	} catch (e) {
		catcher(e);
	}
}

class ChildProcessCollection extends EventEmitter {
	constructor () {
		super();

		const self = this;

		self.args = [];
		self.options = {};

		self.isParentInterface = !process.env.FORK2;
		self.isChildInterface = !self.isParentInterface;

		self.workingDir = _path.dirname(module.parent.parent.filename);
		self.collection = {};

		// Default restart strategy is to 
		self.restartStrategy = function (attempts) {
			return attempts > 5 ? 0 : attempts * 1000;
		};
	}

	each (func) {
		var name;

		for (name in this.collection) {
			func(this.collection[name]);
		}

		return this;
	}

	resolve (modulePath) {
		return require.resolve(_path.resolve(this.workingDir, modulePath));
	}

	fork (modulePath) {
		var self = this,
			args,
			options,
			callback,
			absolutePath = '',
			child,
			i = 1,
			error;

		// Get 'args'
		if (Array.isArray(arguments[1])) {
			args = arguments[1];
		} else if (typeof arguments[1] === 'object') {
			options = arguments[1];
		}

		// Get 'options'
		if (typeof arguments[2] === 'object') {
			options = arguments[2];
		} 

		// Get 'callback'
		if (typeof arguments[arguments.length - 1] === 'function') {
			callback = arguments[arguments.length - 1];
		}

		// Defaults
		args = args || self.args;
		options = options || self.options;
		options.env = options.env || JSON.parse(JSON.stringify(process.env));

		// Typechecking
		if (!modulePath || typeof modulePath !== 'string' || !Array.isArray(args) || typeof options !== 'object') {
			throw new TypeError('fork2.fork( <`modulePath` = String>[, <`args` = Array>, <`options` = Object>, <`callback` = Function>] )');
		}

		// Try to resolve the absolute path to the module
		tryCatch(() => absolutePath = self.resolve(modulePath), (e) => error = e);

		// Create the child process regardless of whether absolute path could be resolved or not.
		// So that the chaining doesn't break and that the correct events gets be emitted.
		child = new ChildProcess(absolutePath, args, options, self);

		// We'll pass the possible error to the child and let it handle the error.
		child.start(callback, error);

		// But we don't store errored children.
		if (!error) {		
			// If the module is already forked
			if (self.collection[absolutePath]) {
				// Find a free key
				while (self.collection[absolutePath + '-' + (++i)]);

				// And assign the clone to that key.
				self.collection[absolutePath + '-' + i] = child;
			} else {
				// Or we'll just add it with it's absolute path.
				self.collection[absolutePath] = child;
			}
		}

		return child;
	}

	remove (identifier) {
		var isString = typeof identifier === 'string',
			isChild = identifier instanceof ChildProcess;

		if (!isString && !isChild) {
			throw new TypeError('fork2.remove( <`identifier` = String|Fork2ChildProcess> )');
		}

		this.each((child) => {
			if (!isString || child.modulePath !== identifier) {
				return;
			} else if (!isChild || child !== identifier) {
				return;
			}

			child.stopPropagation();
			delete this.collection[child.modulePath];
		});

		return this;
	}

	childInterface () {
		var self = this,
			modulePath = process.env.FORK2;

		return (new ChildProcess(modulePath, self.args, self.options)).start();
	}
}

ChildProcessCollection.ChildProcess = ChildProcess;

module.exports = ChildProcessCollection;