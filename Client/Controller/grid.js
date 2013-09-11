
Player = {
    Empty : 0,
    Cross : 1,
    Circle : 2
}

function Coord(X, Y) {
    return {
	x : (typeof X === "undefined") ? 0 : X,
	y : (typeof Y === "undefined") ? 0 : Y
    };
}

function Grid() {
    var content = [Player.Empty, Player.Empty, Player.Empty,
		   Player.Empty, Player.Empty, Player.Empty,
		   Player.Empty, Player.Empty, Player.Empty];

    var grid = $("#grid");
    var elems = ['<td></td>',
		 '<td><img src="Client/View/Cross.png" alt="X" /></td>',
		 '<td><img src="Client/View/Circle.png" alt="O" /></td>'];


    this.set = function(coord, value) {
	content[(coord.y * 3) + coord.x] = value;
    }

    this.get = function(coord) {
	return content[(coord.y * 3) + coord.x];
    }

    this.update = function() {
	var newElems = "";
	var coord = Coord();

	for (coord.y = 0; coord.y < 3; coord.y++)
	{
	    newElems += "<tr>";
	    for (coord.x = 0; coord.x < 3; coord.x++)
	    {
		newElems += elems[content[(coord.y * 3) + coord.x]];
	    }
	    newElems += "</tr>";
	}

	// remove the elements and put the new ones
	grid.empty();
	grid.html(newElems);
    }
}
