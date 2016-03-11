serviceApp.controller('pickBotCtrl', function($scope, xml2json, excel2json) {
  //\\dcofeedsvc01\Kapow Katalyst\Resources\Project\Library\HEC_AANP_FIND.robot
  //conversion stuff
  var botJson;
  var excludeJson;
  var fs = require('fs');
  var listOfBotsArr = [];
  var listOfBotsObj = [];

  //<<-------TODO-------->>
  //add other 2 paths
  //this is path bots
  var dcofeed = '//dcofeedsvc01/Kapow Katalyst/Resources/Project/Library/'
    //add path feeds
    //add path jobTarget

  $scope.listOfBots = 'no bots';
  $scope.verifyBotSelection = 'No file selected';
  $scope.showBotList = false;
  $scope.showUserVerifyBotSelectionMessage = false;
  $scope.clientList = [];
  //upload the file and see contents
  $scope.UploadFile = function() {
    $scope.jobIdToUpdate = [];
    $scope.duplicates = [];
    var fileName = document.getElementById('exclude-file');
    var aapa = 'AAPA';
    var aanp = 'AANP';
    var botPath = '';
    var listOfBotsToBeChanged = [];
    //TODO save off the file after it's converted
    convertInputFile(fileName.value);
    getListOfBots(dcofeed);
    //will be set to either aapa or aanp
    $scope.botName = '';
    $scope.clientList = createClientList(aapa, aanp);
    //set aapa / aanp
    if (excludeJson[1].name.indexOf(aapa) > -1) {
      $scope.botName = aapa;
      botPath = 'HEC_AAPA_FIND.robot';
    } else if (excludeJson[1].name.indexOf(aanp) > -1) {
      $scope.botName = aanp;
      botPath = 'HEC_AANP_FIND.robot';
    }
    updateUIWithAAChanges($scope.botName, botPath);
  }
  //TODO add $scope.clientList;
  $scope.verifyBotSelection = function() {
    var message = 'Would you like to update: ' ;
    listOfBotsToBeChanged = [];
    listOfBotsToBeChanged.push($scope.botName);
    for (var b = 0; b < $scope.selectedBots.length; b++) {
      var bot = $scope.selectedBots[b];

      for (var client in bot) {
        if (bot.hasOwnProperty(client)) {
          listOfBotsToBeChanged.push(bot[client].name);
        }
      }
    }
    for(var name in listOfBotsToBeChanged){
      if(listOfBotsToBeChanged[name] === listOfBotsToBeChanged[listOfBotsToBeChanged.length - 1]){

        message = message + listOfBotsToBeChanged[name] + '?';
      } else{
        message = message + listOfBotsToBeChanged[name] + ', ';
      }
    }
    $scope.userVerifyBotSelectionMessage = message;
    $scope.showUserVerifyBotSelectionMessage = true;
  }

  //shows the user which changes he would like to make.
  function updateUIWithAAChanges(botName, botPath) {

    var path = dcofeed + botPath;
    xml2json.Convert(path, function(json) {
      //manipulate data
      var excludeHecJobId = getObjects(json.object.property, '_', 'Exclude HeC Job ID');
      var list = excludeHecJobId[0][1].property[0].object;

      var jobIds = [];
      for (var i = 0; i < list.length; i++) {
        var jobId = parseInt(list[i].property[1].property[0]._);
        jobIds.push(jobId);
      }
      jobIds.sort(sortNumber);

      for (var e = 0; e < excludeJson[1].data.length; e++) {
        var jobIdToExclude = parseInt(excludeJson[1].data[e][0]);
        for (var i = 0; i < jobIds.length; i++) {
          var jobId = jobIds[i];
          //skip thisJobIdToExclude loop if record exists already
          if (jobIdToExclude === jobId) {
            $scope.duplicates.push(jobIdToExclude);
            break;
          } else if (jobIdToExclude < jobId) {
            $scope.jobIdToUpdate.push(jobIdToExclude);
            break;
          }
        }
      }
      //$scope.apply();
    });
  }
  //these are client bots selected manually
  $scope.selectedBots = [];
  $scope.getSelectedBot = function(bot) {
      //bot is a returned "this" object from html
      var thisBot = {};
      var shouldAddToList = true;
      thisBot[bot.client.name] = {
        name: bot.client.undefined.name
      };
      //if array is empty, push first record
      if ($scope.selectedBots.length === 0) {
        $scope.selectedBots.push(thisBot);
      } else {
        for (var i = 0; i < $scope.selectedBots.length; i++) {
          //replace old value, if object already exists in array
          if ($scope.selectedBots[i].hasOwnProperty(bot.client.name)) {
            shouldAddToList = false;
            $scope.selectedBots[i] = thisBot;
          }
        }
        //if object does not exist in array, add this bot to the array
        if (shouldAddToList) {
          $scope.selectedBots.push(thisBot);
        }
      }
    }
    //get list of bots from directory
  function getListOfBots(dir) {
    fs.readdir(dir, function(err, files) {
      listOfBotsArr = files;
      $scope.showBotList = true;
      //convert to object for consumption of angular options
      for (var i = 0; i < listOfBotsArr.length; i++) {
        //don't return any files that end in ~
        //they are not relevant
        if (!(listOfBotsArr[i].indexOf('.robot~') > -1) && !(listOfBotsArr[i].indexOf('.model~') > -1)) {
          listOfBotsObj.push({
            name: listOfBotsArr[i]
          });
          $scope.listOfBots = listOfBotsObj;
          $scope.$apply();
        }
      }
    });
  }
  //if there are client bots to update, this is their object
  function clientBotObj(name, jobNum, clientId, contract, refId) {
    this.name = name;
    this.jobNum = jobNum;
    this.clientId = clientId;
    this.contract = contract;
    this.refId = refId;
  }
  //searches through nested json to return parent object
  function getObjects(obj, key, val, previousObj) {
    var objects = [];
    for (var i in obj) {
      if (!obj.hasOwnProperty(i)) continue;
      if (typeof obj[i] == 'object') {
        previousObj = obj;
        objects = objects.concat(getObjects(obj[i], key, val, previousObj));
      } else if (i == key && obj[key] == val) {
        objects.push(previousObj);
        break;
      }
    }
    return objects;
  }
  //manual sort function()
  //usage arrayName.sort(functioncall);
  function sortNumber(a, b) {
    return a - b;
  }
  //creates list of client bots, if any
  function createClientList(aapa, aanp) {
    var clientListObj = [];
    //skip over column names
    if (excludeJson[0].data.length > 1) {
      for (var i = 1; i < excludeJson[0].data.length; i++) {
        var client = excludeJson[0].data[i];
        //not a real record if client.length === 0
        if (client.length !== 0) {
          if (excludeJson[1].name.indexOf(aapa) > -1) {
            clientListObj.push(new clientBotObj(client[0], client[1], client[2], client[3], client[4]));
          } else if (excludeJson[1].name.indexOf(aanp) > -1) {
            clientListObj.push(new clientBotObj(client[0], client[2], client[1], client[4], client[3]));
          }

        }
      }
    }
    return clientListObj;
  }

  function convertInputFile(fileName) {
    excludeJson = excel2json.Convert(fileName);
  }

});
