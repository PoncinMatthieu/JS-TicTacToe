
var util = require("util");

// define the rooms
var rooms = new Array();

Status = {
    WaitingPlayer: 0,
    Ready: 1,
    GameRunning: 2,
    GameFinished: 3
}

// define a player with his match request / response
function Player(request, response, callback, login)
{
    var room = null;
    var index = 0;

    util.puts("Matchmaker: New player " + login);

    this.login = function () {return login;};
    this.setRoom = function (r) {room = r;};

    this.start = function (i) {
	index = i;
	callback(request, response, index);
    };

    // setup a callback to be informed when a request is aborted
    request.connection.on('close', function() {
	util.puts("Matchmaker: Connection aborted, removing player and associated room.");
	if (room != null)
	    rooms.splice(rooms.indexOf(room), 1);
    });
}

// define a Room to match 2 players together and represent a running game
function Room()
{
    util.puts("Matchmaker: Creating a new room");

    var status = Status.WaitingPlayer;
    var players = new Array();
    var pickedCallback = null;

    this.addPlayer = function(player) {
	players.push(player);
	player.setRoom(this);
	if (players.length == 2)
	    status = Status.Ready;
    };

    this.startGame = function() {
	util.puts("Matchmaker: Starting game");
	for (var i = 0; i < players.length; i++) {
	    players[i].start(i);
	}
    };

    this.isWaitingForPlayers = function() {
	return (status == Status.WaitingPlayer);
    };

    this.isReady = function() {
	return (status == Status.Ready);
    };

    this.isPlayerInside = function(playerLogin) {
	return (players[0].login() == playerLogin || players[1].login() == playerLogin);
    };

    this.setPickedCallback = function(callback) {
	pickedCallback = callback;
    };

    this.asPicked = function(x, y) {
	pickedCallback(x, y);
    };
}

function matchPlayer(player) {
    var r;

    // check if a room is waiting for a player
    if (rooms.length > 0 && rooms[rooms.length - 1].isWaitingForPlayers()) {
	r = rooms[rooms.length - 1];
	r.addPlayer(player);
	if (r.isReady()) {
	    r.startGame();
	}
    } else {
	// create a new room
	r = new Room();
	r.addPlayer(player);
	rooms.push(r);
    }
}


module.exports = {
    // POST request match
    requestMatch: function(request, response, login, callback) {
	matchPlayer(new Player(request, response, callback, login));
    },

    // return the room containing the given player login
    getRoom: function(playerLogin) {
	for (var i = 0; i < rooms.length; i++) {
	    if (rooms[i].isPlayerInside(playerLogin)) {
		return rooms[i];
	    }
	}
	return null;
    }
}
