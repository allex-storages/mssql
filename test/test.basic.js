var mssql = require('mssql');
var script = "IF EXISTS (SELECT 1 "+
  "FROM INFORMATION_SCHEMA.TABLES "+
  "WHERE TABLE_TYPE='BASE TABLE' "+
  "AND TABLE_NAME='users') "+
  "DROP TABLE users;"+
  "CREATE TABLE users ("+
  "[name] varchar(50) NOT NULL,"+
  "[gender] varchar(50) NOT NULL,"+
  "[age] int NOT NULL);"

var prophash = require('./prophash');

describe('Test Integration', function () {
  loadMochaIntegration('allex_datalib');
  it ('Load mssql storage', function () {
    return setGlobal('MSSQLStorageClass', require('..')(execlib));
  });
  it ('Create the "users" table first', function () {
    return qlib.promise2console(mssql.connect(prophash).then(
      function (pool) {
        return pool.query(script).then(
          function (res) {
            pool.close();
            return res;
          },
          function (reason) {
            pool.close();
            throw reason;
          }
        );
      }
    ), 'init');
  });
  for (var i=0; i<1; i++) {
    BasicStorageTest(
      function () { return MSSQLStorageClass; },
      function () { return prophash; }
    );
  }
});
