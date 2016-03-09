serviceApp.factory('xml2json', function() {

  return {
    Convert: function(path, callback) {
      var fs = require('fs');
      var xml2js = require('xml2js');
      var parser = new xml2js.Parser();
      var json;

      //read the convert file to json
      fs.readFile(path, function(err, data) {
        parser.parseString(data, function(err, result) {
          //return only the specific results we wish for
          json = result;
          console.log(result);
          callback(json);
        });
      });
    },
    //function for getting only unique records
    Unique: function(array) {
      var a = array.concat();
      for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
          if (a[i] === a[j])
            a.splice(j--, 1);
        }
      }

      return a;
    }
  }
});
