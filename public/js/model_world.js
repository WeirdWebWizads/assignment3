

// USER 
function User(data) {
    this.id = -1;
    this.name = "unnamed";
    this.position = [0, 0, 0];
    this.anim = "data/girl/idle.skanim";
    this.avatar = 'public/data/girl/';
    this.room = 'apartment'


    if (data)
        this.fromJSON(data);
}
User.prototype.fromJSON = function (json) {
    for (var i in json)
        this[i] = json[i];
}

User.prototype.toJSON = function () {
    return {
        id: this.id,
        name: this.name,
        position: this.position,
        animation: this.animation,
        avatar: this.avatar,
        room: this.room
    }
}

// ROOM
function Room(name) {
    this.id = -1;
    this.name = name;
    this.url = null;
    this.people = [];
}

Room.prototype.addUser = function(user) {
    return new Promise((resolve, reject) => {
        this.people.push(user); // Just push the user into the people array
        user.room = this;

        // Call resolve() when the user is added successfully
        resolve();
    });
}

Room.prototype.toJSON = function () {
    return {
        id: this.id,
        name: this.name,
        url: this.url.concat()
    };
}

Room.prototype.fromJSON = function (json) {
    for (var i in json)
        this[i] = json[i];
}

// WORLD
var WORLD = {

    default_room: null,

    rooms: {},
    users: [],
    users_by_id: {},

    createRoom: function (name, data) {
        var room = new Room(name);
        room.id = this.last_id++;
        this.rooms[name] = room;

        if (data) {
            room.fromJSON(data);
        }

        return room;
    },

    getRoom: function (name) { return this.rooms[name]; },

    addUser: async function (user, room) {
        this.users.push(user);
        this.users_by_id[user.name] = user;
        this.users_by_id[user.id] = user;

        if (room) {
            console.log("Room: ", room);

            // Assuming room.addUser returns a Promise
            await room.addUser(user);

            this.rooms[room.name] = room;
            console.log("Rooms: ", this.rooms);
        }
    },
    


    removeUser: function (user) {
        var room = this.getRoom(user.room);
        if (room)
            room.removeUser(user);
        var index = this.users.indexOf(user);
        if (index != -1)
            this.users.splice(index, 1);
        delete this.users_by_id[user.id];
        delete this.users_by_id[user.name];
    },

    getUser: function (name) {
        return this.users_by_id[name];
    },

    fromJSON: function (json) {
        for (var i in json.rooms) {
            this.createRoom(i, json.rooms[i]);
        }
        this.last_id = json.last_id;
        this.default_room = json.default_room;
    },

    toJSON: function () {
        var o = {
            last_id: this.last_id,
            rooms: []
        };
        for (var i in this.rooms)
            o.rooms.push(this.rooms[i].toJSON());
        return o;
    }
};

if (typeof (window) == "undefined") {
    module.exports = {
        WORLD, Room, User
    };
}