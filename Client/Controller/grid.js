
function Grid() {
    Game.Grid.call(this);

    var thisGrid = this;
    var callback = null;

    var grid = $("#grid");
    var elems = ['',
		 '<img src="Client/View/Cross.png" alt="X" />',
		 '<img src="Client/View/Circle.png" alt="O" />'];

    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');


    //this.set(Tools.Coord(0,0), 0);
    //this.set(Tools.Coord(1,1), 1);

    this.update = function() {
	var id = $("input[name=interface]:checked").val();
	if (id == "table")
	    drawTable(this);
	else if (id == "canvas")
	    drawCanvas(this);
    };

    this.readyToPick = function(c) {
	callback = c;
	var id = $("input[name=interface]:checked").val();

        if (id == "table")
	{
	    //$("td").click(tableClickedEvent);
	    $("td").bind("click", tableClickedEvent);
	}
	else if (id == "canvas")
	{
	    canvas.addEventListener("mouseup", canvasClickedEvent, false);
	}
    };


    function drawTable(g) {
	var newElems = "";
	var coord = Tools.Coord();
	for (coord.y = 0; coord.y < 3; coord.y++)
	{
	    newElems += "<tr>";
	    for (coord.x = 0; coord.x < 3; coord.x++)
	    {
		newElems += "<td x='" + coord.x + "' y='" + coord.y + "'>" + elems[g.get(coord) + 1] + "</td>";
	    }
	    newElems += "</tr>";
	}

	// remove the elements and put the new ones
	grid.empty();
	grid.html(newElems);
    }

    function drawCanvas(g) {
	var coord = Tools.Coord();

	context.clearRect(0,0,300,300);
	context.strokeStyle = "black";
	context.strokeRect(0,0,300,300);

	context.beginPath();
	context.moveTo(0,100);
	context.lineTo(300,100);
	context.moveTo(0,200);
	context.lineTo(300,200);

	context.moveTo(100,0);
	context.lineTo(100,300);
	context.moveTo(200,0);
	context.lineTo(200,300);
	context.stroke();

	for (coord.y = 0; coord.y < 3; coord.y++)
	{
	    for (coord.x = 0; coord.x < 3; coord.x++)
	    {
		var v = g.get(coord);
		if (v == 0) // draw Cross
		{
		    context.strokeStyle = "red";
		    context.beginPath();
		    context.moveTo(coord.x*100 + 10, coord.y*100 + 10);
		    context.lineTo(coord.x*100 + 90, coord.y*100 + 90);
		    context.moveTo(coord.x*100 + 90, coord.y*100 + 10);
		    context.lineTo(coord.x*100 + 10, coord.y*100 + 90);
		    context.stroke();
		}
		else if (v == 1) // draw Circle
		{
		    context.strokeStyle = "green";
		    context.beginPath();
		    context.arc(coord.x*100 + 50,coord.y*100 + 50,40,0, Math.PI*2,true);
		    context.stroke();
		}
	    }
	}
    }

    function getMousePos(e)
    {
	var x = new Number();
	var y = new Number();

	if (e.x != undefined && e.y != undefined)
	{
	    x = event.x;
	    y = event.y;
	}
	else
	{
	    x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
	    y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}

	x -= canvas.offsetLeft;
	y -= canvas.offsetTop;
	return Tools.Coord(x,y);
    }

    function tableClickedEvent(e)
    {
	if (callback == null)
	    return;

	var coord = Tools.Coord(parseInt(jQuery(this).attr("x")), parseInt(jQuery(this).attr("y")));
	if (thisGrid.get(coord) == -1)
	{
	    callback(coord);
	    callback = null;
	    $("td").unbind("click", tableClickedEvent);
	}
    }

    function canvasClickedEvent(e)
    {
	if (callback == null)
	    return;

	var coord = getMousePos(e);
	coord.x = Math.floor(coord.x / 100);
	coord.y = Math.floor(coord.y / 100);
	if (thisGrid.get(coord) == -1)
	{
	    callback(coord);
	    callback = null;
	    this.removeEventListener("mouseup", canvasClickedEvent, false);
	}
    }
}
