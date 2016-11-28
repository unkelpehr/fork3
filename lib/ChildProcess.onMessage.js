'use strict';

const
	errio = require('errio');

const
	NoListenerFoundError = require('./errors/NoListenerFoundError'),
	UnknownAckidError = require('./errors/UnknownAckidError');

var self;

function tryCatch (tryThis, catcher) {
	try {
		tryThis();
	} catch (e) {
		catcher(e);
	}
}

function handleRequest (self, packet) {
	var args;

	function respond () {
		var i = 0,
			args = new Array(arguments.length);
		
		for ( ; i < args.length; ++i) {
			args[i] = arguments[i];
		}

		self.send(true, packet.name, args, packet.ackid);
	}

	// If we don't have listeners on this event,
	// answer with a new NoListenersFoundError.
	if (!self.hasListeners(packet.name)) {
		if (packet.name.slice(0, 6) !== 'FORK2_') {
			self.send(true, 'error', [new NoListenerFoundError('no handlers are listening to the \'' + packet.name + '\' event')], packet.ackid);
		}

		return;
	}

	args = packet.args;
	args.unshift(packet.name);

	// If the parent process is expecting a response,
	// push a function onto the arguments which the handlers
	// can execute when they are done.
	if (packet.ackid !== -1) {
		args.push(respond);
	}

	if (packet.contentType === 'error') {
		args[0] = errio.parse(args[0]);
	}

	tryCatch(function () {
		self.emit.apply(self, args);
	}, function (e) {
		respond(e);
	});
}

function handleResponse (self, packet) {
	var ackid = packet.ackid,
		ackfn = self.awaitingAck[ackid],
		name = packet.name;

	if (!ackid || !ackfn) {
		if (ackid === -1) {
			self.emit.apply(self, [packet.name].concat(packet.args));
			return;
		}

		return self.emit('error', new UnknownAckidError('unknown ackid ' + ackid + '. has this message already been answered?'), packet);
	}

	if (packet.contentType === 'error') {
		packet.args[0] = errio.parse(packet.args[0]);
	} else {
		packet.args.unshift(null);
	}

	// Execute the waiting function
	ackfn.apply(null, packet.args);

	// And delete it
	delete self.awaitingAck[ackid];
}

function handleError (self, packet) {
	packet.args[0] = errio.parse(packet.args[0]);

	packet.args.unshift('error');
	packet.args.push(packet);

	return self.emit.apply(self, packet.args);
}

module.exports = function (self) {
	return function onMessage (packet) {
		// Not a fork2 packet
		if (typeof packet !== 'object' || !packet.type || !packet.name) {
			return;
		}

		//console.log('%s: incoming %s-packet: (%s), %s with %d args', self.isChildInterface ? 'child' : 'parent', packet.type, packet.ackid, packet.name, packet.args.length);

		if (packet.type === 'request') {
			handleRequest(self, packet);
		} else if (packet.type === 'response') {
			handleResponse(self, packet);
		}  else if (packet.type === 'error') {
			handleError(self, packet);
		} else {
			throw new Error('unknown type');
		}
	}
};