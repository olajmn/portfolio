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
    count:      100,
    background: '1, 2, 8',
    brownian:   0.008,
    friction:   0.5,   // 1.0 = ingen bremsing, 0.95 = mye bremsing

    attract: {
        maxDist:   90,
        repelDist: 28,
        pull:      0.004,
        push:      0.022,
        swirl:     0.020,
    },
};

// ── MIX ── (det du faktisk endrer)
// Tesla 3-6-9: tre representative tiers — liten, medium, dominant
const MIX = [1, 2, 3, 4, 5, 6, 9];

// ── TIERS ── (biblioteket — rør helst ikke dette)
// Gruppe 1 (liten):   1–3  →  støv, lett, kortlivet
// Gruppe 2 (medium):  4–6  →  synlig, moderat masse
// Gruppe 3 (stor):    7–9  →  dominant, tung, langlivet
const TIERS = {
    1: { pct: 1.00, inertia: 1.0,  glowMult: 1.0, size: [0.10, 0.16], mass: 0.3,  lifetime: [0.2, 0.4],  color: 'rgba(120, 180, 255, ' },
    2: { pct: 0.90, inertia: 1.0,  glowMult: 1.0, size: [0.16, 0.22], mass: 0.5,  lifetime: [0.3, 0.5],  color: 'rgba(110, 170, 255, ' },
    3: { pct: 0.80, inertia: 1.0,  glowMult: 1.0, size: [0.22, 0.28], mass: 0.7,  lifetime: [0.4, 0.6],  color: 'rgba(100, 160, 255, ' },

    4: { pct: 0.40, inertia: 6.0,  glowMult: 1.2, centerPull: 0.00002, size: [0.14, 0.22], mass: 3.0, lifetime: [0.5, 0.7],  color: 'rgba(50,  100, 200, ' },
    5: { pct: 0.30, inertia: 8.0,  glowMult: 1.4, centerPull: 0.00005, size: [0.22, 0.32], mass: 4.5, lifetime: [0.5, 0.7],  color: 'rgba(40,   80, 180, ' },
    6: { pct: 0.22, inertia: 10.0, glowMult: 1.6, centerPull: 0.00012, size: [0.32, 0.44], mass: 6.0, lifetime: [0.6, 0.8],  color: 'rgba(30,   60, 160, ' },

    7: { pct: 0.12, inertia: 5.0,  glowMult: 1.0, size: [0.44, 0.58], mass: 3.5,  lifetime: [0.7, 0.9],  color: 'rgba(140, 180, 255, ' },
    8: { pct: 0.07, inertia: 8.0,  glowMult: 1.0, size: [0.58, 0.76], mass: 6.0,  lifetime: [0.8, 0.95], color: 'rgba(200, 220, 255, ' },
    9: { pct: 0.04, inertia: 14.0, glowMult: 5.0, minCount: 1, maxCount: 1, size: [0.30, 0.40], mass: 30.0, lifetime: [0.9, 1.0], color: 'rgba(255, 255, 255, ' },
};

// ── VISUAL MAPPING ──
// These convert the abstract size (0–1) into actual pixel values.
// Change these to remap how size feels visually — without touching TIERS.
const VISUAL = {
    maxRadius: 9,      // size 1.0 → 9px radius
    alphaMin:  0.15,   // size 0.0 → this opacity
    alphaMax:  0.95,   // size 1.0 → this opacity
    maxGlow:   50,     // size 1.0 → 50px shadowBlur
};

// Picks a random tier from MIX — respects minCount/maxCount caps per tier
function pickTier() {
    // If any tier is below its minCount, force it immediately
    for (const id of MIX) {
        const t = TIERS[id];
        if (t.minCount !== undefined) {
            const n = particles.filter(p => p.tier === id).length;
            if (n < t.minCount) return { tier: id, ...t };
        }
    }

    const pool = MIX.filter(id => {
        const t = TIERS[id];
        if (t.maxCount === undefined) return true;
        const n = particles.filter(p => p.tier === id).length;
        return n < t.maxCount;
    });

    const total = pool.reduce((sum, id) => sum + TIERS[id].pct, 0);
    let r = Math.random() * total;
    for (const id of pool) {
        r -= TIERS[id].pct;
        if (r <= 0) return { tier: id, ...TIERS[id] };
    }
    const last = pool[pool.length - 1] ?? MIX[MIX.length - 1];
    return { tier: last, ...TIERS[last] };
}

function rndBetween(min, max) { return min + Math.random() * (max - min); }


// ── PARTICLES ──
const particles = [];

function spawnParticle() {
    const t = pickTier();
    const x = (Math.random() - 0.5) * canvas.width  * 0.8;
    const y = (Math.random() - 0.5) * canvas.height * 0.8;
    return {
        tier:  t.tier,
        x, y,
        cx: x, cy: y,   // personal center — particle is pulled back here
        centerPull: t.centerPull ?? 0.00025 / t.mass,
        z:     Z_CENTER + (Math.random() - 0.5) * 40,
        vx:    (Math.random() - 0.5) * 0.4,
        vy:    (Math.random() - 0.5) * 0.4,
        vz:    (Math.random() - 0.5) * 0.05,
        size:     rndBetween(t.size[0],     t.size[1]),
        mass:     t.mass,
        inertia:  t.inertia,
        glowMult: t.glowMult,
        lifeMax:  rndBetween(t.lifetime[0], t.lifetime[1]) * 1800,
        life:     0,
        fadeIn:   60,
        color: t.color,
        spin:       Math.random() < 0.5 ? 1 : -1,
        ecc:        0.6 + Math.random() * 0.8,
        orbitAngle: Math.random() * Math.PI * 2,
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
    // Split into heavy (mass >= 1) and light (mass < 1) for performance:
    // heavy↔heavy: full bidirectional physics  O(n_heavy²)
    // heavy→light: only heavy pushes light     O(n_heavy × n_light)
    // light vs light: skipped entirely
    const cfg = CONFIG.attract;
    const heavy = [];
    const light  = [];
    for (const p of particles) {
        (p.mass >= 1.0 ? heavy : light).push(p);
    }

    function applyForces(a, b, bidirectional) {
        const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist < 1 || dist > cfg.maxDist) return;

        const nx = dx/dist, ny = dy/dist, nz = dz/dist;
        const attract   = dist > cfg.repelDist;
        const baseForce = attract
            ? cfg.pull * (1 - dist / cfg.maxDist)
            : cfg.push * (1 - dist / cfg.repelDist);

        const forceOnA = baseForce * b.mass * (attract ? 1 : -1);
        a.vx += nx * forceOnA / a.inertia;
        a.vy += ny * forceOnA / a.inertia;
        a.vz += nz * forceOnA * 0.2 / a.inertia;

        if (bidirectional) {
            const forceOnB = baseForce * a.mass * (attract ? 1 : -1);
            b.vx -= nx * forceOnB / b.inertia;
            b.vy -= ny * forceOnB / b.inertia;
            b.vz -= nz * forceOnB * 0.2 / b.inertia;
        }

        const falloff = 1 - dist / cfg.maxDist;
        const tx = -ny, ty = nx;

        const eccXb = 1 + (b.ecc - 1) * Math.cos(b.orbitAngle);
        const eccYb = 1 + (b.ecc - 1) * Math.sin(b.orbitAngle);
        a.vx += tx * cfg.swirl * falloff * b.mass * b.spin * eccXb / a.inertia;
        a.vy += ty * cfg.swirl * falloff * b.mass * b.spin * eccYb / a.inertia;

        if (bidirectional) {
            const eccXa = 1 + (a.ecc - 1) * Math.cos(a.orbitAngle);
            const eccYa = 1 + (a.ecc - 1) * Math.sin(a.orbitAngle);
            b.vx -= tx * cfg.swirl * falloff * a.mass * a.spin * eccXa / b.inertia;
            b.vy -= ty * cfg.swirl * falloff * a.mass * a.spin * eccYa / b.inertia;
        }
    }

    // Heavy ↔ heavy — full physics both ways
    for (let i = 0; i < heavy.length; i++)
        for (let j = i + 1; j < heavy.length; j++)
            applyForces(heavy[i], heavy[j], true);

    // Heavy → light — only heavy affects light, not the other way
    for (const h of heavy)
        for (const l of light)
            applyForces(l, h, false);

    // Sort far → near — every 3rd frame is enough (z changes slowly)
    if (animate.frame % 3 === 0) particles.sort((a, b) => b.z - a.z);
    animate.frame = (animate.frame ?? 0) + 1;

    particles.forEach(p => {
        // Brownian motion — heavy particles barely jitter
        p.vx += (Math.random() - 0.5) * CONFIG.brownian / p.inertia;
        p.vy += (Math.random() - 0.5) * CONFIG.brownian / p.inertia;

        // Z stays flat
        p.vz *= 0.88;
        p.vz += (Z_CENTER - p.z) * 0.002;

        // Speed clamp — higher for heavy particles so swirl can build orbital velocity
        const maxSpd = 1.5 + p.mass * 0.2;
        const spd = Math.sqrt(p.vx**2 + p.vy**2);
        if (spd > maxSpd) { const s = maxSpd / spd; p.vx *= s; p.vy *= s; }

        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Pull toward personal center
        p.vx += (p.cx - p.x) * p.centerPull;
        p.vy += (p.cy - p.y) * p.centerPull;

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
        const glow   = p.size * VISUAL.maxGlow * scale * lifeFactor * p.glowMult;

        // Only apply shadowBlur for particles large enough to show it
        if (glow > 4) {
            ctx.shadowColor = p.color + Math.min(1, alpha * 1.5) + ')';
            ctx.shadowBlur  = glow * 2;
        }

        ctx.fillStyle = p.color + alpha + ')';
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Bright inner core — only for the glowing ones
        if (glow > 4) {
            ctx.shadowBlur = glow * 0.4;
            ctx.fillStyle  = p.color + Math.min(1, alpha * 1.2) + ')';
            ctx.beginPath();
            ctx.arc(sx, sy, radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    });

    requestAnimationFrame(animate);
}

animate();
