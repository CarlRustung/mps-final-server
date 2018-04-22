let port = 8080;

var roomCodes = [];

var app = require('http').createServer();
var io = require('socket.io')(app);
app.listen( port );
console.log( "Server running on port " + port );

io.on('connection', function ( socket ) {

	console.log( "Device connected (id: " + socket.id + ")" );

	socket.emit('requestAppRole');

	socket.on('disconnect', function() {
		console.log('Something disconnected.');
	});

	socket.on('connectStoryBook', function () {
		let roomCode = getRoomCode()
		socket.join( roomCode );
		socket.emit('companionConnectionCode', roomCode );
		console.log( 'Storybook connected with code ' + roomCode );
	});

	socket.on( 'declareCompanion', function ( roomCode ) {
		socket.emit('requestCompanionCode');
	});

	// Reader is finished reading
	socket.on( 'talkModeEndTurn', function ( roomCode ) {
		console.log( "Reader reporting end of turn. Sending event to listener." )
		socket.broadcast.to( roomCode ).emit( 'talkModeTurnEnded' );
	});

	// Return to (new turn) listener: info on what line’s next
	socket.on( 'talkModeSetLine', function ( roomCode, lineReference ) {
		console.log( "Listener reporting line reference #" + lineReference )
		console.log( "Sending line reference to reader" )
		socket.broadcast.to( roomCode ).emit( 'talkModeSetLine', lineReference );
	});

	// Listener changes response
	socket.on( 'talkModeListenerResponse', function ( roomCode, responseType ) {
		socket.broadcast.to( roomCode ).emit( 'talkModeSetResponse', responseType );
	});


	socket.on( 'connectCompanion', function ( roomCode ) {
		if( contains.call( roomCodes, roomCode ) ) {
			socket.join( roomCode );
			io.sockets.in( roomCode ).emit( 'dyadConnected' );
		} else {
			socket.emit( 'companionDenied' );
		}
	});
});


function getRoomCode () {
	var code = "";

	do {
		for( var i = 0; i < 4; i++ ){
			code += ( Math.floor( Math.random() * 9 ) ).toString();
		}
		console.log( code );
	} while ( contains.call( roomCodes, code ) );

	roomCodes.push( code );

	return code;
}

function contains ( val ) {
	var findNaN = val !== val;
	var indexOf;

	if(!findNaN && typeof Array.prototype.indexOf === 'function') {
		indexOf = Array.prototype.indexOf;
	} else {
		indexOf = function( val ) {
			var i = -1, index = -1;

			for(i = 0; i < this.length; i++) {
				var item = this[i];

				if((findNaN && item !== item) || item === val) {
					index = i;
					break;
				}
			}

			return index;
		};
	}

	return indexOf.call(this, val) > -1;
};