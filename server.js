
var util = require("util");
var http = require("http");

var dispatcher = require("./Server/dispatcher");

var callbacks = {
    // a small hello world
    "/hello": {
	"GET": function(request, response) {
	    response.writeHeader(200, {"Content-Type": "text/plain"});
	    response.write("Hello World");
	    response.end();
	}
    },

    // serv the full content of the TicTacToe
    "/": {
	"POST": function(request, response) {
	    response.writeHeader(200, {"Content-Type": "text/plain"});
	    response.write("Here is your post");
	    response.end();
	}
    }
}

http.createServer(
    function(request, response) {
	dispatcher.dispatch(request, response, callbacks);
    }).listen(8080);

util.puts("Server Running on 8080");
