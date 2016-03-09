var serviceApp = angular.module('serviceApp', ['ngRoute', 'file-model'])
.config(function($routeProvider){
  $routeProvider.when('/', {
    templateUrl: './js/Home/home.html',
    controller: 'HomeCtrl'
  }).when('/ppqa', {
    templateUrl: './js/ppqa/ppqa.html',
    controller: 'PPQACtrl'
  }).when('/pickBot', {
    templateUrl: './js/Bots/PickBot/pickbot.html',
    controller: 'pickBotCtrl'
  });
});
