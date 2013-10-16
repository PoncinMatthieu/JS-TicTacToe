
$(function() {
    var grid = new Grid();
    var info = new Info("Please request a match!");
    info.display();

    // \todo to remove
    grid.update();

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
			    info.update('Game Over.<br/>' + (grid.isDraw() ? 'This is a draw !' : 'You win !'));
			else
			    play(l, playerIndex, (currentTurn + 1) % 2); // we picked, next turn.
		    },
		    error: function() {
			info.update('An error occured.');
		    }
		});
	    });
	    info.remove();
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
			info.update('Game Over.<br/>' + (grid.isDraw() ? 'This is a draw !' : 'You lose !'));
		    else
			play(l, playerIndex, (currentTurn + 1) % 2); // the player picked, next turn.
                },
                error: function() {
		    // timeout, send another request
		    // this system is used by chat services (BOSH/XMPP) to ensure the data arrives at the same time
		    play(l, playerIndex, currentTurn);
                }
            });
	    info.update('Waiting for your turn.');
	}
    }


    $("#requestMatch").click(function() {
	var v = $("#login").val();
	if (v == "") {
	    info.update('Please set a login.');
	    return;
	}

	// requesting a match
        info.update("Waiting for a match.");

        $.ajax({
            type: 'POST',
            url: 'RequestMatch',
	    data: v,
            timeout: 10000, // 10 seconds
            success: function(data) {
		info.update("Match found, starting game. " + data);
		grid.update();
		play(v, parseInt(data), 0);
	    },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
		if (XMLHttpRequest.status == 0)
		    info.update('No match was found. Please try again.');
		else if (XMLHttpRequest.status == 400)
		    info.update('Player already registered in the matchmaker! Please use another pseudo.');
		else
		    info.update('Error ' + XMLHttpRequest.status + ': ' + errorThrown);
	    }
        });
    });

    $("#left-panel").change(function() {
	grid.update();
    });
});

