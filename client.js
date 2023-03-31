
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let penColor = "#000000";
let penWidth = 5;
let tool = "pen";
var my_stream = null;
// Listen for click events on the canvas
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mousemove", draw);

// Listen for tool selection
const penButton = document.getElementById("pen");
const eraserButton = document.getElementById("eraser");
penButton.addEventListener("click", selectPen);
eraserButton.addEventListener("click", selectEraser);

// Listen for color selection
const colorPicker = document.getElementById("color-picker-input");
colorPicker.addEventListener("input", selectColor);

// Listen for pen width selection
const penWidthSlider = document.getElementById("pen-width-slider");
const penWidthLabel = document.getElementById("pen-width-label");
penWidthSlider.addEventListener("input", selectPenWidth);

// Listener for button
const showDrawingContainerButton = document.getElementById("show-drawing-container");
const drawingContainer = document.getElementById("drawing-container");

showDrawingContainerButton.addEventListener("click", function() {
    drawingContainer.classList.toggle("d-none"); // Remove the "d-none" class to show the container
});

// Set up socket.io connection to server
const socket = io.connect();

// Handle drawing event from another user
socket.on("drawing", (lastX, lastY, x, y, penColor, penWidth, tool) => {
    // Draw line segment from received coordinates
    console.log("recieve and draw")
    context.beginPath();
    context.moveTo(lastX, lastY);
    context.lineTo(x, y);
    context.strokeStyle = tool === "eraser" ? "#FFFFFF" : penColor;
    context.lineWidth = penWidth;
    context.lineCap = "round";
    context.lineJoin = "round"; // set lineJoin to round for smoother lines
    context.stroke();
});

// Select pen tool
function selectPen() {
    tool = "pen";
    penWidth = 5;
    canvas.style.cursor = "default";
}

// Select eraser tool
function selectEraser() {
    tool = "eraser";
    penWidth = 20;
    console.log('setup cursor')
    canvas.style.cursor = "url('https://img.icons8.com/fluency-systems-filled/24/eraser.png'), auto";;
}

// Select drawing color
function selectColor() {
    penColor = colorPicker.value;
}
// Select pen width
function selectPenWidth() {
    // penWidthOutput.innerHTML = penWidthSlider.value;
    if (tool === "pen") {
        penWidth = penWidthSlider.value;
    }
}

// Start drawing
function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

// Stop drawing
function stopDrawing() {
    isDrawing = false;
}

// Draw a line
function draw(e) {
    if (!isDrawing) return;
    const [x, y] = [e.offsetX, e.offsetY];

    // Draw the line
    context.beginPath();
    context.moveTo(lastX, lastY);
    context.lineTo(x, y);
    context.strokeStyle = tool === "eraser" ? "#FFFFFF" : penColor;
    context.lineWidth = penWidth;
    context.lineCap = "round";
    context.lineJoin = "round"; // set lineJoin to round for smoother lines
    context.stroke();

    // Emit the drawing event to the server
    socket.emit("drawing", lastX, lastY, x, y, penColor, penWidth, tool);

    [lastX, lastY] = [x, y];
}



// Set up peer
// Get references to HTML elements
const callButton = document.getElementById("callButton");
const chatIdInput = document.getElementById("chatId");
const localAudio = document.getElementById("localAudio");
const remoteAudio = document.getElementById("remoteAudio");

// Create Peer object
const peer = new Peer(undefined, {
    host: "/",
    port: "443",
    path: "/myapp",
});

// Listen for when Peer object successfully connects to PeerJS server
peer.on("open", function(id) {
    console.log('My peer ID is: ' + id);
});

// Handle incoming media connection

// Start media call function
function startMediaCall(chatId) {
    console.log('start media call')
    // Get local media stream
    navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
            console.log("Local stream ready");
            localAudio.srcObject = stream;
            my_stream = stream;
            // Initiate call to remote peer and add local stream to call
            const call = peer.call(chatId, my_stream );
            call.on("stream", (remoteStream) => {
                console.log("Received remote stream");
                remoteAudio.srcObject = remoteStream;
            });
        })
        .catch((error) => {
            console.log("Error accessing media devices", error);
        });
}

// Listen for call button click event and start media call
callButton.addEventListener("click", (event) => {
    const chatId = chatIdInput.value;
    console.log('click');
    startMediaCall(chatId);
});

// Select the call accept button
const callAcceptBtn = document.getElementById("call-accept-btn");

// Listen for clicks on the call accept button
callAcceptBtn.addEventListener("click", () => {
    // Answer the call and set the remote video stream as the source for the remote video element
    const answerCall = peer.call(chatId, my_stream);
    answerCall.on("stream", (remoteStream) => {
        console.log("Answer");
        remoteAudio.srcObject = remoteStream;
    });
});





//to fetch id


//connect to remote user
// function connectToID(is_call)
// {
//     var id = document.querySelector("input").value;
//     var conn = null;
//     if(is_call)
//         conn = peer.call( id, my_stream );
//     else
//         conn = peer.connect( id, my_stream );
//
//     conn.on('open', function() {
//         // Receive messages
//         conn.on('data', function(data) {
//             console.log('Received', data);
//             showMessage( data );
//         });
//
//         // Send messages
//         conn.send('Hello!');
//     });
//
//     // if he answer my call, get his stream and show it
//     conn.on('stream', function(remoteStream) {
//         var video = document.querySelector("video#him");
//         video.srcObject = remoteStream;
//     });
// }

//to receive incomming connections
peer.on('connection', function(conn) {
    console.log("somebody connects to me!",conn);

    conn.on('data', function(data) {
        console.log('Received', data);

    });
});

//incomming calls

peer.on("call", (call) => {
    console.log("Incoming call");

    // Answer incoming call and add remote stream to remote audio element
    call.answer(my_stream);
    console.log('on peer')
    call.on("stream", (remoteStream) => {
        console.log("Received remote stream");
        remoteAudio.srcObject = remoteStream;
    });
});

