serviceApp.controller('pickBotCtrl', function($scope, xml2json, excel2json, svn, searchJson) {
	var botJson, excludeJson, excludedHecJobIds, listOfBotsArr = [],
	  listOfBotsObj = [];
	var fs = require('fs');
	//<<---TODO----->>
	//add other 2 paths
	//this is path bots
	var dcofeed = '//dcofeedsvc01/Kapow Katalyst/Resources/Project/Library/'
	$scope.listOfBots = 'no bots';
	$scope.verifyBotSelection = 'No file selected';
	$scope.showBotList = false;
	$scope.showUserVerifyBotSelectionMessage = false;
	$scope.clientList = [], $scope.jobIdToUpdate = [], $scope.duplicates = [];
	//upload the file and see contents
	$scope.UploadFile = function() {
	  var fileName = document.getElementById('exclude-file');
	  var aapa = 'AAPA',
	    aanp = 'AANP',
	    botPath = '',
	    listOfBotsToBeChanged = [];
	  excludeJson = excel2json.Convert(fileName.value);
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
	$scope.verifyBotSelection = function() {
	  var message = 'Would you like to update: ';
	  listOfBotsToBeChanged = [];
	  //aapa, aanp
	  listOfBotsToBeChanged.push($scope.botName);
	  for (var b = 0; b < $scope.selectedBots.length; b++) {
	    var bot = $scope.selectedBots[b];
	    for (var client in bot) {
	      if (bot.hasOwnProperty(client)) {
	        for (var clientBotObject in $scope.clientList) {
	          if ($scope.clientList[clientBotObject].name === client) {
	            $scope.clientList[clientBotObject].path = dcofeed + bot[client].name;
	          }
	        }
	        listOfBotsToBeChanged.push(bot[client].name);
	      }
	    }
	  }
	  for (var name in listOfBotsToBeChanged) {
	    if (listOfBotsToBeChanged[name] === listOfBotsToBeChanged[listOfBotsToBeChanged.length - 1]) {
	      message = message + ' and ' + listOfBotsToBeChanged[name] + '?';
	    } else {
	      message = message + listOfBotsToBeChanged[name] + ', ';
	    }
	  }
	  $scope.userVerifyBotSelectionMessage = message;
	  $scope.showUserVerifyBotSelectionMessage = true;
	}

	$scope.makeChangesAndSaveToFile = function() {
	  var addNewJob = true,
	    arrayOfJobObjects = [],
	    arrayOfRefIds = [],
	    noDuplicates = true;
	  var jobIdObject = excludedHecJobIds[0][1].property[0].object;
	  var clonedObjetOfKapowExclusion = (JSON.parse(JSON.stringify(jobIdObject[0])));
	  //for each job that needs changes
	  for (var job = 0; job < $scope.jobIdToUpdate.length; job++) {
	    //reset for each job
	    addNewJob = true;
	    var newJob = $scope.jobIdToUpdate[job];
	    for (var oj = 0; oj < jobIdObject.length; oj++) {
	      var oldJob = parseInt(jobIdObject[oj].property[1].property[0]._);
	      arrayOfJobObjects.push(jobIdObject[oj]);
	      //skip the following if there are duplicates
	      if (newJob === oldJob) {
	        break;
	      } else if (newJob < oldJob && addNewJob) {
	        //add job
	        addNewJob = false;
	        var temp = clonedObjetOfKapowExclusion;
	        temp.property[1].property[0]._ = newJob.toString();
	        arrayOfJobObjects.push(temp);
	      }
	    }
	    excludedHecJobIds[0][1].property[0].object = arrayOfJobObjects;
	    //read this to file, save file
	  }
	  //for each client bot that needs changes
	  for (var bot = 0; bot < $scope.clientList.length; bot++) {
	    var newRefId = $scope.clientList[bot].refId.toString();
	    xml2json.ConvertToJson($scope.clientList[bot].path, function(json) {
	      var refIds = getObjects(json, '_', 'Test Job Title, Tagline and Description');
	      var refIdList = refIds[0][1].property[0].object;
				console.log(refIdList);
	      var clonedObjectOfKapowRefId = (JSON.parse(JSON.stringify(refIdList[0])));
	      for (var id in refIdList) {
	        var oldRefId = refIdList[id].property[1].property[0]._.toString();
	        if (newRefId === oldRefId) {
	          noDuplicates = false;
	        }
	      }
	      if (noDuplicates) {
	        var temp = clonedObjectOfKapowRefId;
	        temp.property[1].property[0]._ = newRefId;
	        refIdList.push(temp);
	      }
	      //readd refIdList to File, save to file
				console.log(refIdList);
	    });
	  }
	}

	//shows the user which changes he would like to make.
	function updateUIWithAAChanges(botName, botPath) {
	  $scope.jobIdToUpdate = [], $scope.duplicates = [];
	  var path = dcofeed + botPath;
	  //pass callback function that manipulates resulting json
	  xml2json.ConvertToJson(path, function(json) {
	    //get deep nested object by object name
	    excludedHecJobIds = getObjects(json.object.property, '_', 'Exclude HeC Job ID');
	    var list = excludedHecJobIds[0][1].property[0].object;
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
	    $scope.apply();
	  });
	}
	//list of client bots selected manually
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
	function clientBotObj(name, clientId, jobNum, refId, contract) {
	  this.name = name;
	  this.clientId = clientId;
	  this.jobNum = jobNum;
	  this.refId = refId;
	  this.contract = contract;
	  this.path = '';
	}
	//manual sort function()
	//usage arrayName.sort(functioncall);
	function sortNumber(a, b) {
	  return a - b;
	}
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
	          clientListObj.push(new clientBotObj(client[0], client[1], client[2], client[3], client[4]));
	        }
	      }
	    }
	  }
	  return clientListObj;
	}
});
