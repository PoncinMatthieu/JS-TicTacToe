
var util = require("util");
var url = require("url");
var fs = require("fs");
var path = require("path");

var contentTypes = {
    '.html': "text/html",
    '.css':  "text/css",
    '.js':   "text/javascript"
};

function sendStaticRessource(response, filename)
{
    fs.readFile(filename, "binary", function(err, file) {
	if(err) {
	    module.exports.send500(response, err);
            return;
	}

	var headers = {};
	var contentType = contentTypes[path.extname(filename)];
	if (typeof contentType !== "undefined")
	    headers["Content-Type"] = contentType;

	module.exports.sendResponse(response, 200, headers, file, "binary");
    });
}

module.exports = {
    dispatch: function(request, response, callbacks) {
	// get uri
	var uri = url.parse(request.url).pathname;
	var file = path.join(process.cwd(), uri);
	var exists = path.existsSync(file);

	if (exists && fs.statSync(file).isDirectory())
	    file += '/index.html';

	// check if the request was mapped, if not we send the static ressource requested
	if (typeof callbacks[uri] !== "undefined" && typeof callbacks[uri][request.method] !== "undefined") {
	    callbacks[uri][request.method](request, response);
	} else {
	    path.exists(file, function(exists) {
		// check if the path exists and send the static ressource
		if(exists)
		    sendStaticRessource(response, file);
		else
		    module.exports.send404(response);
	    });
	}
    },

    send404: function(response) {
	module.exports.sendResponse(response, 404, {"Content-Type": "text/plain"}, "404 Not Found\n");
    },

    send500: function(response, error) {
	module.exports.sendResponse(response, 500, {"Content-Type": "text/plain"}, error + "\n");
    },

    sendResponse: function(response, code, headers, content, contentAttr) {
	response.writeHeader(code, headers);
	if (typeof contentAttr === "undefined")
	    response.write(content);
	else
	    response.write(content, contentAttr);
	response.end();
    }
};

