
$(function() {
    var grid = new Grid();
    grid.update();

    var pop = new Popup("Please request a match !");
    pop.display();


    function play(l, playerIndex, currentTurn) {
	if (playerIndex == currentTurn) { // it's our turn, we set pick events
	    grid.readyToPick(function(coord) {
		// the player picked a case
		$.ajax({
		    type: 'POST',
		    url: 'Pick',
		    data: {login: l, x: coord.x, y: coord.y},
		    timeout: 3000, // 3 seconds
		    success: function(data) {
			grid.set(coord, currentTurn);
			grid.update();
			if (grid.isOver()) // game over ?
			    pop.update('Game Over.<br/>' + (grid.isDraw() ? 'This is a draw !' : 'You win !'));
			else
			    play(l, playerIndex, (currentTurn + 1) % 2); // we picked, next turn.
		    },
		    error: function() {
			pop.update('An error occured.');
		    }
		});
	    });
	    pop.remove();
	} else { // it's not our turn, we send a request to wait for the other player to pick
            $.ajax({
                type: 'POST',
                url: 'Picked',
                data: l,
                timeout: 60000, // 60 seconds, long timeout, if the player does not pick in 30 second, we'll send another request
                success: function(data) {
		    var coord = {
			x: 0,
			y: 0
		    }
		    var a = data.split(" ");
		    coord.x = parseInt(a[0]);
		    coord.y = parseInt(a[1]);
                    grid.set(coord, currentTurn);
                    grid.update();
		    if (grid.isOver()) // game over ?
			pop.update('Game Over.<br/>' + (grid.isDraw() ? 'This is a draw !' : 'You lose !'));
		    else
			play(l, playerIndex, (currentTurn + 1) % 2); // the player picked, next turn.
                },
                error: function() {
		    // timeout, send another request
		    // this system is used by chat services (BOSH/XMPP) to ensure the data arrives at the same time
		    play(l, playerIndex, currentTurn);
                }
            });
	    pop.update('Waiting for your turn.');
	}
    }


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
		play(v, parseInt(data), 0);
	    },
            error: function() {
		pop.update('No match was found. Please try again.');
	    }
        });
    });
});

