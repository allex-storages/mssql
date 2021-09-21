var mssql = require('mssql');

function main (execlib){
  'use strict';
  return execlib.loadDependencies('client', ['allex_dataservice'], createMSSQLStorage.bind(null, execlib));
}

function createMSSQLStorage (execlib) {
  'use strict';

  var lib = execlib.lib,
    q = lib.q,
    dataSuite = execlib.dataSuite,
    StorageBase = dataSuite.StorageBase,
    sqlsentencinglib = require('./sqlsentencing')(execlib),
    sqlfilteringlib = require('./sqlfiltering')(execlib, sqlsentencinglib),
    joblib = require('./jobs')(execlib, sqlsentencinglib);

  function MSSQLStorage(storagedescriptor){
    if (!storagedescriptor){
      throw new lib.Error('NO_STORAGEDESCRIPTOR', 'MongoStorage needs a storagedescriptor in constructor');
    }
    if (!storagedescriptor.database) {
      throw new lib.Error('NO_DATABASE_IN_STORAGEDESCRIPTOR', 'MongoStorage needs a storagedescriptor.database name in constructor');
    }
    if (!storagedescriptor.table) {
      throw new lib.Error('NO_TABLE_IN_STORAGEDESCRIPTOR', 'MongoStorage needs a storagedescriptor.table name in constructor');
    }
    StorageBase.call(this, storagedescriptor);
    this.client = null;
    this.dbname = storagedescriptor.database;
    this.tablename = storagedescriptor.table;
    this.indexes = null;
    this.q = new lib.Fifo();
    this.sentencer = new sqlsentencinglib.SqlSentencer();
    this.connect(storagedescriptor);
  }
  lib.inherit(MSSQLStorage, StorageBase);
  MSSQLStorage.prototype.destroy = function () {
    if (this.sentencer){
      this.sentencer.destroy();
    }
    this.sentencer = null;
    if (this.q){
      this.q.destroy();
    }
    this.q = null;
    if (this.indexes) {
      this.indexes.destroy();
    }
    this.indexes = null;
    this.tablename = null;
    this.dbname = null;
    if (this.client) {
      this.client.close();
    }
    StorageBase.prototype.destroy.call(this);
  };

  MSSQLStorage.prototype.doRead = function (query, defer) {
    this.handleQueue('realDoRead', [query, defer]);
  };
  MSSQLStorage.prototype.doCreate = function (datahash, defer) {
    this.handleQueue('realDoCreate', [datahash, defer]);
  };
  MSSQLStorage.prototype.doDelete = function (filter, defer) {
    this.handleQueue('realDoDelete', [filter, defer]);
  };
  MSSQLStorage.prototype.doUpdate = function (filter, updateobj, options, defer) {
    this.handleQueue('realDoUpdate', [filter, updateobj, options, defer]);
  };

  require('./connectionhandling')(execlib, mssql, MSSQLStorage, joblib);
  require('./queuehandling')(execlib, mssql, MSSQLStorage);
  require('./keyhandling')(execlib, mssql, MSSQLStorage, sqlsentencinglib, sqlfilteringlib, joblib);
  require('./realdboperations')(execlib, mssql, MSSQLStorage, sqlsentencinglib, sqlfilteringlib);

  return MSSQLStorage;
}

module.exports = main;