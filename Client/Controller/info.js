
function Info(content) {
    this.content = content;

    this.display = function() {
	$("#top-panel").append("<p id=\"info\">" + this.content + "</p>");
    };

    this.remove = function() {
	$("#info").remove();
    };

    this.update = function(content) {
	this.remove();
	this.content = content;
	this.display();
    };
}
