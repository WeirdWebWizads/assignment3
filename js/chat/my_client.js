function MyClient() {
	// body...
	this.user_id = 0;
	this.url = null
	this.socket = null
	this.on_connect = null
	this.on_close = null
	this.on_message = null

}
console.log("dsksdkkdkdskk")

//hello
MyClient.prototype.connect = function(url, room_name, on_connect, on_message, on_close) {
	// body...
	var that = this;
	var params = "";
	var protocol = "";
	// if( url.substr(0,3) != "ws:" && url.substr(0,4) != "wss:" )
	// {
	// 	protocol = location.protocol == "http:" ? "ws://" : "wss://"; //default protocol
	// }
	// var final_url = this._final_url = protocol + url + "/" + room_name + params;

	var final_url =  url + "/" + room_name;

	console.log("try to connect:  "+ final_url)
	this.socket = new WebSocket(final_url);
	this.socket.onopen = function () {
		if(this.on_connect){
			this.on_connect()
		}

		// body...
	}

	this.socket.onclose = function () {
		// body...
		if(this.on_close){
			this.on_close()
		}

	}
	this.socket.onmessage = function (msg) {
		var tokens = msg.data.split("|"); //author id | cmd | data
		author_id = tokens[0]
		cmd = tokens[1]
		data = tokens[2]

		
		if ((cmd==undefined)||(data==undefined)){
		// process as the jordi's data format
		author_id = ''
		that.on_message(author_id, msg.data);
		}
		
		else if (cmd == "ID") //retrieve your user id
	{
		that.user_id = author_id;
		that.user_name = "user_" + author_id.toString();
		if (that.on_ready)
		{
			that.on_ready(author_id);
		}
	}
	else if (cmd == "LOGIN") //new user entering
	{
		console.log(cmd)
		that.on_user_connected( author_id, data );
	}
	else if (cmd == "MSG" || cmd == "DATA"){
				console.log(cmd);
		that.on_message(author_id, data);
	}

	
}
	that.socket.onerror = function (err) {
		// body...
		that.on_error(err)
	}

}

MyClient.prototype.sendMessage = function(msg){
	console.log(msg)
	msg = JSON.stringify(msg);
	console.log("send message:   "+msg)
	this.socket.send(msg)
}



// server.on_user_connected = function (user_id) {


// server.on_message = function (author_id, str_msg){
