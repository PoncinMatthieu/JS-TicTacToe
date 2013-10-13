

// module to define the game structs
(function(exports){

    Player = {
	Empty : -1,
	Cross : 0,
	Circle : 1
    };

    exports.Player = Player;

    exports.Grid = function() {
	var content = [Player.Empty, Player.Empty, Player.Empty,
                       Player.Empty, Player.Empty, Player.Empty,
                       Player.Empty, Player.Empty, Player.Empty];
	var draw = false;

	this.set = function(coord, value) {
	    content[(coord.y * 3) + coord.x] = value;
	};

	this.get = function(coord) {
	    return content[(coord.y * 3) + coord.x];
	};

	this.isOver = function() {
            var over = false;

            function g(x, y) {
		return content[(y * 3) + x];
            }

            // lines
            if (g(0,0) != Player.Empty && g(0,0) == g(1,0) && g(0,0) ==  g(2,0))
		return true;
            if (g(0,1) != Player.Empty && g(0,1) == g(1,1) && g(0,1) ==  g(2,1))
		return true;
            if (g(0,2) != Player.Empty && g(0,2) == g(1,2) && g(0,2) ==  g(2,2))
		return true;
            // columns
            if (g(0,0) != Player.Empty && g(0,0) == g(0,1) && g(0,0) ==  g(0,2))
		return true;
            if (g(1,0) != Player.Empty && g(1,0) == g(1,1) && g(1,0) ==  g(1,2))
		return true;
            if (g(2,0) != Player.Empty && g(2,0) == g(2,1) && g(2,0) ==  g(2,2))
		return true;
            // diagonal
            if (g(0,0) != Player.Empty && g(0,0) == g(1,1) && g(0,0) == g(2,2))
		return true;
            if (g(0,2) != Player.Empty && g(0,2) == g(1,1) && g(0,2) == g(2,0))
		return true;

            // draw ?
            for (var i = 0; i < 9; i++) {
		if (content[i] == Player.Empty) {
                    return false;
		}
            }
            draw = true;
            return true;
	};

	this.isDraw = function() {
            return draw;
	};
    }

})((typeof exports === 'undefined') ? (this['Game']={}) : exports);
