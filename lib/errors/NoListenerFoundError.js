function NoListenerFoundError (message) {
  var error = Error.call(this, message);

  this.name = 'NO_LISTENER_FOUND';
  this.message = error.message;
  this.stack = error.stack;
}

NoListenerFoundError.prototype = Object.create(Error.prototype);
NoListenerFoundError.prototype.constructor = NoListenerFoundError;

module.exports = NoListenerFoundError;