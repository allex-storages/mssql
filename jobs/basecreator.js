function createBaseJob (lib, mylib) {
  'use strict';
  var q = lib.q,
    qlib = lib.qlib,
    JobOnDestroyableBase = qlib.JobOnDestroyableBase;

  function BaseMSSQLStorageJob (pool, defer) {
    JobOnDestroyableBase.call(this, pool, defer);
  }
  lib.inherit(BaseMSSQLStorageJob, JobOnDestroyableBase);
  BaseMSSQLStorageJob.prototype.destroy = function () {
    JobOnDestroyableBase.prototype.destroy.call(this);
  };
  BaseMSSQLStorageJob.prototype._destroyableOk = function () {
    if (!this.destroyable.connected) {
      throw new lib.Error('NSSQL_NOT_CONNECTED', 'Not connected to MSSQL');
    }
    return true;
  };
  BaseMSSQLStorageJob.prototype.go = function () {
    var ok = this.okToGo();
    if (!ok.ok) {
      return ok.val;
    }
    this.goForSure();
    return ok.val;
  }

  mylib.Base = BaseMSSQLStorageJob;
}
module.exports = createBaseJob;