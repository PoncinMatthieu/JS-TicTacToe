
function Grid() {
    Game.Grid.call(this);

    var grid = $("#grid");
    var elems = ['',
		 '<img src="Client/View/Cross.png" alt="X" />',
		 '<img src="Client/View/Circle.png" alt="O" />'];

    this.update = function() {
	var newElems = "";
	var coord = Math.Coord();

	for (coord.y = 0; coord.y < 3; coord.y++)
	{
	    newElems += "<tr>";
	    for (coord.x = 0; coord.x < 3; coord.x++)
	    {
		newElems += "<td x='" + coord.x + "' y='" + coord.y + "'>" + elems[this.get(coord) + 1] + "</td>";
	    }
	    newElems += "</tr>";
	}

	// remove the elements and put the new ones
	grid.empty();
	grid.html(newElems);
    };

    this.readyToPick = function(callback) {
	$("td").click(function(e) {
	    callback(Math.Coord(parseInt(jQuery(this).attr("x")), parseInt(jQuery(this).attr("y"))));
	});
    };
}
