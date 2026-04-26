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


// ── CONFIG ──
// Change these to tweak the look of the particle system
const CONFIG = {
    count:      80,           // total number of particles
    background: '1, 2, 8',   // RGB of the background (almost-black with blue tint)

    colors: [
        'rgba(20,  40,  120, ',   // navy — deep marine blue
        'rgba(20,  40,  120, ',   // navy (listed twice = more common)
        'rgba(60,  110, 220, ',   // deep blue
        'rgba(80,  140, 255, ',   // medium blue (listed twice = more common)
        'rgba(80,  140, 255, ',
        'rgba(120, 170, 255, ',   // light blue
        'rgba(130, 175, 255, ',   // pale blue
    ],

    large: {
        chance:   0.04,   // 4% of particles are large
        speedMin: 0.4,
        speedMax: 0.8,
        sizeMin:  4,
        sizeMax:  3,
        color:    'rgba(60,  120, 220, ',
        trailLen: 10,
    },
    medium: {
        chance:   0.35,   // 35% of particles are medium
        speedMin: 0.7,
        speedMax: 1.0,
        sizeMin:  3,
        sizeMax:  2,
        trailLen: 5,
    },
    small: {
        chance:   0.04,   // 4% of particles are small highlights
        speedMin: 1.2,
        speedMax: 1.5,
        sizeMin:  1.5,
        sizeMax:  1.5,
        color:    'rgba(100, 160, 255, ',
        trailLen: 0,
    },
    tiny: {               // everything else
        speedMin: 0.6,
        speedMax: 1.2,
        sizeMin:  0.8,
        sizeMax:  1.2,
        trailLen: 0,
    },
};


// ── PARTICLES ──
const particles = [];

for (let i = 0; i < CONFIG.count; i++) {
    particles.push(spawnParticle());
}

function spawnParticle() {
    const large  = Math.random() < CONFIG.large.chance;
    const medium = !large && Math.random() < CONFIG.medium.chance;
    const small = !large && !medium && Math.random() < CONFIG.small.chance;

    const cfg = large ? CONFIG.large : medium ? CONFIG.medium : small ? CONFIG.small : CONFIG.tiny;

    // 1% chance of crimson — only on small and tiny particles
    const crimson = !large && !medium && Math.random() < 0.01;

    const colorIndex = Math.floor(Math.random() * CONFIG.colors.length);
    const baseColor  = crimson ? 'rgba(180, 20, 40, '
                     : small   ? CONFIG.small.color
                     : large   ? CONFIG.large.color
                     :           CONFIG.colors[colorIndex];

    // navy = the two dark marine entries (index 0 and 1 in colors array)
    const navy = !crimson && !small && !large && colorIndex <= 1;

    return {
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height,
        vx:    0,
        vy:    0,
        life:  Math.random(),
        speed: cfg.speedMin + Math.random() * cfg.speedMax,
        size:  cfg.sizeMin  + Math.random() * cfg.sizeMax,
        color: baseColor,
        large,
        medium,
        small,
        navy,
        fadeIn:   0,
        trail:    [],
        trailLen: cfg.trailLen,
    };
}


// ── MOUSE ──
let mouseOver  = false;
let isClicking = false;
let isDragging = false;
let lastDragX  = null;
let lastDragY  = null;
const mouse = { x: null, y: null };

canvas.addEventListener('mouseenter', function() { mouseOver = true; });
canvas.addEventListener('mouseleave', function() { mouseOver = false; mouse.x = null; isClicking = false; isDragging = false; });
canvas.addEventListener('mousedown',  function(e) { isClicking = true; isDragging = true; lastDragX = e.clientX; lastDragY = e.clientY; });
canvas.addEventListener('mouseup',    function() { isClicking = false; isDragging = false; lastDragX = null; lastDragY = null; });
canvas.addEventListener('mousemove',  function(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left) * (canvas.width  / canvas.offsetWidth);
    mouse.y = (e.clientY - rect.top)  * (canvas.height / canvas.offsetHeight);

    if (isDragging && lastDragX !== null) {
        currentAngle += (e.clientX - lastDragX) * 0.012;
        tiltAngle = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, tiltAngle + (e.clientY - lastDragY) * 0.01));
        lastDragX = e.clientX;
        lastDragY = e.clientY;
    }
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
let tiltAngle = 0;

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
    ctx.fillStyle = `rgba(${CONFIG.background}, ${fadeAlpha})`;
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
    const pullTarget = isClicking ? 0.18 : 0.02;
    if (!animate.pull) animate.pull = 0.02;
    animate.pull += (pullTarget - animate.pull) * 0.12;

    particles.forEach(p => {
        const angle = getAngle(p.x, p.y);

        // Accelerate in flow direction — tilt compresses the axis (cos(tilt) = 1 when flat, 0 when pointing at viewer)
        const flowScale = Math.cos(tiltAngle);
        p.vx += Math.cos(angle) * flowScale * 0.12 * speedMultiplier;
        p.vy += Math.sin(angle) * flowScale * 0.12 * speedMultiplier;

        // Gravitational pull toward the mouse axis
        const signedDist = -sinA * (p.x - ax) + cosA * (p.y - ay);
        const distFactor = Math.max(0, 1 - Math.abs(signedDist) / bandWidth);
        p.vx += Math.sign(signedDist) * sinA * animate.pull * distFactor;
        p.vy -= Math.sign(signedDist) * cosA * animate.pull * distFactor;

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
        const baseAlpha = p.small ? p.life * 0.85
                        : p.large  ? p.life * 0.65
                        :            p.life * 0.55;

        // Add a boost near the band — this creates the small river effect
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

        // Glow — larger particles glow more; navy gets a lighter shadow color for a bright-core look
        ctx.shadowColor = p.navy  ? 'rgba(80, 130, 255, ' + Math.min(1, alpha * 1.4) + ')'
                        :           p.color + Math.min(1, alpha * 1.2) + ')';
        ctx.shadowBlur  = (p.large ? 24 : p.medium ? 14 : p.small ? 18 : p.navy ? 14 : 8) * alpha;

        // Outer square — slightly dimmer (the "bezel")
        ctx.fillStyle = p.color + alpha * 1 + ')';
        ctx.fillRect(rx, ry, rs, rs);

        // Navy: tiny bright center pixel
        if (p.navy) {
            ctx.fillStyle = 'rgba(140, 180, 255, ' + Math.min(1, alpha * 0.6) + ')';
            ctx.fillRect(p.x, p.y, 1, 1);
        }

        // Inner square — smaller (the "screen"), only on medium and large
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

    // Tilt: flatten back to 0 when not dragging
    if (!isDragging) tiltAngle += (0 - tiltAngle) * 0.03;

    // Steer angle toward mouse — only when not dragging
    if (!isDragging) {
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
    }

    time += 0.003;
    requestAnimationFrame(animate);
}

animate();
