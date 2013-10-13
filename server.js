
var util = require("util");
var http = require("http");
var qs = require('querystring');

var dispatcher = require("./Server/dispatcher");
var matchmaker = require("./Server/matchmaker");
//var game = require("./Server/game");

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

	    // retreive the POST and then match the player
	    var body = '';
	    request.on('data', function(data) {
		body += data;
		if (body.length > 1e6) {
		    request.connection.destroy(); // to avoid flood
		}
	    });
	    request.on('end', function () {
		// check if the player login already exists
		if (matchmaker.getRoom(body) != null)
		{
		    dispatcher.sendResponse(response, 400, {"Content-Type": "text/plain"}, '');
		}
		else
		{
		    matchmaker.requestMatch(request, response, body, function (request, response, playerIndex) {
			// once a match is found, the game starts.
			// we return the player index to indicate who starts the game.
			dispatcher.sendResponse(response, 200, {"Content-Type": "text/plain"}, playerIndex.toString());
		    });
		}
	    });
	}
    },

    // player picked
    "/Pick": {
	"POST": function(request, response) {
	    // retreive the POST, get the room associated to the player and inform the other player
            var body = '';
            request.on('data', function(data) {
		body += data;
                if (body.length > 1e6) {
                    request.connection.destroy(); // to avoid flood
                }
            });
            request.on('end', function () {
		var POST = qs.parse(body);
		util.puts("-> Player " + POST["login"] + " picked. " + POST["x"] + ":" + POST["y"]);
                var room = matchmaker.getRoom(POST["login"])
		if (room != null) {
		    room.hasPicked(POST["x"], POST["y"], POST["login"]);
		    dispatcher.sendResponse(response, 200, {"Content-Type": "text/plain"}, "OK");
		}
            });
	}
    },

    // request to know if the other player picked
    "/Picked": {
	"POST": function(request, response) {
            // retreive the POST, set the callback to send a reply once the player picked
            var body = '';
            request.on('data', function(data) {
                body += data;
                if (body.length > 1e6) {
                    request.connection.destroy(); // to avoid flood
                }
            });
            request.on('end', function () {
		var room = matchmaker.getRoom(body);
		if (room != null) {
		    room.setPickedCallback(function(x, y) {
			dispatcher.sendResponse(response, 200, {"Content-Type": "text/plain"}, x + " " + y);
		    });
		}
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
