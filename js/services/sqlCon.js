serviceApp.factory('SqlConFactory', function() {
  var returnData = '';
  return {
    //Runs query on PCOSQL10
    CallSql: function(queryString, connectionString) {
      //create sql object
      // var sql = require('mssql');
      //
      // sql.connect(connectionString).then(function() {
      //   new sql.Request().query(queryString).then(function(recordset) {
      //     //recordset is the return from db
      //     returnData = recordset;
      //   }).catch(function(err) {
      //     console.log(err);
      //   });
      // });
      // return returnData;

      return 5;
    }

  };
});
