// Canvas setup
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// State variables
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let undoStack = [];
let redoStack = [];
let currentStroke = [];

// Configuration
let currentColor = '#000000';
let brushSize = 5;

// Elements references
const colorPicker = document.getElementById('colorPicker');
const brushSlider = document.getElementById('brushSlider');
const brushSizeDisplay = document.getElementById('brushSize');
const clearBtn = document.getElementById('clearBtn');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Initialize canvas
function initCanvas() {
    const maxWidth = Math.min(1200, window.innerWidth - 20);
    canvas.width = maxWidth;
    canvas.height = Math.min(520, window.innerHeight - 100);
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    // Save initial state
    saveState();
}

// State management using ImageData
function saveState() {
    // Limit undo stack size (100 states max)
    if (undoStack.length >= 100) undoStack.shift();
    
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    redoStack = [];
}

function undo() {
    if (undoStack.length < 2) return;
    redoStack.push(undoStack.pop());
    restoreState(undoStack[undoStack.length - 1]);
}

function redo() {
    if (redoStack.length === 0) return;
    const state = redoStack.pop();
    undoStack.push(state);
    restoreState(state);
}

function restoreState(state) {
    ctx.putImageData(state, 0, 0);
}

// Drawing functions with path tracking
function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = getEventPosition(e);
    currentStroke = [];
    saveState();
    ctx.beginPath();
}

function draw(e) {
    if (!isDrawing) return;
    
    const [x, y] = getEventPosition(e);
    currentStroke.push({ x, y });
    
    // Draw directly to canvas
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Store intermediate points for smooth rendering
    if (currentStroke.length % 5 === 0) {
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
    
    lastX = x;
    lastY = y;
}

function stopDrawing() {
    if (!isDrawing) return;
    isDrawing = false;
    
    // Finalize the stroke
    if (currentStroke.length > 0) {
        ctx.beginPath();
    }
}

// Helper functions
function getEventPosition(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return [
        clientX - rect.left,
        clientY - rect.top
    ];
}

// Event listeners (same as before)
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', stopDrawing);

colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
    ctx.strokeStyle = currentColor;
});

brushSlider.addEventListener('input', (e) => {
    brushSize = e.target.value;
    brushSizeDisplay.textContent = brushSize;
    ctx.lineWidth = brushSize;
});

clearBtn.addEventListener('click', () => {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    undoStack = [];
    redoStack = [];
    saveState();
});

undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);

downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvas.toDataURL();
    link.click();
});

window.addEventListener('resize', initCanvas);

// Initialize the application
initCanvas();