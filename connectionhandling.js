function createConnectionHandling(execlib, mssql, MSSQLStorage, joblib) {
  'use strict';

  var lib = execlib.lib,
  q = lib.q;

  MSSQLStorage.prototype.connect = function (storagedescriptor) {
    var _sd = storagedescriptor;
    mssql.connect(storagedescriptor).then(
      this.onConnected.bind(this, _sd),
      this.onConnectionFailed.bind(this, _sd)
    );
    _sd = null;
  };
  MSSQLStorage.prototype.onConnected = function (storagedescriptor, pool) {
    var _sd = storagedescriptor;
    this.client = pool;
    var ret = (new joblib.IndexLister(this.client, this.tablename)).go().then(
      this.onIndexes.bind(this, _sd)
    );
    _sd = null;
    return ret;
  };
  MSSQLStorage.prototype.onIndexes = function (storagedescriptor, indexes) {
    this.indexes = indexes;
    if (storagedescriptor.record) {
      this.checkPrimaryKeyDescriptor(storagedescriptor.record.primaryKey);
    }
  };
  MSSQLStorage.prototype.onConnectionFailed = function (storagedescriptor, reason) {
    var _sd = storagedescriptor;
    console.log('Could not connect to MSSQL', storagedescriptor);
    console.log(reason);
    console.log('Will try again');
    lib.runNext(this.connect.bind(this, _sd), 1000);
    _sd = null;
  };
}

module.exports = createConnectionHandling;