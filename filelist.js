
var walk = require('walk');
var path = require('path');

var MEDIA_DIR = ["/home/pimedia/media"];

var mlist = () => {
	var d = {};
	for(var i in MEDIA_DIR)
	{
		var cd = MEDIA_DIR[i];
		options = {
			listeners: {
				file: (root, fileStats, next) => {
					d[fileStats.name] = path.join(root, fileStats.name);
					next();
				}
			}
		};
		walker = walk.walkSync(cd, options);
	}
	return d;
}

exports.mlist = mlist;
