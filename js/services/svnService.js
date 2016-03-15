serviceApp.factory('svn', function() {

  return {
    Commit: function(path /*other data to include*/) {
      var Client = require('svn-spawn');
      //config
      var client = new Client({
        cwd: 'path to svn pwd',
        username: 'username',
        password: 'pwd',
        noAuthCache
      });
      client.add(path, function(err, data){
        client.commit(['commit message', path], function(err, data){
          // if(err){
          //   break;
          // } else{ // do stuff }
          console.log('do stuff');
        });
      });
    }
  }
});
