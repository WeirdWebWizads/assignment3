var ChatClient = {

    init: function(socket) {
        this.socket = socket
        this.chat_list_box = document.querySelector(".chat_list_box")
        this.chat_history = [] 
        this.user_name = 'user_nameXX'
    },

    on_user_connected : function(user_id) {
    // when new user of this chat room come in send the history to him
    var my_message = document.createElement("div")
    my_message.classList.add('notify')
    my_message.innerHTML = "<div class=\"notify\">user"+user_id+"  joined</div>"
    chat_list_box.appendChild(my_message)

    var msg = {
        type: "history",
        usename: this.user_name,
        content: this.chat_history
    }
    msg = JSON.stringify(msg);
    console.log("send message:   "+msg)
    this.socket.send(msg)
    },


    on_message : function (author_id, str_msg){
    //  when UI recieved new message ,this function will be called , processing text and history message in a different logic
    console.log(author_id, str_msg)
    var str_msg = JSON.parse(str_msg)
    msg_type = str_msg['type']
    other_user_id = str_msg['username']
    msg = str_msg['content']
    if (msg_type=="text") {
        console.log(msg_type, other_user_id, msg)
        var my_message = document.createElement("div")
        my_message.classList.add('message_row')
        my_message.innerHTML = "<div class=\"username\">" + other_user_id + "</div><div class=\"other-message message-text small p-2 ms-3 mb-1 rounded-3\">" + msg + "</div>"
        this.chat_list_box.appendChild(my_message)
        this.chat_list_box.scrollTop = 100000
        this.chat_history.push(str_msg)
    }
    else if (msg_type=="history"){
        console.log(msg)
        for (let idx in msg) {
            message = msg[idx]
            this.chat_history.push(message)
            console.log(message)
            type = message['type']
            username = message['username']
            text = message['content']
            var my_message = document.createElement("div")
            my_message.classList.add('message_row')
            if (username == user_name){
                my_message.innerHTML = "<div class=\"you-message message-text small p-2 me-3 mb-1 text-white rounded-3 bg-primary\">"+text+"</div>"
            }
            else{
                my_message.innerHTML = "<div class=\"username\">" + username + "</div><div class=\"other-message message-text small p-2 ms-3 mb-1 rounded-3\">" + text + "</div>"
            }
            this.chat_list_box.appendChild(my_message)
        }
        this.chat_list_box.scrollTop = 100000
    }
},
    sendMessage: function (message) {
    // sending message to chat room channel
    if ((event.key=='Enter')||(event.type=='click')){
            var message = sendMsg.value
      var my_message = document.createElement("div")
      my_message.classList.add('message_row')
      my_message.innerHTML = "<div class=\"you-message message-text small p-2 me-3 mb-1 text-white rounded-3 bg-primary\">"+message+"</div>"
      chat_list_box.appendChild(my_message)
        chat_list_box.scrollTop = 100000
        document.querySelector(".sendMsg").value = ''
        var msg = {
                type:'text',
            username: user_name,
            content: message
        }

        msg = JSON.stringify(msg);
        console.log("send message:   "+msg)
        this.socket.send(msg)
        this.chat_history.push(msg)
    }
}

}

var SERVER = {
    init: function()
    {
        // this.socket = new WebSocket("wss://ecv-etic.upf.edu/node/9004/ws/");
        this.socket = new WebSocket("ws://localhost:9004");
        this.socket.onopen = this.onOpen.bind(this);
        this.socket.onclose = this.onClose.bind(this);
        this.socket.onmessage = this.onMessage.bind(this);

        this.chat_client = ChatClient
        this.chat_client.init(this.socket)

    },

    onOpen: function()
    {
        console.log("connected!");
    },

    onTick: function()
    {
        if(!APP.my_user || !this.socket )
            return;

        var user_json = APP.my_user.toJSON();
        var json = {
            type: "user_state",
            user: user_json
        };
        var msg = JSON.stringify(json);
        this.socket.send( msg );
    },

    chat_message : function (author_id, cmd, data) {
        
        if (cmd == "ID") //retrieve your user id
    {
        this.chat_client.user_id = author_id;
        this.chat_client.user_name = "user_" + author_id.toString();
        if (this.chat_client.on_ready)
        {
            this.chat_client.on_ready(author_id);
        }
    }
    else if (cmd == "LOGIN") //new user entering
    {
        console.log(cmd)
        this.chat_client.on_user_connected( author_id, data );
    }
    else if (cmd == "MSG" || cmd == "DATA"){
                console.log(cmd);
        this.chat_client.on_message(author_id, data);
    }
},

    game_message: function(msg)
    {
        //console.log("msg!",msg);
        var json = JSON.parse(msg);

        if( json.type == "enter")
        {
            var user_json = json.user;
            APP.my_user = new User(user_json);
            var room_json = json.room;
            var room = WORLD.createRoom( room_json.name, room_json );
            WORLD.addUser( APP.my_user, room );
            APP.current_room = room;
        }
        if( json.type == "join")
        {
            var user_json = json.user;
            var user = new User(user_json);
            var current_room = APP.current_room;
            WORLD.addUser( user, current_room );
        }

        if( json.type == "user_state")
        {
            var user_json = json.user;
            var user = WORLD.getUser( user_json.id );
            if( !user )
            {
                user = new User( user_json );
                WORLD.addUser( user, APP.current_room );
            }
            else
                user.fromJSON( user_json );
        }

        if( json.type == "left")
        {
            var user = WORLD.getUser( json.user_id );
            if(user)
                WORLD.removeUser( user );
        }
    },

    onMessage: function(msg){
        var tokens = msg.data.split("|"); //author id | cmd | data
        author_id = tokens[0]
        cmd = tokens[1]
        data = tokens[2]
        console.log(data)
        if ((cmd==undefined)||(data==undefined)){
        author_id = ''

        this.game_message(msg.data);
        }
        else {
            this.chat_message(data)
        }

    },

    onClose: function()
    {
        console.log("disconnected!");
    }

};