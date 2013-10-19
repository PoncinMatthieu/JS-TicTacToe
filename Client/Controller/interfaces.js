
// create the module Interface containing all the interfaces
var Interfaces = (function() {
var my = {};
var callback = null;
var grid = null;
var canvas = null;

my.TableInterface = function(g) {
    grid = g;
    var table = $("#table");
    var elems = ['',
                 '<img src="Client/View/Cross.png" alt="X" />',
                 '<img src="Client/View/Circle.png" alt="O" />'];

    table.show();

    this.name = function() {return 'table';}

    this.draw = function() {
        var newElems = "";
        var coord = Tools.Coord();
        for (coord.y = 0; coord.y < 3; coord.y++) {
            newElems += "<tr>";
            for (coord.x = 0; coord.x < 3; coord.x++) {
                newElems += "<td x='" + coord.x + "' y='" + coord.y + "'>" + elems[grid.get(coord) + 1] + "</td>";
	    }
            newElems += "</tr>";
        }

	table.empty();
        table.html(newElems);

	// setup again the callback if it was set
	if (callback != null)
	    this.readyToPick(callback);
    }

    this.free = function() {
	table.empty();
	table.hide();
    }

    this.readyToPick = function(c) {
	callback = c;
	$("td").bind("click", clickedEvent);
    };

    function clickedEvent(e) {
	if (callback == null)
	    return;

	var coord = Tools.Coord(parseInt(jQuery(this).attr("x")), parseInt(jQuery(this).attr("y")));
	if (grid.get(coord) == -1) {
	    callback(coord);
	    callback = null;
	    $("td").unbind("click", clickedEvent);
	}
    }
};

my.CanvasInterface = function(g) {
    grid = g;
    canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

    canvas.removeAttribute('hidden');

    this.name = function() {return 'canvas';}

    this.draw = function() {
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

        for (coord.y = 0; coord.y < 3; coord.y++) {
	    for (coord.x = 0; coord.x < 3; coord.x++) {
                var v = grid.get(coord);
                if (v == 0) { // draw Cross
                    context.strokeStyle = "red";
                    context.beginPath();
                    context.moveTo(coord.x*100 + 10, coord.y*100 + 10);
                    context.lineTo(coord.x*100 + 90, coord.y*100 + 90);
                    context.moveTo(coord.x*100 + 90, coord.y*100 + 10);
                    context.lineTo(coord.x*100 + 10, coord.y*100 + 90);
                    context.stroke();
                } else if (v == 1) { // draw Circle
                    context.strokeStyle = "green";
                    context.beginPath();
                    context.arc(coord.x*100 + 50,coord.y*100 + 50,40,0, Math.PI*2,true);
                    context.stroke();
                }
            }
        }

	// setup again the callback if it was set
	if (callback != null)
	    this.readyToPick(callback);
    }

    this.free = function() {
	context.clearRect(0,0,300,300);
	canvas.setAttribute('hidden', 'true');
    }

    this.readyToPick = function(c) {
	callback = c;
	canvas.addEventListener("mouseup", canvasClickedEvent, false);
    }
};

my.GLInterface = function(g) {
    grid = g;
    canvas = document.getElementById('webgl');
    var my = this;
    var gl;
    var mvMatrix = mat4.create();
    var pMatrix = mat4.create();
    var shaderProgram;
    var shaderProgramTex;
    var gridVertexBuffer;
    var spriteVertexBuffer;
    var crossTexture;
    var circleTexture;
    var textureLoaded = 0;


    // init GL context
    initGL(canvas);
    initShaders();
    initBuffers();
    initTextures();
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    canvas.removeAttribute('hidden');

    this.name = function() {return 'webgl';}

    this.draw = function() {
	if (textureLoaded != 2)
	    return;

        var coord = Tools.Coord();
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	mat4.ortho(0, gl.viewportWidth, 0, gl.viewportHeight, -1, 1, pMatrix);
	mat4.identity(mvMatrix);

        gl.useProgram(shaderProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER, gridVertexBuffer);
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, gridVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, mvMatrix);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, pMatrix);
        gl.drawArrays(gl.LINES, 0, gridVertexBuffer.numItems);


	gl.useProgram(shaderProgramTex);
	gl.bindBuffer(gl.ARRAY_BUFFER, spriteVertexBuffer);
	gl.enableVertexAttribArray(shaderProgramTex.vertexPositionAttribute);
	gl.enableVertexAttribArray(shaderProgramTex.texCoordAttribute);
	gl.vertexAttribPointer(shaderProgramTex.vertexPositionAttribute, spriteVertexBuffer.coordElementCount, gl.FLOAT, false, spriteVertexBuffer.stride, spriteVertexBuffer.coordOffset);
	gl.vertexAttribPointer(shaderProgramTex.texCoordAttribute, spriteVertexBuffer.texCoordElementCount, gl.FLOAT, false, spriteVertexBuffer.stride, spriteVertexBuffer.texCoordOffset);
	gl.uniformMatrix4fv(shaderProgramTex.mvMatrixUniform, false, pMatrix);
        for (coord.y = 0; coord.y < 3; coord.y++) {
	    for (coord.x = 0; coord.x < 3; coord.x++) {
                var v = grid.get(coord);

		if (v != -1) {
		    mat4.identity(mvMatrix);
		    mat4.translate(mvMatrix, [coord.x * 100 + 5, 205 - (coord.y * 100), 0]);

		    // set the texture
		    gl.activeTexture(gl.TEXTURE0);
                    if (v == 0) { // draw Cross
			gl.bindTexture(gl.TEXTURE_2D, crossTexture);
                    } else if (v == 1) { // draw Circle
			gl.bindTexture(gl.TEXTURE_2D, circleTexture);
                    }

		    gl.uniform1i(shaderProgramTex.samplerUniform, 0);
		    gl.uniformMatrix4fv(shaderProgramTex.pMatrixUniform, false, mvMatrix);
		    gl.drawArrays(gl.TRIANGLE_STRIP, 0, spriteVertexBuffer.numItems);
		}
            }
	}

	// setup again the callback if it was set
	if (callback != null)
	    this.readyToPick(callback);
    }

    function initGL(canvas) {
        try {
            gl = canvas.getContext("webgl");
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
        } catch (e) {
        }
        if (!gl) {
            alert("Could not initialise WebGL");
        }
    }

    function initBuffers() {
        gridVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, gridVertexBuffer);
        var vertices = [
	    0, 0,
 	    0, 300,

 	    0, 300,
 	    300, 300,

 	    300, 300,
 	    300, 0,

 	    300, 0,
 	    0, 0,

	    100, 0,
	    100, 300,

	    200, 0,
	    200, 300,

	    0, 100,
	    300, 100,

	    0, 200,
	    300, 200,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        gridVertexBuffer.itemSize = 2;
        gridVertexBuffer.numItems = 16;


	spriteVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, spriteVertexBuffer);
        vertices = [
	    90,90, 1,1,
	    0,90,  0,1,
	    90,0,  1,0,
	    0,0,   0,0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	spriteVertexBuffer.coordElementCount = 2;
	spriteVertexBuffer.coordOffset = 0;
	spriteVertexBuffer.texCoordElementCount = 2;
	spriteVertexBuffer.texCoordOffset = 2 * Float32Array.BYTES_PER_ELEMENT;
        spriteVertexBuffer.numItems = 4;
	spriteVertexBuffer.stride = 4 * Float32Array.BYTES_PER_ELEMENT;
    }

    function initShaders() {
	// shader without texture management
        var fragmentShader = getShader(gl, "shader-fs");
        var vertexShader = getShader(gl, "shader-vs");

        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        gl.useProgram(shaderProgram);
        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");


	// shader with texture management
        fragmentShader = getShader(gl, "shader-fs-tex");
        vertexShader = getShader(gl, "shader-vs-tex");

        shaderProgramTex = gl.createProgram();
        gl.attachShader(shaderProgramTex, vertexShader);
        gl.attachShader(shaderProgramTex, fragmentShader);
        gl.linkProgram(shaderProgramTex);

        if (!gl.getProgramParameter(shaderProgramTex, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        gl.useProgram(shaderProgramTex);
        shaderProgramTex.vertexPositionAttribute = gl.getAttribLocation(shaderProgramTex, "aVertexPosition");
        shaderProgramTex.texCoordAttribute = gl.getAttribLocation(shaderProgramTex, "aTextureCoord");
        shaderProgramTex.pMatrixUniform = gl.getUniformLocation(shaderProgramTex, "uPMatrix");
        shaderProgramTex.mvMatrixUniform = gl.getUniformLocation(shaderProgramTex, "uMVMatrix");
	shaderProgramTex.samplerUniform = gl.getUniformLocation(shaderProgramTex, "uSampler");
    }

    function getShader(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }

        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    function initTextures() {
	crossTexture = gl.createTexture();
	crossTexture.image = new Image();
	crossTexture.image.onload = function() {
	    handleLoadedTexture(crossTexture)
	    textureLoaded++;
	    my.draw();
	}
	crossTexture.image.src = "Client/View/Cross.png";

	circleTexture = gl.createTexture();
	circleTexture.image = new Image();
	circleTexture.image.onload = function() {
	    handleLoadedTexture(circleTexture)
	    textureLoaded++;
	    my.draw();
	}
	circleTexture.image.src = "Client/View/Circle.png";
    }

    function handleLoadedTexture(texture) {
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.bindTexture(gl.TEXTURE_2D, null);
    }

    this.free = function(c) {
	canvas.setAttribute('hidden', 'true');
    }

    this.readyToPick = function(c) {
	callback = c;
	canvas.addEventListener("mouseup", canvasClickedEvent, false);
    }
};


function getMousePos(e) {
    var x = new Number();
    var y = new Number();

    if (e.x != undefined && e.y != undefined) {
	x = event.x;
	y = event.y;
    } else {
	x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
	y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    if (canvas != null)
    {
	x -= canvas.offsetLeft;
	y -= canvas.offsetTop;
    }

    return Tools.Coord(x,y);
}

function canvasClickedEvent(e) {
    if (callback == null)
	return;

    var coord = getMousePos(e);
    coord.x = Math.floor(coord.x / 100);
    coord.y = Math.floor(coord.y / 100);
    if (grid.get(coord) == -1) {
	callback(coord);
	callback = null;
	this.removeEventListener("mouseup", canvasClickedEvent, false);
    }
}

return my;
}());
