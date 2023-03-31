

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
        this.socket.sendMessage = this.sendMessage.bind(this);
        this.socket.startSendingTicks = this.startSendingTicks.bind(this);
        this.socket.stopSendingTicks = this.stopSendingTicks.bind(this);
        this.socket.onTick = this.onTick.bind(this);
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

    sendMessage: function (msg, target_ids) {
        if (msg === null)
            return;

        if (msg.constructor === Object)
            msg = JSON.stringify(msg);

        if(!CLIENT.socket || this.socket.readyState !== WebSocket.OPEN)
        {
            //console.error("Not connected, cannot send info");
            return;
        }

        //pack target info
        if (target_ids) {
            var target_str = "@" + (target_ids.constructor === Array ? target_ids.join(",") : target_ids) + "|";
            if (msg.constructor === String)
                msg = target_str + msg;
            else
                throw ("targeted not supported in binary messages");
        }
        try{
            console.log(msg)
            this.socket.send(msg);
        } catch(error){
            console.error(msg.type)
            console.error(msg)
            console.error(error);
        }

        
        this.info_transmitted += 1;
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
            case "create_avater":
                this.handleCreateAvatar(json);
                break;
            case "move":
                this.handleMove(json);
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

    handleCreateAvatar: function (json) {
        console.log("new avatar come in:")
        console.log(msg)

        create_avater(msg['username'], msg['avatar_name'], msg['position'], msg['scale'], scene)
    },

    handleMove: function (json) {
        console.log("Avatar moving")
        // console.log(msg)
        username = msg['username']
        key = msg['key']
        dt = msg['dt']
        avatar_name = all_avaters[username]['avatar_name']
        avatar_obj = all_avaters[username]['avatar']
        pivot = all_avaters[username]['pivot']

        update_avater(avatar_name, key, avatar_obj, pivot, dt)
    },

    onError: function (error) {
        console.error("Server-Client (onError): An error occurred:", error);
    },

    onClose: function () {
        console.log("Server-Client (onClose): A client has disconnected with the server!");
        this.stopSendingTicks(); // Stop sending ticks when the connection is closed
    }
};
