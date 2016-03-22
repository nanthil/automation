serviceApp.controller('HomeCtrl', function($scope) {
  $scope.TaskList = [{
    task: 'Missing PPQA Codes',
    url: '/ppqa'
  }, {
    task: 'Send Arta E-mail',
    url: '/email'
  }, {
    task: 'Exclude Jobs By ID',
    url: '/pickBot'
  }];
});
