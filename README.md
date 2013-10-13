JS-TicTacToe
============

Full JavaScript project implementing the Multiplayer game TicTacToe with a Node.js server.

This project was created only for fun and practice on JavaScript, it includes an Node.js HTTP server including a Dispatcher and a Matchmaker. It also includes a JavaScript web interface.

The TicTacToe is currently played using AJAX and on a table html element.


Live demo
---------
The game can be played at http://3dnovac.eu:8080/

Put your pseudo and click on "Request Match".


Starting the server
-------------------

With node.js:
    nodejs server.js

As a Daemon:
    forever start server.js


Planned improvements
--------------------

- Adding communication method via socket.io
- Adding a Bot to play in single player
- Adding session management
- Adding new interfaces: (The user will be able to select which interface to use)
    - Using Canvas
    - Using WebGL
