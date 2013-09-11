

$(function() {
    var grid = new Grid();
    grid.update();

/*
    grid.set(Coord(0,1), Player.Cross);
    grid.set(Coord(1,0), Player.Circle);
    grid.update();
*/

    var pop = new Popup("Please request a match !");
    pop.display();

    $("#requestMatch").click(function() {
	var v = $("#login").val();
	if (v == "") {
	    pop.update('Please set a login.');
	    return;
	}

	// requesting a match
        pop.update("Waiting for a match.");

        $.ajax({
            type: 'POST',
            url: 'RequestMatch',
	    data: v,
            timeout: 10000, // 10 seconds
            success: function(data) {
		pop.update("Match found, starting game. " + data);
	    },
            error: function() {
		pop.update('No match was found. Please try again.');
	    }
        });
    });
});

