'use strict';

const
	win32 = process.platform === 'win32';

const
	path = require('path'),
	fork = require('child_process').fork,

	errio = require('errio'),
	EventEmitter = require('YAEventEmitter');

const
	onMessage = require('./ChildProcess.onMessage'),
	launcherPath = path.join(__dirname, 'launcher.js');

const
	ChildGoneAwayError = require('./errors/ChildGoneAwayError'),
	TimeoutError = require('./errors/TimeoutError');

function tryCatch (tryThis, catcher) {
	try {
		tryThis();
	} catch (e) {
		catcher(e);
	}
}

class ChildProcess extends EventEmitter {

	/**
	 * Constructor
	 *
	 * @param      {String}  name   The name of this child process
	 * @param      {Cobra}   cobra  The cobra-instance that owns this child 
	 * 
	 * @return     {Object}  this
	 */
	constructor (modulePath, args, options, childProcessCollection) {
		super();

		const self = this;

		var status = 'nothing',
			restarting = false;

		self.process = process;
		self.ackCounter = 0;
		self.awaitingAck = {};

		self.killTimeout = 10000;

		self.isParentInterface = !process.env.FORK2;
		self.isChildInterface = !self.isParentInterface;

		self.modulePath = modulePath;
		self.dirname = path.dirname(modulePath);
		self.basename = path.basename(modulePath);
		self.basedir = path.basename(self.dirname);
		self.lastError = null;

		self.args = args;
		self.options = options;

		self.options.cwd = self.options.cwd || self.dirname;

		// Define self.status
		Object.defineProperty(self, 'status', {
			enumerable: true,
			get: function () {
				return status;
			},

			set: function (newStatus) {
				var oldStatus = status,
					error = (newStatus === 'errored' ? self.lastError : null);

				status = newStatus;

				if (newStatus !== oldStatus) {
					self.emit('status-change', oldStatus, newStatus, error);
					self.emit('status-' + newStatus, oldStatus, newStatus, error);
				}
			}
		});

		Object.defineProperty(self, 'restarting', {
			enumerable: true,
			get: function () {
				return restarting;
			},

			set: function (bool) {
				bool = !!bool;

				if (restarting && !bool) {
					self.emit('restarted');
				} else if (!restarting && bool) {
					self.emit('restarting');
				}

				restarting = bool;
			}
		});

		// Bubble all events up to the childProcessCollection.
		if (childProcessCollection) {
			self.EventEmitter.propagate(childProcessCollection, 'child-');
		}

		self.on('error', function (err) {
			self.lastError = err;
		});

		self.status = 'created';
	}

	/**
	 * Starts (forks) the actual process
	 *
	 * @return     {Object}  this
	 */
	start (callback, error) {
		var self = this;

		if (error instanceof Error) {
			setTimeout(() => {
				self.lastError = error;
				self.status = 'errored';
				self.emit('error', error);

				if (callback) {
					callback.call(self, error, self);
				}
			});

			return self;
		}

		// We can only start from these states.
		// TODO: We can't just return...
		if (self.status !== 'created' && self.status !== 'stopped') {
			return self;
		}

		self.status = 'starting';

		// Reset variable properties
		self.process = process;
		self.ackCounter = 0;
		self.awaitingAck = {};
		self.restarting = false;

		if (this.isChildInterface) {
			// We'll hijack the EventEmitter's "on"-method
			// and only start listening for events from the
			// parent process when the user is actually
			// interested in them.
			// 
			// This is so that the child process can gracefully
			// exit when the event loop is empty.
			self._originalOn = self.on;

			self.on = function () {
				// Start listening for events from the parent process
				self.process.on('message', onMessage(self));

				// Reset the original 'on' method
				self.on = self._originalOn;

				// And forward this invocation.
				self.on.apply(self, arguments);
			};

			self.status = 'started';
			return self;
		}

		// Update status to 'started' when we hear
		// from the launcher module.
		self.once('FORK2_started', function () {
			self.status = 'started';
		});

		// Include the module path in the environmental
		// 'FORK2'-property so that the launcher module
		// know which module to execute.
		self.options.env.FORK2 = self.modulePath;

		// Fork!
		self.process = fork(launcherPath, self.args, self.options);

		// Start listening for events from the parent process
		self.process.on('message', onMessage(self));

		self.process.on('error', function (err) {
			console.log('error :c', err);
		});

		self.process.on('exit', (code, signal) => {
			var ackid,
				ackfn;

			// https://nodejs.org/api/process.html#process_exit_codes
			if (code && code <= 128) {
				self.status = 'errored';
			} else {
				self.status = 'stopped';
			}

			self.emit('exit', code, signal);

			// Answer any functions waiting ack.
			// TODO: If we are restarting, resend these when the process has started again?
			for (ackid in self.awaitingAck) {
				ackfn = self.awaitingAck[ackid];
				ackfn(new ChildGoneAwayError('child process exited before acknowledging this callback'));
			}
		});

		if (callback) {
			self.once('status-change', function (oldStatus, newStatus, error) {
				callback.call(self, error || null, self);
			});
		}

		return self;
	}

	/**
	 * Gracefully shuts down the process.
	 *
	 * @param      {Function}  callback  Function to execute when the process has been shut down.
	 * @return     {Object}    this
	 */
	stop (callback) {
		var self = this,
			ackTimeout;

		// Continue this invocation when the process has started.
		if (self.status !== 'started') {
			return self.once('status-started', () => self.stop.apply(self, arguments));
		}

		self.status = 'stopping';

		// Something something
		if (self.isChildInterface) {
			process.exit(0);
			return self;
		}

		self.once('exit', function (code, signal) {
			// TODO: Pass an error when SIGKILL does not work.
			callback.call(self, null);
		});

		// Politely ask the process to shut down
		self.send('shutdown', (err) => {
			clearTimeout(ackTimeout);

			// Only raise errors that's not NO_LISTENER_FOUND.
			if (err && err.name !== 'NO_LISTENER_FOUND') {
				self.emit('error', err);
			}

			// But kill the process regardless of any error.
			self.process.kill('SIGKILL');
		});

		// A timeout which will execute if 
		// the process didn't acknowledge the
		// shutwn in `self.killTimeout` ms. 
		ackTimeout = setTimeout(function () {
			// Raise error
			self.emit('error', new TimeoutError(self.modulePath + ' has exceeded the shutdown maximum execution time of ' + self.killTimeout + 'ms'));

			// And continue with the shutdown procedure.
			self.process.kill('SIGKILL');
		}, self.killTimeout);

		return self;
	}

	/**
	 * Gracefully restarts the process
	 *
	 * @param      {Function}  callback  Function to execute when the function has been restarted.
	 * @return     {Obejct}    this
	 */
	restart (callback) {
		var self = this;

		self.restarting = true;
		
		// Continue this invocation when the process has started.
		// Allow "restart" if the process is stopped (i.e. start).
		if (self.status !== 'started' && self.status !== 'stopped') {
			return self.once('status-started', () => self.restart.apply(self, arguments));
		}

		self.once('status-started', () => self.restarting = false).stop((err) => {
			if (err) {
				return callback.call(self, err);
			}

			self.start(callback);
		});

		return self;
	}

	/**
	 * Sends a message to the connected process.
	 * @return {Object} this
	 */
	send (eventName) {
		var self = this,
			args = new Array(arguments.length - 1),
			i = 0,
			packet = {};

		// Continue this invocation when the process has (re)started or
		// we are in the process of shutting the process down and the event is a part of that.
		if (self.restarting || (self.status !== 'started' && (self.status !== 'stopping' && eventName === 'shutdown'))) {
			return self.once('status-started', () => self.send.apply(self, arguments));
		}

		function send (packet) {
			//console.log('%s: outgoing %s-packet: (%s), %s with %d args', self.isChildInterface ? 'child' : 'parent', packet.type, packet.ackid, packet.name, packet.args.length);

			function handleError (err) {
				var ackfn = self.awaitingAck[packet.ackid]

				if (!err) {
					return;
				}

				if (ackfn) {
					ackfn(err, packet);
				} else if (!ackfn) {
					throw err;
				}

				self.emit('error', err, packet);
			}

			tryCatch(() => self.process.send(packet, handleError), (e) => handleError);

			return self;
		}

		// Handle response packet:
		// .send( true, eventName, args, ackid )
		if (eventName === true || eventName === false) {
			packet = {
				type: 'response',
				name: arguments[1],
				ackid: arguments[3],
				args: arguments[2]
			};

			if (packet.args[0] instanceof Error) {
				packet.contentType = 'error';
				packet.args[0] = errio.stringify(packet.args[0], {stack: true, private: true});
			}

			return send(packet);
		}

		// Copy arguments into an actual array
		for (; i < args.length; ++i) {
			args[i] = arguments[i + 1];
		}

		// Ack-less packet
		packet = {
			type: 'request',
			name: eventName,
			ackid: -1,
			args: args
		};

		// 
		if (packet.args[0] instanceof Error) {
			packet.contentType = 'error';
			packet.args[0] = errio.stringify(packet.args[0], {stack: true, private: true});
		}

		// Which we use if the user doesn't want a response
		// (last argument isn't a function)
		if (typeof args[args.length - 1] !== 'function') {
			return send(packet);
		}

		// User has supplied a response function,
		// generate a new unique ackid.
		packet.ackid = ++self.ackCounter;

		// Save the response function at the right index
		self.awaitingAck[packet.ackid] = packet.args.pop();

		// And send the packet
		return send(packet);
	}
}

module.exports = ChildProcess;