/* ============================================================
   FIL:      particles.js
   TILHØRER: index.html (forsiden)
   BRUKES:   kun på forsiden — ikke på prosjektsider

   Hva den gjør:
   - Tegner partikkelanimasjonen (de flygende firkantene)
   - Håndterer scroll-hastighet og organisk flow field

   Concepts:
   - Canvas: an HTML element we can draw on pixel by pixel
   - Flow field: every point in space has a "direction" — particles follow it
   - requestAnimationFrame: asks the browser to call animate() again next frame (60x/sec)
============================================================ */

const canvas = document.getElementById('particle-canvas');
const ctx    = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);


// ── COLOUR PALETTE ──
// Blue shades — from dark to light, drawn randomly
const colors = [
    'rgba(60,  110, 220, ',   // deep blue
    'rgba(80,  140, 255, ',   // medium blue   (double weight = more common)
    'rgba(80,  140, 255, ',
    'rgba(120, 170, 255, ',   // light blue
    'rgba(130, 175, 255, ',   // pale blue
];


// ── PARTICLES ──
const COUNT = 90;
const particles = [];

for (let i = 0; i < COUNT; i++) {
    particles.push(spawnParticle());
}

function spawnParticle() {
    // 4%  chance of a large "block"
    const large  = Math.random() < 0.04;
    // 35% chance of a medium square — new middle tier
    const medium = !large && Math.random() < 0.35;
    // 4% chance of a bright highlight
    const bright = !large && !medium && Math.random() < 0.04;

    return {
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height,
        vx:    0,
        vy:    0,
        life:  Math.random(),
        speed: large  ? 0.4 + Math.random() * 0.8
             : medium ? 0.7 + Math.random() * 1.0
             : bright ? 1.2 + Math.random() * 1.5
             :          0.6 + Math.random() * 1.2,
        // size controls the square dimensions (in pixels)
        size:  large  ? 4 + Math.random() * 3     // 5–10px
             : medium ? 3 + Math.random() * 2      // 3–5px  ← new
             : bright ? 1.5 + Math.random() * 1.5  // 1.5–3px
             :          0.8 + Math.random() * 1.2,  // 0.8–2px (tiny dots)
        color: bright ? 'rgba(100, 160, 255, '
             : large  ? 'rgba(60,  120, 220, '
             :          colors[Math.floor(Math.random() * colors.length)],
        large,
        medium,
        bright,
        fadeIn: 0,
        trail:    [],
        trailLen: large ? 10 : medium ? 5 : 0,
    };
}


// ── MOUSE ──
let mouseOver = false;
const mouse = { x: null, y: null };

canvas.addEventListener('mouseenter', function() { mouseOver = true; });
canvas.addEventListener('mouseleave', function() { mouseOver = false; mouse.x = null; });
canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left) * (canvas.width  / canvas.offsetWidth);
    mouse.y = (e.clientY - rect.top)  * (canvas.height / canvas.offsetHeight);
});


// ── SCROLL SPEED ──
let speedMultiplier = 2.0; // starts fast on load, decays naturally to 0.15

window.addEventListener('wheel', e => {
    if (e.deltaY > 0) {
        // Scrolling DOWN — speed up, max 2.0
        speedMultiplier = Math.min(2.0, speedMultiplier + e.deltaY * 0.005);
    } else {
        // Scrolling UP — slow down, floor at default speed (0.4)
        // e.deltaY is negative here, so adding it subtracts from speedMultiplier
        speedMultiplier = Math.max(0.15, speedMultiplier + e.deltaY * 0.005);
    }
});


// ── FLOW FIELD ──
let time = 0;
let currentAngle = -Math.PI / 6;

// Axis position — lerps smoothly toward mouse (or center when idle)
let axCurrent = 0;
let ayCurrent = 0;

function getAngle(x, y) {
    const s = 0.0010;
    const noise = Math.sin(x * s + time * 0.12) * 0.45
                + Math.cos(y * s + time * 0.10) * 0.30;
    return currentAngle + noise;
}


// ── ANIMATION ──
function animate() {
    // Tail effect — paint a semi-transparent black layer over the previous frame.
    // At default speed: fully opaque (alpha 1.0) = no tail, canvas looks clean.
    // At max speed:     more transparent (alpha 0.2) = previous frame lingers = tail.
    // Formula maps speedMultiplier (0.4 → 2.0) to fadeAlpha (1.0 → 0.2)
    const fadeAlpha = 1 - ((speedMultiplier - 0.6) / 1.6) * 0.9;
    // const fadeAlpha = 1 - Math.max(0, (speedMultiplier - 1.5) / 2.1) * 0.85;
    ctx.fillStyle = `rgba(1, 2, 8, ${fadeAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ── MOUSE AXIS ──
    const axTarget = mouse.x !== null ? mouse.x : canvas.width  / 2;
    const ayTarget = mouse.y !== null ? mouse.y : canvas.height / 2;
    axCurrent += (axTarget - axCurrent) * 0.05;
    ayCurrent += (ayTarget - ayCurrent) * 0.05;
    const ax = axCurrent;
    const ay = ayCurrent;
    const sinA = Math.sin(currentAngle);
    const cosA = Math.cos(currentAngle);
    const bandWidth = Math.min(canvas.width, canvas.height) * 0.35;

    particles.forEach(p => {
        const angle = getAngle(p.x, p.y);

        // Accelerate in flow direction
        p.vx += Math.cos(angle) * 0.12 * speedMultiplier;
        p.vy += Math.sin(angle) * 0.12 * speedMultiplier;

        // Gravitational pull toward the mouse axis
        const signedDist = -sinA * (p.x - ax) + cosA * (p.y - ay);
        const distFactor = Math.max(0, 1 - Math.abs(signedDist) / bandWidth);
        p.vx += Math.sign(signedDist) * sinA * 0.02 * distFactor;
        p.vy -= Math.sign(signedDist) * cosA * 0.02 * distFactor;

        // Cap speed so particles don't fly off too fast
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > p.speed * speedMultiplier) {
            p.vx = (p.vx / spd) * p.speed * speedMultiplier;
            p.vy = (p.vy / spd) * p.speed * speedMultiplier;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Fade in gradually — prevents the "pop" when a particle spawns
        if (p.fadeIn < 1) p.fadeIn = Math.min(1, p.fadeIn + 0.012);

        // Respawn if off screen
        if (p.x < -10 || p.x > canvas.width + 10 ||
                            p.y < -10 || p.y > canvas.height + 10) {
            Object.assign(p, spawnParticle());
            return;
        }

        // Brightness boost near the axis
        const bandDist   = Math.abs(signedDist);
        const bandFactor = Math.max(0, 1 - bandDist / bandWidth);

        // Base transparency based on how much "life" the particle has left
        const baseAlpha = p.bright ? p.life * 0.85
                        : p.large  ? p.life * 0.65
                        :            p.life * 0.55;

        // Add a boost near the band — this creates the bright river effect
        const alpha = Math.min(1, baseAlpha + bandFactor * 0.55) * p.fadeIn;

        // ── TRAIL ──
        if (p.trailLen > 0) {
            p.trail.push({ x: p.x, y: p.y });
            if (p.trail.length > p.trailLen) p.trail.shift();

            p.trail.forEach(function(pos, i) {
                const t = i / p.trail.length;  // 0 = oldest, 1 = newest
                ctx.fillStyle = p.color + alpha * t * 0.35 + ')';
                ctx.fillRect(pos.x - p.size / 2, pos.y - p.size / 2, p.size, p.size);
            });
        }

        // ── DRAW ──
        const rx = p.x - p.size / 2;
        const ry = p.y - p.size / 2;
        const rs = p.size;

        // Glow — larger particles glow more
        ctx.shadowColor = p.color + Math.min(1, alpha * 1.2) + ')';
        // ctx.shadowBlur  = p.large ? 12 : p.medium ? 7 : p.bright ? 9 : 4;
        ctx.shadowBlur  = (p.large ? 24 : p.medium ? 14 : p.bright ? 18 : 8) * alpha; 

        // Outer square — slightly dimmer (the "bezel")
        ctx.fillStyle = p.color + alpha * 1 + ')';
        ctx.fillRect(rx, ry, rs, rs);

        // Inner square — brighter (the "screen"), only on medium and large
        // inset pulls each edge inward by ~25% of the size
        if (p.large || p.medium) {
            const inset = Math.max(1, Math.round(p.size * 0.08));
            const iw = rs - inset * 2;  // inner width
            const ix = rx + inset;      // inner x
            const iy = ry + inset;      // inner y

            // Screen fill
            ctx.fillStyle = p.color + Math.min(1, alpha * 1.4) + ')';
            ctx.fillRect(ix, iy, iw, iw);

            // Large only: extra refinement
            if (p.large) {
                // Bright reflection line along the top edge of the screen
                ctx.fillStyle = p.color + Math.min(1, alpha * 2.2) + ')';
                ctx.fillRect(ix, iy, iw, 1);

                // Tiny indicator dot — bottom-right corner of the bezel
                ctx.fillStyle = p.color + Math.min(1, alpha * 1.8) + ')';
                ctx.fillRect(rx + rs - inset, ry + rs - inset, 1, 1);
            }
        }

        // Reset glow so it doesn't bleed into other drawing operations
        ctx.shadowBlur = 0;
    });

    // Hover: ramp up speed
    const targetSpeed = mouseOver ? 2.0 : 0.15;
    const lerpRate = speedMultiplier < targetSpeed ? 0.12 : 0.03;
    speedMultiplier += (targetSpeed - speedMultiplier) * lerpRate;

    // Steer angle toward mouse — lerp so it turns smoothly
    const defaultAngle = -Math.PI / 6;
    let targetAngle = defaultAngle;
    if (mouse.x !== null) {
        const cx = canvas.width  / 2;
        const cy = canvas.height / 2;
        targetAngle = Math.atan2(mouse.y - cy, mouse.x - cx);
    }
    let diff = targetAngle - currentAngle;
    if (diff >  Math.PI) diff -= Math.PI * 2;
    if (diff < -Math.PI) diff += Math.PI * 2;
    currentAngle += diff * 0.03;

    time += 0.003;
    requestAnimationFrame(animate);
}

animate();
