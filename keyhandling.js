function createKeyHandlingOperations (execlib, mssql, MSSQLStorage, sqlsentencinglib, sqlfilteringlib, joblib) {
  var lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib;

    MSSQLStorage.prototype.checkPrimaryKeyDescriptor = function (pkdesc) {
      if (!pkdesc) {
        return this.removePrimaryKey();
      }
      if (!lib.isArray(pkdesc)) {
        pkdesc = [pkdesc];
      }
      if (!this.indexes.primary) {
        var pkd = new joblib.IndexDescriptor(lib.uid());
        pkd.columns = pkdesc.slice();
        return this.indexes.add(this.client, pkd, true);
      }
      if (this.indexes.primary.matchesColumns(pkdesc)) {
        return q(true);
      }
    };
    MSSQLStorage.prototype.removePrimaryKey = function () {
      if (!this.indexes.primary) {
        return q(true);
      }
      return this.indexes.drop(this.client, this.indexes.primary.name);
    };
}
module.exports = createKeyHandlingOperations;