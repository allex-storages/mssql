var mssql = require('mssql');

function main (execlib){
  'use strict';
  return execlib.loadDependencies('client', ['allex_datalib', 'allex_resourcehandlinglib'], createMSSQLStorage.bind(null, execlib));
}

function createMSSQLStorage (execlib, datalib, reshandlinglib) {
  'use strict';

  var lib = execlib.lib,
    qlib = lib.qlib,
    StorageBase = datalib.StorageBase,
    ResMixin = reshandlinglib.mixins.ResourceHandler,
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
    ResMixin.call(this, storagedescriptor);
    this.client = null;
    this.dbname = storagedescriptor.database;
    this.tablename = storagedescriptor.table;
    this.indexes = null;
    this.q = new lib.Fifo();
    this.sentencer = new sqlsentencinglib.SqlSentencer();
    //this.connect(storagedescriptor); //get this out
  }
  lib.inherit(MSSQLStorage, StorageBase);
  ResMixin.addMethods(MSSQLStorage);
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
    ResMixin.prototype.destroy.call(this);
    StorageBase.prototype.destroy.call(this);
  };

  MSSQLStorage.prototype.doRead = function (query, defer) {
    qlib.promise2defer(this.resourceHandlingJob('realDoRead', [query]).go(), defer);
  };
  MSSQLStorage.prototype.doCreate = function (datahash, defer) {
    qlib.promise2defer(this.resourceHandlingJob('realDoCreate', [datahash]).go(), defer);
  };
  MSSQLStorage.prototype.doDelete = function (filter, defer) {
    qlib.promise2defer(this.resourceHandlingJob('realDoDelete', [filter]).go(), defer);
  };
  MSSQLStorage.prototype.doUpdate = function (filter, updateobj, options, defer) {
    //qlib.promise2defer(this.resourceHandlingJob('realDoUpdate', [filter, updateobj, options]).go(), defer);
    this.resourceHandlingJob('realDoUpdate', [filter, updateobj, options]).go().then(updater.bind(null, updateobj, defer));
    updateobj = null;
    defer = null;
  };

  function updater (updateobj, defer, res) {
    var updatedrowcount = res && lib.isArray(res.rowsAffected) && res.rowsAffected.length>0 ? res.rowsAffected[0] : 0;
    defer.notify([updateobj, updatedrowcount]);
    defer.resolve(updatedrowcount);
  }

  require('./connectionhandling')(execlib, mssql, MSSQLStorage, joblib);
  require('./keyhandling')(execlib, mssql, MSSQLStorage, sqlsentencinglib, sqlfilteringlib, joblib);
  require('./realdboperations')(execlib, mssql, MSSQLStorage, sqlsentencinglib, sqlfilteringlib);

  return MSSQLStorage;
}

module.exports = main;