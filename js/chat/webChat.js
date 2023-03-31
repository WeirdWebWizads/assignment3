var server = new  SillyClient();
if (false){
    var user_name=prompt("Please input your name","xuzhang")
    console.log(user_name)
    var chat_room=prompt("Please input chat room","tiger")
    console.log(chat_room)

}
else {
    user_name = "xuzhang_" + Math.round(Math.random()*1000000000000000).toString() 
    chat_room = "tiger" //"WEB-COMMUNICATIONS"
}
 // input chat room and username

var chat_history = []
var user_id = null
// chart_history and user Id


// server.connect( "wss://ecv-etic.upf.edu/node/9000/ws", chat_room);
// server.connect( "ws://localhost:55000", chat_room);

server.on_ready = function( my_id )
{
    console.log("I am ready!",my_id)
    user_id = my_id
	// store my user_id
    tell_other_people(user_name)
}

// document.querySelector("#user-name").textContent = user_name
// document.querySelector("#chat-room").textContent = chat_room
// document.querySelector(".name").textContent = chat_room
//  set username and chatroom of the UI
server.on_user_connected = function (user_id) {
    // when new user of this chat room come in send the history to him
    var my_message = document.createElement("div")
    my_message.classList.add('notify')
    my_message.innerHTML = "<div class=\"notify\">user"+user_id+"  joined</div>"
    chat_list_box.appendChild(my_message)

    var msg = {
        type: "history",
        usename: user_name,
        content: chat_history
    }
    console.log(msg)
    server.sendMessage(msg,[user_id])
    tell_other_people(global_username)
}

var sendMsg = document.querySelector(".sendMsg")
var myIcon = document.querySelector(".myIcon")
var chat_list_box = document.querySelector(".chat_list_box")
chat_list_box.scrollTop = 100000
sendMsg.addEventListener('keypress', sendMessage)
myIcon.addEventListener("click",sendMessage)

// bond method with  sending button and key Enter event

function sendMessage(event) {
    // sending message to chat room channel
    if ((event.key=='Enter')||(event.type=='click')){
            var message = sendMsg.value
    console.log(message)
        console.log(event)
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
        server.sendMessage(msg)
        chat_history.push(msg)
        // server.getRoomInfo('xuzhang_CHAT', function(room){console.log(room)})
    }
}

server.on_message = function (author_id, str_msg){
    //  when UI recieved new message ,this function will be called , processing text and history message in a different logic
    console.log(author_id,str_msg)
    var str_msg = JSON.parse(str_msg)
    msg_type = str_msg['type']
    other_user_id = str_msg['username']
    msg = str_msg['content']
    if (msg_type=="text") {
        console.log(msg_type, other_user_id, msg)
        var my_message = document.createElement("div")
        my_message.classList.add('message_row')
        my_message.innerHTML = "<div class=\"username\">" + other_user_id + "</div><div class=\"other-message message-text small p-2 ms-3 mb-1 rounded-3\">" + msg + "</div>"
        chat_list_box.appendChild(my_message)
        chat_list_box.scrollTop = 100000
        chat_history.push(str_msg)
    }
    else if (msg_type=="history"){
        console.log(msg)
        for (let idx in msg) {
            message = msg[idx]
            chat_history.push(message)
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
            chat_list_box.appendChild(my_message)
        }
        chat_list_box.scrollTop = 100000
    }
    else if (msg_type == "create_avater"){
        console.log("new avatar come in:")
        console.log(msg)

        create_avater(msg['username'], msg['avatar_name'],msg['position'], msg['scale'], scene)
    }
    else if (msg_type == "move"){
        // console.log("new avatar come in:")
        // console.log(msg)
        username = msg['username']
        key = msg['key']
        dt = msg['dt']
        avatar_name = all_avaters[username]['avatar_name']
        avatar_obj = all_avaters[username]['avatar']
        pivot = all_avaters[username]['pivot']

        update_avater(avatar_name,key, avatar_obj,pivot,dt)
    }

}
