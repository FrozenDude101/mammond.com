const CANVAS_WIDTH = 320;   // Unscaled height.
const CANVAS_HEIGHT = 180;  // Unscaled width.
const CANVAS_SCALE = 4;     // Actual pixels per canvas pixel.

const TIME_SCALE = 60 * 60;  // How much faster the time cycle is than real life.

const SUN_MAJOR_AXIS = CANVAS_WIDTH/2 - 20;
const SUN_MINOR_AXIS = CANVAS_HEIGHT/2 - 10;

const DAWN_START =  5 * 60 * 60 * 1000; //  5:00
const DAWN_END =    7 * 60 * 60 * 1000; //  7:00
const DUSK_START = 17 * 60 * 60 * 1000; // 17:00
const DUSK_END =   19 * 60 * 60 * 1000; // 19:00

let animationFrame: number;
let previousTimestamp: number;
function run() {
    animationFrame = window.requestAnimationFrame(tick); // Start the tick loop.
    previousTimestamp = 0;
}

function close() {
    window.cancelAnimationFrame(animationFrame); // Cancel the tick loop.
}

function tick(timestamp: number) {
    try {
        animationFrame = window.requestAnimationFrame(tick);
        const diff = (timestamp - previousTimestamp) / 1000;
        previousTimestamp = timestamp;
        update(diff);
        render();
    } catch (e) {
        close();
        throw e;
    }
}

let gameTime = Date.now(); // In game time.
function update(diff: number) {
    gameTime += diff * 1000 * TIME_SCALE;
}

const canvas = document.getElementsByTagName("canvas")[0]!;
canvas.width = CANVAS_WIDTH * CANVAS_SCALE;
canvas.height = CANVAS_HEIGHT * CANVAS_SCALE;
const ctx = canvas.getContext("2d")!;
ctx.imageSmoothingEnabled = false;              // Remove antialiasing.
ctx.scale(CANVAS_SCALE, CANVAS_SCALE);          // Scale for more pixel-art effect.
ctx.translate(CANVAS_WIDTH/2, CANVAS_HEIGHT/2); // Set origin to center.
function render() {
    ctx.clearRect(-CANVAS_WIDTH/2, -CANVAS_HEIGHT/2, CANVAS_WIDTH, CANVAS_HEIGHT);

    const relativeTime = gameTime % (24 * 60 * 60 * 1000);
    const sunAngle = relativeTime / (24 * 60 * 60 * 1000) * 2*Math.PI + Math.PI/2;

    // Draw the sky.
    const isNight = relativeTime >= DUSK_END || relativeTime <= DAWN_START;
    if (isNight) { // Night
        drawNight();
    } else if (relativeTime >= DAWN_END && relativeTime <= DUSK_START) { // Day
        drawDay();
    } else if (relativeTime >= DAWN_START && relativeTime <= DAWN_END) { // Dawn
        const dayPercent = (relativeTime - DAWN_START) / (DAWN_END - DAWN_START);
        ctx.globalAlpha = dayPercent;
        drawDay();
        ctx.globalAlpha = 1 - dayPercent;
        drawNight();
    } else { // Dusk
        const dayPercent = 1 - (relativeTime - DUSK_START) / (DUSK_END - DUSK_START);
        ctx.globalAlpha = dayPercent;
        drawDay();
        ctx.globalAlpha = 1 - dayPercent;
        drawNight();
    }
    ctx.globalAlpha = 1;

    // Draw the sun.
    ctx.beginPath();
    ctx.arc(SUN_MAJOR_AXIS * Math.cos(sunAngle), SUN_MINOR_AXIS * Math.sin(sunAngle), 10, 0, 2*Math.PI);
    ctx.fillStyle = "yellow";
    ctx.fill();

    // Draw the horizon.
    ctx.beginPath();
    ctx.moveTo(-CANVAS_WIDTH/2, 0);
    ctx.lineTo(CANVAS_WIDTH/2, 0)
    ctx.strokeStyle = "red";
    ctx.stroke();

    // Draw the center of the canvas.
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, 2*Math.PI);
    ctx.fillStyle = isNight ? "white" : "black";
    ctx.fill();

    // Draw the sun's path.
    ctx.beginPath();
    ctx.ellipse(0, 0, SUN_MAJOR_AXIS, SUN_MINOR_AXIS, 0, 0, 2*Math.PI);
    ctx.strokeStyle = isNight ? "white" : "black";
    ctx.stroke();

    // Draw hour numbers around the sun's path.
    for (let i = 0; i < 24; i++) {
        ctx.fillStyle = isNight ? "white" : "black";
        ctx.fillText(i.toString(),
            (SUN_MAJOR_AXIS - 20) * Math.cos(i/24 * 2*Math.PI + Math.PI/2),
            (SUN_MINOR_AXIS - 20) * Math.sin(i/24 * 2*Math.PI + Math.PI/2)
        );
    }

}

function drawDay() {
    ctx.fillStyle = "skyblue";
    ctx.fillRect(-CANVAS_WIDTH/2, -CANVAS_HEIGHT/2, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawNight() {
    ctx.fillStyle = "black";
    ctx.fillRect(-CANVAS_WIDTH/2, -CANVAS_HEIGHT/2, CANVAS_WIDTH, CANVAS_HEIGHT);
}

run();