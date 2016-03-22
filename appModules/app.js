var serviceApp = angular.module('serviceApp', ['ngRoute', 'file-model'])
.config(function($routeProvider){
  $routeProvider.when('/', {
    templateUrl: './appModules/Home/home.html',
    controller: 'HomeCtrl'
  }).when('/ppqa', {
    templateUrl: './appModules/ppqa/ppqa.html',
    controller: 'PPQACtrl'
  }).when('/pickBot', {
    templateUrl: './appModules/Bots/pickbot.html',
    controller: 'pickBotCtrl'
  });
});
