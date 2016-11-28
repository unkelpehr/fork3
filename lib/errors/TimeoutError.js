function TimeoutError (message) {
  var error = Error.call(this, message);

  this.name = 'OPERATION_TIMED_OUT';
  this.message = error.message;
  this.stack = error.stack;
}

TimeoutError.prototype = Object.create(Error.prototype);
TimeoutError.prototype.constructor = TimeoutError;

module.exports = TimeoutError;