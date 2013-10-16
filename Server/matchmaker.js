
var util = require("util");
var math = require("../Shared/tools");
var game = require("../Shared/game");

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
    var _room = null;
    var _index = 0;

    util.puts("Matchmaker: New player " + login);

    this.isBot = function() {return false;};
    this.login = function() {return login;};
    this.setRoom = function(r) {_room = r;};
    this.index = function() {return _index;};

    this.start = function(i) {
	_index = i;
	callback(request, response, _index);
    };

    // setup a callback to be informed when a request is aborted
    request.connection.on('close', function() {
	util.puts("Matchmaker: Connection aborted, removing player and associated room.");
	if (_room != null)
	    rooms.splice(rooms.indexOf(_room), 1);
    });
}

function Bot()
{
    var _room = null;
    var _index = 0;
    var _bot = this;

    this.isBot = function() {return true;};
    this.setRoom = function(r) {_room = r;};
    this.index = function() {return _index;};

    this.start = function(i) {
	_index = i;
	if (_index == 0)
	    play();
    };

    this.play = function () {
	// pick a random coord
	var num = 0;
	for (var x = 0; x < 3; x++) {
	    for (var y = 0; y < 3; y++) {
		if (_room.getGrid().get(math.Coord(x,y)) == -1)
		    num++;
	    }
	}
	var r = Math.floor(Math.random()*num);

	var i = 0;
	for (var x = 0; x < 3; x++) {
	    for (var y = 0; y < 3; y++) {
		if (_room.getGrid().get(math.Coord(x,y)) == -1)
		{
		    if (r == i) {
			_room.playerPicked(x,y, _bot);
			return;
		    }
		    i++;
		}
	    }
	}
    };

    //function picked(x, y)
    //{
//	play(); // play once the other player picked
  //  }
}

// define a Room to match 2 players together and represent a running game
function Room(withBot)
{
    util.puts("Matchmaker: Creating a new room");

    var _room = this;
    var status = Status.WaitingPlayer;
    var players = new Array();
    var pickedCallback = null;

    var grid = new game.Grid();
    var lastPick = null;

    this.getGrid = function() {return grid;}
    this.getLastPick = function() {return lastPick;}

    this.addPlayer = function(player) {
	players.push(player);
	player.setRoom(this);

	if (withBot && !player.isBot()) {
	    this.addPlayer(new Bot());
	}
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
	return ((players.length > 0 && players[0].login !== undefined && players[0].login() == playerLogin) ||
		(players.length > 1 && players[1].login !== undefined && players[1].login() == playerLogin));
    };

    this.getPlayer = function(playerLogin) {
	if (players.length > 0 && players[0].login() == playerLogin)
	    return players[0];
	else if (players.length > 1 && players[1].login() == playerLogin)
	    return players[1];
	return null;
    };

    this.setPickedCallback = function(player, callback) {
	pickedCallback = callback;
	if (lastPick != null)
	    callPickedCallback(player, lastPick.x, lastPick.y);
    };

    this.hasPicked = function(x, y, login) {
	var player = this.getPlayer(login);
	if (player != null)
	    this.playerPicked(x, y, player);
    };

    this.playerPicked = function(x, y, player) {
	grid.set(math.Coord(parseInt(x),parseInt(y)), player.index());

	for (var i = 0; i < 3; i++) {
	    for (var j = 0; j < 3; j++) {
		process.stdout.write(grid.get(math.Coord(j,i)) + " ");
	    }
	    util.puts("");
	}

	if (pickedCallback != null)
	    callPickedCallback(player, x,y);
	else if (withBot && !player.isBot())
	    players[(player.index() + 1 % 2)].play();
	else
	    lastPick = math.Coord(x,y);
    };

    function callPickedCallback(player, x, y) {
	var c = pickedCallback;
	pickedCallback = null;
	lastPick = null;
	c(x, y);
    }

    this.remove = function () {
	var index = rooms.indexOf(_room);
	if (index > -1) { // remove the room
	    rooms.splice(index, 1);
	}
    }
}

function matchPlayer(player, withBot) {
    var r;

    // check if games are over
    for (var i = 0; i < rooms.length; i++) {
	if (rooms[i].getGrid().isOver()) {
	    util.puts("Game Over destroying room");
	    rooms[i].remove();
	}
    }

    // check if a room is waiting for a player
    if (!withBot && rooms.length > 0 && rooms[rooms.length - 1].isWaitingForPlayers()) {
	r = rooms[rooms.length - 1];
	r.addPlayer(player);
    } else {
	// create a new room
	r = new Room(withBot);
	r.addPlayer(player);
	rooms.push(r);
    }

    // start the game if the room is full
    if (r.isReady()) {
	r.startGame();
    }
}


module.exports = {
    // POST request match
    requestMatch: function(request, response, login, callback, withBot) {
	matchPlayer(new Player(request, response, callback, login), withBot);
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
