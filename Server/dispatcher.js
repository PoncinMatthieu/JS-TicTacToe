
var util = require("util");
var url = require("url");
var fs = require("fs");
var path = require("path");

var contentTypes = {
    '.html': "text/html",
    '.css':  "text/css",
    '.js':   "text/javascript"
};

function send404(response)
{
    response.writeHead(404, {"Content-Type": "text/plain"});
    response.write("404 Not Found\n");
    response.end();
}

function send500(response, error)
{
    response.writeHead(500, {"Content-Type": "text/plain"});
    response.write(error + "\n");
    response.end();
}

function sendStaticRessource(response, filename)
{
    fs.readFile(filename, "binary", function(err, file) {
	if(err) {
	    send500(response, err);
            return;
	}

      var headers = {};
      var contentType = contentTypes[path.extname(filename)];
      if (typeof contentType !== "undefined")
	  headers["Content-Type"] = contentType;
      response.writeHead(200, headers);
      response.write(file, "binary");
      response.end();
    });
}

module.exports = {
  dispatch: function(request, response, callbacks) {
      // get uri
      var uri = url.parse(request.url).pathname;
      var file = path.join(process.cwd(), uri);
      var exists = path.existsSync(file);

      util.puts("Dispatch request:");
      util.puts("\turi: " + uri);
      util.puts("\tmethod: " + request.method);
      util.puts("\tstatusCode: " + request.statusCode);

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
		  send404(response);
	  });
      }
  }
};

