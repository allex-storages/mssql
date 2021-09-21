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

var prophash = {
  "server": "ANDRODESK",
  "database": "test_datalib",
  "user": "sa",
  "password": "Kremplazma.123",
  "table": "users",
  "options" : {
    "trustServerCertificate": true
  }
};

describe('Test Integration', function () {
  loadMochaIntegration('allex_datalib');
  it ('Load mssql storage', function () {
    return setGlobal('MSSQLStorageClass', require('..')(execlib));
  });
  it ('Run the init script', function () {
    return qlib.promise2console(mssql.connect(prophash).then(
      function () {
        return mssql.query(script).then(
          function (res) {
            return res;
          }
        );
      }
    ), 'init');
  });
  BasicStorageTest(
		function () { return MSSQLStorageClass; },
    function () { return prophash;
	});
});
