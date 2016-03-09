serviceApp.factory('excel2json', function() {

  return {
    Convert: function(file) {

      var xlsx = require('node-xlsx');
      var json = xlsx.parse(file);
      return json;

    }
  }
});
