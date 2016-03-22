
serviceApp.factory('searchJson', function() {
	return {
		getObjects: function(obj, key, val, previousObj) {
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
	}
});
