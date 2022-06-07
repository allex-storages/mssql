function createRealDbOperations(execlib, mssql, MSSQLStorage, sqlsentencinglib, sqlfilteringlib) {
  'use strict';

  var lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib;

  MSSQLStorage.prototype.realDoRead = function (connection, query) {
    var f = query.filter(), d = f.descriptor(), defer = q.defer(), ret = defer.promise;
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
    var req = connection.request();
    req.stream = true;
    req.query(sqlquery);
    req.on('row', onSqlRow.bind(null, querystate));
    req.on('done', onReadEnd.bind(null, querystate));
    req.on('error', defer.reject.bind(defer));
    /*
    req.on('error', function (reason) {
      console.error('SQL Storage error', reason);
      defer.reject(reason);
    });
    */
    querystate = null;
    return ret;
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

  MSSQLStorage.prototype.realDoCreate = function (connection, datahash) {    
    var query;
    query = this.sentencer.insertFromDataRecord(this.tablename, this.__record, datahash);
    return connection
      .request()
      .query(query);
  };

  MSSQLStorage.prototype.realDoDelete = function (connection, filter) {
    var d, sqlf, query, ret;
    d = filter.descriptor();
    sqlf = sqlfilteringlib.Factory(d);
    query = 'DELETE FROM '+
      sqlsentencinglib.entityNameOf(this.tablename)+
      ' '+
      sqlf.getQueryConditional('WHERE');
    return connection
      .request()
      .query(query);
  };

  MSSQLStorage.prototype.realDoUpdate = function (connection, filter, updateobj, options) {
    var d = filter.descriptor();
    var sqlf = sqlfilteringlib.Factory(d);
    var query = 'UPDATE '+
      sqlsentencinglib.entityNameOf(this.tablename)+
      ' '+
      this.sentencer.setClauseFromObject(updateobj)+
      ' '+
      sqlf.getQueryConditional('WHERE');
    return connection
      .request()
      .query(query);
  };
}

module.exports = createRealDbOperations;
