

$(function() {
    var grid = new Grid();
    grid.set(Coord(0,1), Player.Cross);
    grid.set(Coord(1,0), Player.Circle);
    grid.update();

    var pop = new Popup("Please wait for the game to start !");
    pop.display();

    $("#requestMatch").click(function() {
	pop.remove();
	pop.content = "Waiting for a match.";
	pop.display();
    });
});

