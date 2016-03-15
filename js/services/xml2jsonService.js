serviceApp.factory('xml2json', function() {

  return {
    ConvertToJson: function(path, callback) {
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
    ConvertToXml: function(objectToConvert) {
      var js2xml = require('js2xmlparser');
      return js2xml('blah', objectToConvert);

    }
  }
});
