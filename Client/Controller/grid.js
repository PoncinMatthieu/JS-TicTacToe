
function Grid() {
    Game.Grid.call(this);

    var currentInterface = null;

    function initInterface(grid, id) {
	if (currentInterface != null)
	    currentInterface.free();

	if (id == "table"){
	    currentInterface = new Interfaces.TableInterface(grid);
	}
	else if (id == "canvas"){
	    currentInterface = new Interfaces.CanvasInterface(grid);
	}
	else if (id == "webgl") {
	    currentInterface = new Interfaces.GLInterface(grid);
	}
    }

    this.update = function() {
	var id = $("input[name=interface]:checked").val();
	if (currentInterface == null || id != currentInterface.name())
	    initInterface(this, id);

	if (currentInterface != null)
	    currentInterface.draw(this);
    };

    this.readyToPick = function(callback) {
	if (currentInterface != null)
	    currentInterface.readyToPick(callback);
    };
}
