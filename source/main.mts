const CANVAS_SCALE = 4;                   // Actual pixels per canvas pixel.
const CANVAS_WIDTH = 1280 / CANVAS_SCALE; // Unscaled height.
const CANVAS_HEIGHT = 720 / CANVAS_SCALE; // Unscaled width.

const TIME_SCALE = 60 * 60;  // How much faster the time cycle is than real life.

const SUN_MAJOR_AXIS = CANVAS_WIDTH/2 - 20;
const SUN_MINOR_AXIS = CANVAS_HEIGHT/2 - 10;

const DAWN_START =  4 * 60 * 60 * 1000; //  5:00
const DAWN_END =    8 * 60 * 60 * 1000; //  7:00
const DUSK_START = 16 * 60 * 60 * 1000; // 17:00
const DUSK_END =   20 * 60 * 60 * 1000; // 19:00

const GLOW_DISTANCE = 25;

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
    const sunPosition: [number, number] = [SUN_MAJOR_AXIS * Math.cos(sunAngle), SUN_MINOR_AXIS * Math.sin(sunAngle)];

    // Draw the sky.
    let dayPercent: number;
    if (relativeTime >= DUSK_END || relativeTime <= DAWN_START) { // Night
        dayPercent = 0;
        drawNight();
    } else if (relativeTime >= DAWN_END && relativeTime <= DUSK_START) { // Day
        dayPercent = 1;
        drawDay();
    } else if (relativeTime >= DAWN_START && relativeTime <= DAWN_END) { // Dawn
        dayPercent = (relativeTime - DAWN_START) / (DAWN_END - DAWN_START);
        ctx.globalAlpha = dayPercent;
        drawDay();
        ctx.globalAlpha = 1 - dayPercent;
        drawNight();
        ctx.globalAlpha = Math.sin(dayPercent * Math.PI);
        drawGlow(sunPosition);
    } else { // Dusk
        dayPercent = 1 - (relativeTime - DUSK_START) / (DUSK_END - DUSK_START);
        ctx.globalAlpha = dayPercent;
        drawDay();
        ctx.globalAlpha = 1 - dayPercent;
        drawNight();
        ctx.globalAlpha = Math.sin(dayPercent * Math.PI);
        drawGlow(sunPosition);
    }
    ctx.globalAlpha = 1;

    // Draw the sun.
    ctx.beginPath();
    ctx.arc(sunPosition[0], sunPosition[1], 10, 0, 2*Math.PI);
    ctx.fillStyle = "yellow";
    ctx.fill();

    // Draw the ground.
    ctx.fillStyle    = "darkgreen";
    ctx.fillRect(-CANVAS_WIDTH/2, 0, CANVAS_WIDTH, CANVAS_HEIGHT/2);

    // Draw the horizon.
    ctx.beginPath();
    ctx.moveTo(-CANVAS_WIDTH/2, 0);
    ctx.lineTo(CANVAS_WIDTH/2, 0)
    ctx.strokeStyle = "red";
    ctx.stroke();

    // Draw the center of the canvas.
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, 2*Math.PI);
    ctx.fillStyle = dayPercent < 0.5 ? "white" : "black";
    ctx.fill();

    // Draw the sun's path.
    ctx.beginPath();
    ctx.ellipse(0, 0, SUN_MAJOR_AXIS, SUN_MINOR_AXIS, 0, 0, 2*Math.PI);
    ctx.strokeStyle = dayPercent < 0.5 ? "white" : "black";
    ctx.stroke();

    // Draw hour numbers around the sun's path.
    for (let i = 0; i < 24; i++) {
        ctx.fillStyle = dayPercent < 0.5 ? "white" : "black";
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

const stars: [number, number][] = [];
for (let i = 0; i < 100; i++) {
    stars.push([Math.random() * CANVAS_WIDTH - CANVAS_WIDTH/2, Math.random() * CANVAS_HEIGHT - CANVAS_HEIGHT/2])
}

function drawNight() {
    ctx.fillStyle = "black";
    ctx.fillRect(-CANVAS_WIDTH/2, -CANVAS_HEIGHT/2, CANVAS_WIDTH, CANVAS_HEIGHT);

    const alpha = ctx.globalAlpha;
    for (let starPosition of stars) {
        const twinkle = Math.random() ** (1/5);
        ctx.globalAlpha = alpha*twinkle;
        ctx.fillStyle = "white";
        ctx.fillRect(starPosition[0], starPosition[1], 1, 1);
    }
}

function drawGlow(sunPosition: [number, number]) {
    const alpha = ctx.globalAlpha;
    ctx.fillStyle = "#FF8800";
    for (let x = -CANVAS_WIDTH/2; x <= CANVAS_WIDTH/2; x++) {
        for (let y = -CANVAS_HEIGHT/2; y <= CANVAS_HEIGHT/2; y++) {
            const xDiff = x-sunPosition[0];
            const yDiff = y-sunPosition[1];
            const dist = Math.sqrt(xDiff**2 + yDiff**2);

            const distMult = (-(dist-GLOW_DISTANCE) * (dist+GLOW_DISTANCE) / ( GLOW_DISTANCE ** 2)) ** 0.5;
            ctx.globalAlpha = alpha * (isNaN(distMult) ? 0 : distMult);

            ctx.fillRect(x, y, 1, 1);
        }
    }
}

run();