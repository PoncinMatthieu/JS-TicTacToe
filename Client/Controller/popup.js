
function Popup(content) {
    this.content = content;

    var grid = $("#grid");
    var position = grid.position();
    var top = position.top;
    var left = position.left;
    var bottom = $(window).height() - position.top - grid.outerHeight();
    var right = $(window).width() - position.left - grid.outerWidth();

    this.display = function() {
	grid.parent().append(
'<div id="WaitPopup"> \
  <div class="overlay1" style="top:' + top + 'px; left:' + left + 'px; bottom:' + bottom + 'px; right:' + right + 'px;"></div> \
  <div style="top:' + top + 'px; left:' + left + 'px; bottom:' + bottom + 'px; right:' + right + 'px;"> \
    <div class="spacer"></div> \
    <div class="content">' + this.content + '</div> \
  </div> \
</div>')
    };

    this.remove = function() {
	$("#WaitPopup").remove();
    };

    this.update = function(content) {
	this.remove();
	this.content = content;
	this.display();
    };
}
