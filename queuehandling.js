function createQueueHandling(execlib, mssql, MSSQLStorage) {
  'use strict';

  var lib = execlib.lib,
  q = lib.q;

  function findPromiseInLastArg (args) {
    if (!(lib.isArray(args) && args.length>0)) {
      throw new lib.Error('INTERNAL_DEFER_HANDLING_ERROR', 'args have to be an array');
    }
    var defer = args[args.length-1];
    while (defer.defer) {
      defer = defer.defer;
    }
    return defer.promise;
  }
  MSSQLStorage.prototype.handleQueue = function (methodname, args) {
    var promise = findPromiseInLastArg(args);
    if (!promise) {
      throw new lib.Error('INTERNAL_PROMISE_HANDLING_ERROR', 'Promise should have been found in the deferrable');
    }
    if (!this.q) return;
    if (this.q.length>0) {
      this.q.push([methodname, args, promise]);
      return;
    }
    this.execFromQueue(methodname, args, promise);
  };

  MSSQLStorage.prototype.execFromQueue = function (methodname, args, promise) {
    if (!lib.isFunction(this[methodname])){
      var a = 5;
    }
    this[methodname].apply(this, args);
    if (!promise.then){
      var a = 5;
    }
    promise.then(this.checkQueue.bind(this));
  };

  MSSQLStorage.prototype.checkQueue = function () {
    if (this.q && this.q.length) {
      var qe = this.q.pop();
      this.execFromQueue(qe[0], qe[1], qe[2]);
    }
  };
}

module.exports = createQueueHandling;