serviceApp.factory('CreateRequest', function() {
  return {
    //opens new window to fill out service request form
    ServiceNowRequest: function(numberOfResults, message) {
      var gui = require('nw.gui');
      var win = gui.Window.open('http://www.google.com');

      win.on('loaded', function() {
        var document = win.window.document;
        document.getElementById('lst-ib').value = numberOfResults;
      });
    }
  };
});
