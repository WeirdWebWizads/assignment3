const ModelWorld = require('./public/js/model_world.js');
const WORLD = ModelWorld.WORLD;
const fs = require('fs');
const db = require('./db.js');

const FUNNYSERVER = {
    clients: [],
    last_id: 0, // Set this from the database when the server starts

    init: async function () {
        // Load world data from a JSON file when the server starts
        const data = fs.readFileSync('./public/data/world.json');
        WORLD.fromJSON(JSON.parse(data));

        console.log("FunnyServer (init): Number of rooms in our World: ", Object.keys(WORLD.rooms).length);

        // Set the last_id from the database
        // TODO: Implement getLastIdFromDB function
        // this.last_id = await this.getLastIdFromDB();
    },

    onReady: function () {
        console.log('FunnyServer (onReady): FunnyServer is up and running!');
        this.interval = setInterval(() => FUNNYSERVER.onTick(), 1000 / 10);
    },

    onUserMessage: function (msg, connection) {
        console.log("FunnyServer (onUserMessage): FunnyServer received a message from user: " + msg);
        const user = connection.user;
        const json = JSON.parse(msg);

        switch (json.type) {
            case "action":
                // Handle user actions
                // TODO: Implement action handling
                break;

            case "user_state":
                // Update the user's state
                const room = WORLD.getRoom(user.room.name);
                if (room) {
                    this.sendToRoomUsers(room, msg, user);
                }

                if (json.user && WORLD.getUser(user.id)) {
                    const worldUser = WORLD.getUser(user.id);
                    worldUser.position = json.user.position;
                    worldUser.facing = json.user.facing;
                    worldUser.animation = json.user.animation;
                    worldUser.room = json.user.room;
                    worldUser.target = json.user.target;
                }
                break;

            case "text":
                // Send text messages to other users in the same room
                const textRoom = WORLD.getRoom(user.room);
                if (textRoom) {
                    this.sendToRoomUsers(textRoom, msg, user);
                }
                break;

            default:
                console.log("FunnyServer (onUserMessage): Unknown message type: ", json.type);
        }
    },

    onTick: function () {
        // TODO: Implement periodic updates to clients
    },

    sendToRoomUsers: function (room, msg, skip_user) {
        room.people.forEach(user_id => {
            console.log(user_id)
            const user = WORLD.getUser(user_id);
            console.log(user)
            if (!user || user === skip_user) {
                return;
            }
            user._connection.sendUTF(msg);
            console.log("sending msg ", msg)
        });
    },

    onUserConnected: async function (connection) {
        const user_id_con = connection.session.user_id;
        const user_name_con = connection.session.username;

        try {
            const rows = await this.getUserDataDB(user_name_con);
            connection.session.user_data = rows[0].data;
            connection.session.avatar = rows[0].avatar || WORLD.default_avatar;

            const user_data_json_con = JSON.parse(connection.session.user_data);
            const user = new ModelWorld.User();
            let room = WORLD.getRoom(WORLD.default_room);

            if (connection.session.user_data === '{}') {
                // New user
                user.id = user_id_con;
                user.name = user_name_con;
                user.avatar = connection.session.avatar;
            } else {
                // Existing user from the database
                user.fromJSON(user_data_json_con);
                const room_con = user_data_json_con.room;
                room = WORLD.getRoom(room_con.name);
            }

            connection.user = user;
            user._connection = connection;

            FUNNYSERVER.clients.push(connection);
            WORLD.addUser(user, room);

            console.log("FunnyServer (onUserConnected): A user has been connected. Current users: " + WORLD.users.length);

            const room_json = room.toJSON();
            const user_json = user.toJSON();

            const enterJson = {
                type: "enter",
                user: user_json,
                room: room_json
            };

            user._connection.sendUTF(JSON.stringify(enterJson));

            const joinJson = {
                type: "join",
                user: user_json
            };

            const joinMsg = JSON.stringify(joinJson);
            FUNNYSERVER.sendToRoomUsers(room, joinMsg, user);

        } catch (err) {
            console.error("FunnyServer (onUserConnected): Error fetching user data from the database:", err);
        }
    },

    onUserDisconnected: async function (connection) {
        const user_id = connection.user.id;
        const user_world = WORLD.getUser(user_id);

        const leftJson = {
            type: "left",
            user_id: connection.user.id,
            room: connection.user.room,
        };

        const leftMsg = JSON.stringify(leftJson);
        const room = WORLD.getRoom(leftJson.room);

        if (room) {
            this.sendToRoomUsers(room, leftMsg, connection.user);
        }

        WORLD.removeUser(connection.user);
        console.log("FunnyServer (onUserDisconnected): A user has been disconnected. Current users: " + WORLD.users.length);

        const index = this.clients.indexOf(connection);
        this.clients.splice(index, 1);

        if (user_world) {
            const user_world_json = JSON.stringify(user_world.toJSON());

            const sql = 'UPDATE www_accounts SET data = ? WHERE id = ?;';

            try {
                await db.query(sql, [user_world_json, user_id]);
            } catch (error) {
                console.error("FunnyServer (onUserDisconnected): Error updating user data in the database:", error);
            }
        }
    },

    getUserDataDB: function (username) {
        return new Promise((resolve, reject) => {
            const query_str = "SELECT * FROM www_accounts WHERE username = ?";
            const query_var = [username];

            db.query(query_str, query_var, (err, rows, fields) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
        });
    },

    // TODO: Implement getLastIdFromDB function to set the last_id when the server starts
    // getLastIdFromDB: async function () {
    //     ...
    // }
}

module.exports = FUNNYSERVER;
