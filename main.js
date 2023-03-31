// Built-in modules
const path = require('path');
const http = require('http');

// Third-party modules
const express = require("express");
const session = require('express-session');
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const mysql = require('mysql');
const WebSocketServer = require('websocket').server;
const MemoryStore = require('memorystore')(session);

// Local modules
const setupHandlers = require('./handler.js');
const FUNNYSERVER = require('./funnyServer.js');
const db = require('./db.js');

// Configuration
const port = 9036;

// Create an Express app
const app = express();

// Configure session middleware
const sessionMiddleware = session({
    secret: '7s33kgb569zqsFwfYOq12xthrrtBP8oV',
    resave: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // one day cookie
    saveUninitialized: true,
    store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
    })
});

// Apply middleware to the app
app.use(sessionMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Set up route handlers
setupHandlers(app);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Initialize a simple HTTP server
const server = http.createServer(app);

// Initialize the WebSocket server instance
const wss = new WebSocketServer({ httpServer: server });

wss.on('request', function (request) {
    var user_session = null;
    sessionMiddleware(request.httpRequest, {}, function () {
        user_session = request.httpRequest.session;
        var connection = request.accept(null, request.origin);
        connection.session = user_session;

        FUNNYSERVER.onUserConnected(connection);

        connection.on('message', function (message) {
            if (message.type == 'utf8') {
                FUNNYSERVER.onUserMessage(message.utf8Data, connection);
            }
        });

        connection.on('close', function () {
            FUNNYSERVER.onUserDisconnected(connection);
        });
    });
});

// Initialize FUNNYSERVER
FUNNYSERVER.init();

// Default route
app.get("*", (req, res) => {
res.redirect('/')
});

// Start the server
server.listen(port, function () {
console.log("main: (" + process.pid + ") Server listening on port" + port);
FUNNYSERVER.onReady();
});