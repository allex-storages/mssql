function createRealDbOperations(execlib, mssql, MSSQLStorage, sqlsentencinglib, sqlfilteringlib) {
  'use strict';

  var lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib;

  MSSQLStorage.prototype.realDoRead = function (query, defer) {
    var f = query.filter(), d = f.descriptor();
    var sqlf = sqlfilteringlib.Factory(d);
    var sqlquery = 'SELECT * FROM '+
      sqlsentencinglib.entityNameOf(this.tablename)+
      ' '+
      sqlf.getQueryConditional('WHERE');
    var querystate = {
      done: 0,
      limit: query.limit(),
      sql: sqlquery,
      defer: defer
    };
    var req = this.client.request();
    req.stream = true;
    req.query(sqlquery);
    req.on('row', onSqlRow.bind(null, querystate));
    req.on('done', onReadEnd.bind(null, querystate));
    req.on('error', defer.reject.bind(defer));
    querystate = null;
  };

  function onSqlRow (querystate, row) {
    querystate.done ++;
    if (lib.isNumber(querystate.limit) && 
      querystate.done > querystate.limit) {
        querystate.defer.resolve(querystate.limit);
        return;
    }
    querystate.defer.notify(row);
  }

  function onReadEnd (querystate) {
    querystate.defer.resolve(querystate.done);
  }

  MSSQLStorage.prototype.realDoCreate = function (datahash, defer) {
    var query = this.sentencer.insertFromDataRecord(this.tablename, this.__record, datahash);
    qlib.promise2defer(this.client
      .request()
      .query(query)
      .then(onSqlCreate.bind(null, datahash), onSqlCreateFail.bind(null, query))
      ,
      defer);
    datahash = null;
    query = null;
  };
  function onSqlCreate (datahash, res) {
    return datahash;
  }
  function onSqlCreateFail (query, reason) {
    throw reason;
  }
  MSSQLStorage.prototype.realDoDelete = function (filter, defer) {
    var d = filter.descriptor();
    var sqlf = sqlfilteringlib.Factory(d);
    var query = 'DELETE FROM '+
      sqlsentencinglib.entityNameOf(this.tablename)+
      ' '+
      sqlf.getQueryConditional('WHERE');
    qlib.promise2defer(
      this.client
      .request()
      .query(query).then(onSqlDelete)
      ,
      defer);
    query = null;
  };

  function onSqlDelete (res) {
    return res;
  }


  MSSQLStorage.prototype.realDoUpdate = function (filter, updateobj, options, defer) {
    var d = filter.descriptor();
    var sqlf = sqlfilteringlib.Factory(d);
    var query = 'UPDATE '+
      sqlsentencinglib.entityNameOf(this.tablename)+
      ' '+
      this.sentencer.setClauseFromObject(updateobj)+
      ' '+
      sqlf.getQueryConditional('WHERE');
      qlib.promise2defer(
      this.client
      .request()
      .query(query).then(onSqlUpdate, onSqlUpdateFail)
      ,
      defer);
  };

  function onSqlUpdate (res) {
    return res;
  }
  function onSqlUpdateFail (reason) {
    throw reason;
  }
}

module.exports = createRealDbOperations;