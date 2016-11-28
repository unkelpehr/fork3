function UnknownAckid (message) {
  var error = Error.call(this, message);

  this.name = 'UNKNOWN_ACKID';
  this.message = error.message;
  this.stack = error.stack;
}

UnknownAckid.prototype = Object.create(Error.prototype);
UnknownAckid.prototype.constructor = UnknownAckid;

module.exports = UnknownAckid;