var app = require('http').createServer();

app.listen( 8080 );

function Device( socket ) {
    var self = this;
    
    this.socket = socket;
    this.idNo = 0;
    this.name = "";
    this.book = {};

    this.socket.on( "receiveAppID", function( id ) {
        self.name = id;
        console.log( "Device " + self.idNo + " identified as " + self.name );

        if( id == "Storybook" ) book.main = self;
        else if( id == "Companion" ) book.companion = self;

        book.startStory();
    });
}

Device.prototype.joinGame = function( book ) {
    this.book = book;
}

function Book() {

    console.log( "Server running" );

    this.io = require('socket.io')(app);
    this.device1 = null;
    this.device2 = null;
    this.main = null;
    this.companion = null;
    this.currentPage = 0;
    this.started = false;
    this.addHandlers();
}

Book.prototype.addHandlers = function() {
    var book = this;

    this.io.sockets.on("connection", function(socket) {
        book.addDevice( new Device( socket ) );
    })
}

Book.prototype.addDevice = function( device ) {
    console.log("Adding device ")
    if (this.device1 === null) {
        this.device1 = device;
        this.device1["book"] = this;
        this.device1["idNo"] = 1
        this.device1.socket.emit("requestAppID")
    } else if (this.device2 === null) {
        this.device2 = device;
        this.device2["book"] = this;
        this.device2["idNo"] = 2
        this.device2.socket.emit("requestAppID");
    }
}

Book.prototype.startStory = function() {
    if(this.main !== null && this.companion !== null) {
        console.log( "Devices connected, starting story" )
        this.main.socket.emit( "startStory", "Let’s go, main app!" );
        this.companion.socket.emit( "startStory", "Hi, hoooo, companion!" );
    }

    else console.log( "Waiting for device connection..." )
}

// Start the game server
var book = new Book();
