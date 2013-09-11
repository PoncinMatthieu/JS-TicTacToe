
var util = require("util");
var http = require("http");

var dispatcher = require("./Server/dispatcher");

// creation of the callbacks
var callbacks = {
    // a small hello world
    "/hello": {
	"GET": function(request, response) {
	    dispatcher.sendResponse(response, 200, {"Content-Type": "text/plain"}, "Hello World");
	}
    },

    // serv the full content of the TicTacToe
    "/": {
	"POST": function(request, response) {
	    dispatcher.sendResponse(response, 200, {"Content-Type": "text/plain"}, "Here is your post");
	}
    }
}

// creation of the http server
http.createServer(
    function(request, response) {
	util.puts("Request " + request.method + ": " + request.url + ((request.statusCode != null) ? (" Status: " + request.StatusCode) : ""));

	dispatcher.dispatch(request, response, callbacks);
    }).listen(8080);

util.puts("Server Running on 8080");
