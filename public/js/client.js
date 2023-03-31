

const SOCKET_URL = "ws://localhost:9036"; //TODO get this from config file
//const SOCKET_URL = "wss://ecv-etic.upf.edu/node/9036/ws/"; //TODO get this from config file
const TICK_INTERVAL = 100; // Interval for sending tick status (in milliseconds)

var CLIENT = {
    init: function () {
        this.socket = new WebSocket(SOCKET_URL);
        this.socket.onopen = this.onOpen.bind(this);
        this.socket.onclose = this.onClose.bind(this);
        this.socket.onmessage = this.onMessage.bind(this);
        this.socket.onerror = this.onError.bind(this);
    },

    onOpen: function () {
        console.log("Server-Client (onOpen): A client has connected with the server!");
        this.startSendingTicks(TICK_INTERVAL);
    },

    startSendingTicks: function (interval) {
        this.tickIntervalID = setInterval(this.onTick.bind(this), interval);
    },

    stopSendingTicks: function () {
        if (this.tickIntervalID) {
            clearInterval(this.tickIntervalID);
            this.tickIntervalID = null;
        }
    },

    onTick: function () {
        if (!APP.my_user || !this.socket) { return; }

        var userJson = APP.my_user.toJSON();
        var json = {
            type: "user_state",
            user: userJson,
        };
        var jsonString = JSON.stringify(json);
        this.socket.send(jsonString);
        console.log("sending tick status");
    },

    onMessage: function (msg) {
        console.log("Server-Client (onMessage): A client has received a message: ", msg);

        try {
            var json = JSON.parse(msg.data);
        } catch (error) {
            console.error("Error parsing message:", error);
            return;
        }

        switch (json.type) {
            case "enter":
                this.handleEnter(json);
                break;
            case "join":
                this.handleJoin(json);
                break;
            case "user_state":
                this.handleUserState(json);
                break;
            case "text":
                this.handleText(json);
                break;
            case "left":
                this.handleLeft(json);
                break;
            default:
                console.log("Unhandled message type:", json.type);
        }
    },

    handleEnter: function (json) {
        
        var userJson = json.user;
        APP.my_user = new User(userJson);
        var roomJson = json.room;
        var room = WORLD.getRoom(roomJson.name) || WORLD.createRoom(roomJson.name, roomJson);
        WORLD.addUser(APP.my_user, room);
        APP.current_room = room;
    },

    handleJoin: function (json) {
        var userJson = json.user;
        var user = new User(userJson);
        var currentRoom = APP.current_room;
        WORLD.addUser(user, currentRoom);
    },

    handleUserState: function (json) {
        var userJson = json.user;
        var user = WORLD.getUser(userJson.id);

        if (!user) {
            user = new User(userJson);
            WORLD.addUser(user, APP.current_room);
        } else {
            user.fromJSON(userJson);
        }
    },

    handleText: function (json) {
        var userJson = json.user;
        var user = WORLD.getUser(userJson.id);

        // Display message on chat ...
    },

    handleLeft: function (json) {
        var user = WORLD.getUser(json.user_id);
        if (user) {
            WORLD.removeUser(user);
        }
    },

    onError: function (error) {
        console.error("Server-Client (onError): An error occurred:", error);
    },

    onClose: function () {
        console.log("Server-Client (onClose): A client has disconnected with the server!");
        this.stopSendingTicks(); // Stop sending ticks when the connection is closed
    }
};
