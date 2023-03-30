
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let penColor = "#000000";
let penWidth = 5;
let tool = "pen";

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
// Get a PeerJS object
// const peer = new Peer();
const peer = new Peer(''+Math.floor(Math.random()*2**18).toString(36).padStart(4,0), {
    host: location.hostname,
    debug: 1,
    path: '/myapp'
});

window.peer = peer;
// Call a peer with specified ID
function callPeer(peerId) {
    // Get a MediaStream object to send
    navigator.mediaDevices.getUserMedia({audio: true, video: false})
        .then((stream) => {
            // Make a call to the peer with specified ID
            const call = peer.call(peerId, stream);

            // Answer the call and play the received audio stream
            call.answer(stream);
            const audio = new Audio();
            audio.srcObject = call.peerConnection.remoteStream;
            audio.play();
        })
        .catch((error) => {
            console.error(error);
        });
}
// Handle a click event on the Call button
document.getElementById("call-button").addEventListener("click", () => {
    const peerId = document.getElementById("peer-id").value;
    callPeer(peerId);
});