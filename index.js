function main (execlib){
  'use strict';
  return execlib.loadDependencies('client', ['allex:storageregistry:lib', 'allex:basesql:storage', 'allex:mssqlexecutor:lib'], createMSSQLStorage.bind(null, execlib));
}

function createMSSQLStorage (execlib, storagereglibignored, BaseSQLStorage, mslib) {
  'use strict';

  function MSSQLStorage(storagedescriptor){
    BaseSQLStorage.call(this, storagedescriptor);
  }
  BaseSQLStorage.inherit(MSSQLStorage, mslib);
  MSSQLStorage.prototype.expectedPrimaryKeyViolation = 'Violation of PRIMARY KEY';
  
  return MSSQLStorage;
}

module.exports = main;