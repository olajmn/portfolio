/* ============================================================
   particles.js — emergent particle universe
   200 partikler i 10 størrelsestier (1–10).
   Ingen faste gravitasjonspunkter — form oppstår av
   partikkel-til-partikkel tiltrekning, frastøtning og swirl.
============================================================ */

// ── CANVAS ──
const canvas = document.getElementById('particle-canvas');
const ctx    = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);


const FOCAL    = 600;
const Z_CENTER = 600;


// ── CONFIG PARTICLES ──
const CONFIG = {
    count:      50,
    background: '1, 2, 8',
    brownian:   0.008,

    attract: {
        maxDist:   90,
        repelDist: 28,
        pull:      0.004,
        push:      0.022,
        swirl:     0.014,
    },
};

// ── MIX ── (det du faktisk endrer)
// Bare legg inn hvilke tier-nummer du vil ha aktive
const MIX = [
    1, 
    5, 
    10
];

// ── TIERS ── (biblioteket — rør helst ikke dette)
// pct      = andel av totalt antall — de aktive MÅ summere til 1.0
// size     = abstrakt energi (0.0 – 1.0), styrer radius, alpha og glow
// mass     = gravitasjonsstyrke
// lifetime = levetid som andel av maks (ganges med 1800 frames)
// color    = rgba-streng (alpha legges til automatisk)
const TIERS = {
    1:  { pct: 0.64, size: [0.04, 0.07], mass: 0.4,  lifetime: [0.3, 0.5],  color: 'rgba(80,  140, 255, ' },
    2:  { pct: 0,    size: [0.07, 0.11], mass: 0.6,  lifetime: [0.4, 0.6],  color: 'rgba(80,  140, 255, ' },
    3:  { pct: 0,    size: [0.11, 0.16], mass: 0.8,  lifetime: [0.5, 0.7],  color: 'rgba(60,  110, 220, ' },
    4:  { pct: 0,    size: [0.16, 0.22], mass: 1.0,  lifetime: [0.5, 0.7],  color: 'rgba(60,  110, 220, ' },
    5:  { pct: 0.30, size: [0.22, 0.30], mass: 1.2,  lifetime: [0.6, 0.8],  color: 'rgba(40,   80, 180, ' },
    6:  { pct: 0,    size: [0.30, 0.40], mass: 1.5,  lifetime: [0.6, 0.8],  color: 'rgba(20,   40, 120, ' },
    7:  { pct: 0,    size: [0.40, 0.52], mass: 2.0,  lifetime: [0.7, 0.9],  color: 'rgba(20,   40, 120, ' },
    8:  { pct: 0,    size: [0.52, 0.66], mass: 2.8,  lifetime: [0.7, 0.9],  color: 'rgba(120, 170, 255, ' },
    9:  { pct: 0,    size: [0.66, 0.82], mass: 4.0,  lifetime: [0.8, 0.95], color: 'rgba(180, 210, 255, ' },
    10: { pct: 0.06, size: [0.82, 1.00], mass: 6.0,  lifetime: [0.9, 1.0],  color: 'rgba(220, 235, 255, ' },
    11: { pct: 0,    size: [0.95, 1.00], mass: 14.0, lifetime: [1.2, 1.5],  color: 'rgba(255, 255, 255, ' },
};

// ── VISUAL MAPPING ──
// These convert the abstract size (0–1) into actual pixel values.
// Change these to remap how size feels visually — without touching TIERS.
const VISUAL = {
    maxRadius: 9,      // size 1.0 → 9px radius
    alphaMin:  0.12,   // size 0.0 → this opacity
    alphaMax:  0.95,   // size 1.0 → this opacity
    maxGlow:   28,     // size 1.0 → 28px shadowBlur
};

// Picks a random tier from MIX, weighted by each tier's pct
function pickTier() {
    let r = Math.random();
    for (const id of MIX) {
        r -= TIERS[id].pct;
        if (r <= 0) return { tier: id, ...TIERS[id] };
    }
    const last = MIX[MIX.length - 1];
    return { tier: last, ...TIERS[last] };
}

function rndBetween(min, max) { return min + Math.random() * (max - min); }


// ── PARTICLES ──
const particles = [];

function spawnParticle() {
    const t = pickTier();
    return {
        tier:  t.tier,
        x:     (Math.random() - 0.5) * canvas.width  * 0.8,
        y:     (Math.random() - 0.5) * canvas.height * 0.8,
        z:     Z_CENTER + (Math.random() - 0.5) * 40,
        vx:    (Math.random() - 0.5) * 0.4,
        vy:    (Math.random() - 0.5) * 0.4,
        vz:    (Math.random() - 0.5) * 0.05,
        size:     rndBetween(t.size[0],     t.size[1]),
        mass:     t.mass,
        lifeMax:  rndBetween(t.lifetime[0], t.lifetime[1]) * 1800, // frames to live
        life:     0,    // current age in frames
        fadeIn:   60,   // frames to fade in
        color: t.color,
        spin:       Math.random() < 0.5 ? 1 : -1,
        ecc:        0.6 + Math.random() * 0.8,   // eccentricity (1.0 = circle, other = ellipse)
        orbitAngle: Math.random() * Math.PI * 2,  // orientation of the ellipse
    };
}

for (let i = 0; i < CONFIG.count; i++) {
    particles.push(spawnParticle());
}


// ── PROJECTION ──
function project(x, y, z) {
    const sc = FOCAL / Math.max(z, 1);
    return {
        sx:    canvas.width  / 2 + x * sc,
        sy:    canvas.height / 2 + y * sc,
        scale: Z_CENTER / Math.max(z, 1),
    };
}


// ── ANIMATION ──
function animate() {
    ctx.fillStyle = `rgba(${CONFIG.background}, 0.55)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ── PARTICLE-PARTICLE GRAVITY ──
    const cfg = CONFIG.attract;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const a  = particles[i];
            const b  = particles[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dz = b.z - a.z;
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
            if (dist < 1 || dist > cfg.maxDist) continue;

            const nx = dx/dist, ny = dy/dist, nz = dz/dist;

            const attract = dist > cfg.repelDist;
            const baseForce = attract
                ? cfg.pull * (1 - dist / cfg.maxDist)
                : cfg.push * (1 - dist / cfg.repelDist);

            // Each particle feels a force proportional to the OTHER's mass —
            // heavy particles barely move, light ones get pulled strongly
            const forceOnA = baseForce * b.mass * (attract ? 1 : -1);
            const forceOnB = baseForce * a.mass * (attract ? 1 : -1);

            a.vx += nx * forceOnA;  a.vy += ny * forceOnA;  a.vz += nz * forceOnA * 0.2;
            b.vx -= nx * forceOnB;  b.vy -= ny * forceOnB;  b.vz -= nz * forceOnB * 0.2;

            // Swirl — scales with the OTHER's mass (heavier = stronger orbit field)
            // Ellipse: skew the tangential force slightly in X vs Y using ecc + orbitAngle
            const falloff = 1 - dist / cfg.maxDist;
            const tx = -ny, ty = nx;

            const eccXa = 1 + (a.ecc - 1) * Math.cos(a.orbitAngle);
            const eccYa = 1 + (a.ecc - 1) * Math.sin(a.orbitAngle);
            const eccXb = 1 + (b.ecc - 1) * Math.cos(b.orbitAngle);
            const eccYb = 1 + (b.ecc - 1) * Math.sin(b.orbitAngle);

            a.vx += tx * cfg.swirl * falloff * b.mass * b.spin * eccXb;
            a.vy += ty * cfg.swirl * falloff * b.mass * b.spin * eccYb;
            b.vx -= tx * cfg.swirl * falloff * a.mass * a.spin * eccXa;
            b.vy -= ty * cfg.swirl * falloff * a.mass * a.spin * eccYa;
        }
    }

    // Sort far → near
    particles.sort((a, b) => b.z - a.z);

    particles.forEach(p => {
        // Brownian motion
        p.vx += (Math.random() - 0.5) * CONFIG.brownian;
        p.vy += (Math.random() - 0.5) * CONFIG.brownian;

        // Z stays flat
        p.vz *= 0.88;
        p.vz += (Z_CENTER - p.z) * 0.002;

        // Speed clamp
        const spd = Math.sqrt(p.vx**2 + p.vy**2);
        if (spd > 2.5) { const s = 2.5 / spd; p.vx *= s; p.vy *= s; }

        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Wrap edges
        const hw = canvas.width  / 2;
        const hh = canvas.height / 2;
        if (p.x < -hw) p.x += canvas.width;
        if (p.x >  hw) p.x -= canvas.width;
        if (p.y < -hh) p.y += canvas.height;
        if (p.y >  hh) p.y -= canvas.height;

        // Draw
        const { sx, sy, scale } = project(p.x, p.y, p.z);
        if (scale < 0.05) return;

        // Ageing — fade in at birth, fade out at death, respawn
        p.life++;
        const fadeInAlpha  = Math.min(1, p.life / p.fadeIn);
        const fadeOutAlpha = Math.max(0, 1 - Math.max(0, p.life - p.lifeMax * 0.85) / (p.lifeMax * 0.15));
        const lifeFactor   = fadeInAlpha * fadeOutAlpha;

        if (p.life > p.lifeMax) {
            Object.assign(p, spawnParticle());  // respawn in place
            return;
        }

        // Derive all visuals from abstract size (0–1)
        const radius = Math.max(0.4, p.size * VISUAL.maxRadius * scale);
        const alpha  = (VISUAL.alphaMin + p.size * (VISUAL.alphaMax - VISUAL.alphaMin)) * lifeFactor;
        const glow   = p.size * VISUAL.maxGlow * scale * lifeFactor;

        ctx.shadowColor = p.color + Math.min(1, alpha * 1.4) + ')';
        ctx.shadowBlur  = glow;
        ctx.fillStyle   = p.color + alpha + ')';
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    });

    requestAnimationFrame(animate);
}

animate();
