function ChildGoneAwayError (message) {
  var error = Error.call(this, message);

  this.name = 'CHILD_GONE_AWAY';
  this.message = error.message;
  this.stack = error.stack;
}

ChildGoneAwayError.prototype = Object.create(Error.prototype);
ChildGoneAwayError.prototype.constructor = ChildGoneAwayError;

module.exports = ChildGoneAwayError;