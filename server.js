const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const port = process.env.PORT || 3000;

// Serve index.html file
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// Serve client.js file
app.get("/client.js", (req, res) => {
    res.sendFile(__dirname + "/client.js");
});

app.use(express.static("public"));
// Handle socket.io connection
io.on("connection", (socket) => {
    console.log("User connected: " + socket.id);

    // Handle drawing event from client
    socket.on("drawing", (lastX, lastY, x, y, penColor, penWidth, tool) => {
        // Broadcast drawing event to all other clients
        socket.broadcast.emit("drawing", lastX, lastY, x, y, penColor, penWidth, tool);
    });

    // Handle disconnection event
    socket.on("disconnect", () => {
        console.log("User disconnected: " + socket.id);
    });
});

// Start server and listen on port 3000
server.listen(3000, () => {
    console.log("Server started on port 3000");
});
