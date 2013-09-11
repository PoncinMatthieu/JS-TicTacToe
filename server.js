
var util = require("util");
var http = require("http");

var dispatcher = require("./Server/dispatcher");
var matchmaker = require("./Server/matchmaker");

// creation of the callbacks
var callbacks = {
    // a small hello world
    "/hello": {
	"GET": function(request, response) {
	    dispatcher.sendResponse(response, 200, {"Content-Type": "text/plain"}, "Hello World");
	}
    },

    // serv the full content of the TicTacToe
    "/RequestMatch": {
	"POST": function(request, response) {
	    matchmaker.requestMatch(request, response, function (request, response, playerIndex) {
		// once a match is found, the game starts.
		// we return the player index to indicate who starts the game.
		dispatcher.sendResponse(response, 200, {"Content-Type": "text/plain"}, playerIndex.toString());
	    });
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
