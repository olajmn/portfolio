// ── CANVAS ──
const canvas = document.getElementById('particle-canvas');
const ctx    = canvas.getContext('2d');
function resizeCanvas() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const FOCAL    = 600;
const Z_CENTER = 600;


// ── KONTROLLER ──────────────────────────────────────────────
// Dette er det eneste du trenger å endre.

const CONFIG = {
    count:    100,           // totalt antall partikler
    bg:       '1, 2, 8',    // bakgrunnsfarge (r, g, b)
    brownian: 0.008,         // tilfeldig jitter per frame

    attract: {
        maxDist:   90,       // gravitasjonsrekkevidde (px)
        repelDist: 28,       // avstand der frastøtning starter
        pull:      0.004,    // attraksjonskraft
        push:      0.022,    // frastøtningskraft
        swirl:     0.020,    // svirlingskraft (skaper baner)
    },
};

const VISUAL = {
    maxRadius: 9,     // størst mulig radius (px)
    alphaMin:  0.15,  // minste opacity
    alphaMax:  0.95,  // største opacity
    maxGlow:   50,    // største glow-blur (px)
};

// MIX — hvilke tiers som er aktive
const MIX = [1, 2, 3, 4, 5, 6, 9];

// TIERS — egenskaper per tier
//   pct:        relativ spawn-sannsynlighet
//   size:       [min, max] abstrakt størrelse → radius, alpha, glow
//   mass:       gravitasjonsstyrke
//   inertia:    treighet — høy = motstår krefter
//   glowMult:   glow-multiplier
//   centerPull: hvor hardt partikkelen trekkes mot spawn-punktet
//   lifetime:   [min, max] levetid som andel av 1800 frames
//   minCount:   alltid minst dette mange på skjermen
//   maxCount:   aldri mer enn dette mange på skjermen
const TIERS = {
    1: { pct: 1.00, size: [0.10, 0.16], mass: 0.3, inertia:  1.0, glowMult: 1.0,                          lifetime: [0.2, 0.4], color: 'rgba(120, 180, 255, ' },
    2: { pct: 0.90, size: [0.16, 0.22], mass: 0.5, inertia:  1.0, glowMult: 1.0,                          lifetime: [0.3, 0.5], color: 'rgba(110, 170, 255, ' },
    3: { pct: 0.80, size: [0.22, 0.28], mass: 0.7, inertia:  1.0, glowMult: 1.0,                          lifetime: [0.4, 0.6], color: 'rgba(100, 160, 255, ' },

    4: { pct: 0.40, size: [0.14, 0.22], mass: 3.0, inertia:  6.0, glowMult: 1.2, centerPull: 0.00002,     lifetime: [0.5, 0.7], color: 'rgba( 50, 100, 200, ' },
    5: { pct: 0.30, size: [0.22, 0.32], mass: 4.5, inertia:  8.0, glowMult: 1.4, centerPull: 0.00005,     lifetime: [0.5, 0.7], color: 'rgba( 40,  80, 180, ' },
    6: { pct: 0.22, size: [0.32, 0.44], mass: 6.0, inertia: 10.0, glowMult: 1.6, centerPull: 0.00012,     lifetime: [0.6, 0.8], color: 'rgba( 30,  60, 160, ' },

    9: { pct: 0.04, size: [0.30, 0.40], mass: 30.0, inertia: 14.0, glowMult: 5.0, minCount: 1, maxCount: 1, lifetime: [0.9, 1.0], color: 'rgba(255, 255, 255, ' },
};
// ────────────────────────────────────────────────────────────


// ── SPAWN ──
function rnd(min, max) { return min + Math.random() * (max - min); }

function pickTier() {
    for (const id of MIX) {
        const t = TIERS[id];
        if (t.minCount !== undefined && particles.filter(p => p.tier === id).length < t.minCount)
            return { tier: id, ...t };
    }
    const pool  = MIX.filter(id => {
        const t = TIERS[id];
        return t.maxCount === undefined || particles.filter(p => p.tier === id).length < t.maxCount;
    });
    const total = pool.reduce((s, id) => s + TIERS[id].pct, 0);
    let r = Math.random() * total;
    for (const id of pool) { r -= TIERS[id].pct; if (r <= 0) return { tier: id, ...TIERS[id] }; }
    return { tier: pool.at(-1), ...TIERS[pool.at(-1)] };
}

function spawnParticle() {
    const t = pickTier();
    const x = (Math.random() - 0.5) * canvas.width  * 0.8;
    const y = (Math.random() - 0.5) * canvas.height * 0.8;
    return {
        tier: t.tier, x, y, cx: x, cy: y,
        z:  Z_CENTER + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.05,
        size:       rnd(t.size[0], t.size[1]),
        mass:       t.mass,
        inertia:    t.inertia,
        glowMult:   t.glowMult,
        centerPull: t.centerPull ?? 0.00025 / t.mass,
        lifeMax:    rnd(t.lifetime[0], t.lifetime[1]) * 1800,
        life: 0, fadeIn: 60,
        color: t.color,
        spin:       Math.random() < 0.5 ? 1 : -1,
        ecc:        0.6 + Math.random() * 0.8,
        orbitAngle: Math.random() * Math.PI * 2,
    };
}

const particles = [];
for (let i = 0; i < CONFIG.count; i++) particles.push(spawnParticle());


// ── PROJEKSJON ──
function project(x, y, z) {
    const sc = FOCAL / Math.max(z, 1);
    return { sx: canvas.width / 2 + x * sc, sy: canvas.height / 2 + y * sc, scale: Z_CENTER / Math.max(z, 1) };
}


// ── ANIMASJON ──
function animate() {
    ctx.fillStyle = `rgba(${CONFIG.bg}, 0.55)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Deler partikler i tunge (mass ≥ 1) og lette for ytelse
    const cfg   = CONFIG.attract;
    const heavy = [], light = [];
    for (const p of particles) (p.mass >= 1 ? heavy : light).push(p);

    function applyForces(a, b, bidirectional) {
        const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist < 1 || dist > cfg.maxDist) return;

        const nx = dx/dist, ny = dy/dist, nz = dz/dist;
        const attract   = dist > cfg.repelDist;
        const baseForce = attract ? cfg.pull * (1 - dist/cfg.maxDist) : cfg.push * (1 - dist/cfg.repelDist);

        const fa = baseForce * b.mass * (attract ? 1 : -1);
        a.vx += nx * fa / a.inertia;
        a.vy += ny * fa / a.inertia;
        a.vz += nz * fa * 0.2 / a.inertia;

        if (bidirectional) {
            const fb = baseForce * a.mass * (attract ? 1 : -1);
            b.vx -= nx * fb / b.inertia;
            b.vy -= ny * fb / b.inertia;
            b.vz -= nz * fb * 0.2 / b.inertia;
        }

        const falloff = 1 - dist/cfg.maxDist;
        const tx = -ny, ty = nx;
        const ex = 1 + (b.ecc - 1) * Math.cos(b.orbitAngle);
        const ey = 1 + (b.ecc - 1) * Math.sin(b.orbitAngle);
        a.vx += tx * cfg.swirl * falloff * b.mass * b.spin * ex / a.inertia;
        a.vy += ty * cfg.swirl * falloff * b.mass * b.spin * ey / a.inertia;

        if (bidirectional) {
            const ex2 = 1 + (a.ecc - 1) * Math.cos(a.orbitAngle);
            const ey2 = 1 + (a.ecc - 1) * Math.sin(a.orbitAngle);
            b.vx -= tx * cfg.swirl * falloff * a.mass * a.spin * ex2 / b.inertia;
            b.vy -= ty * cfg.swirl * falloff * a.mass * a.spin * ey2 / b.inertia;
        }
    }

    for (let i = 0; i < heavy.length; i++)
        for (let j = i + 1; j < heavy.length; j++)
            applyForces(heavy[i], heavy[j], true);
    for (const h of heavy)
        for (const l of light)
            applyForces(l, h, false);

    if (animate.frame % 3 === 0) particles.sort((a, b) => b.z - a.z);
    animate.frame = (animate.frame ?? 0) + 1;

    particles.forEach(p => {
        p.vx += (Math.random() - 0.5) * CONFIG.brownian / p.inertia;
        p.vy += (Math.random() - 0.5) * CONFIG.brownian / p.inertia;
        p.vz  = p.vz * 0.88 + (Z_CENTER - p.z) * 0.002;

        const maxSpd = 1.5 + p.mass * 0.2;
        const spd    = Math.hypot(p.vx, p.vy);
        if (spd > maxSpd) { p.vx *= maxSpd/spd; p.vy *= maxSpd/spd; }

        p.x += p.vx;  p.y += p.vy;  p.z += p.vz;
        p.vx += (p.cx - p.x) * p.centerPull;
        p.vy += (p.cy - p.y) * p.centerPull;

        p.life++;
        if (p.life > p.lifeMax) { Object.assign(p, spawnParticle()); return; }

        const { sx, sy, scale } = project(p.x, p.y, p.z);
        if (scale < 0.05) return;

        const fadeIn  = Math.min(1, p.life / p.fadeIn);
        const fadeOut = Math.max(0, 1 - Math.max(0, p.life - p.lifeMax * 0.85) / (p.lifeMax * 0.15));
        const lf      = fadeIn * fadeOut;

        const radius = Math.max(0.4, p.size * VISUAL.maxRadius * scale);
        const alpha  = (VISUAL.alphaMin + p.size * (VISUAL.alphaMax - VISUAL.alphaMin)) * lf;
        const glow   = p.size * VISUAL.maxGlow * scale * lf * p.glowMult;

        if (glow > 4) {
            ctx.shadowColor = p.color + Math.min(1, alpha * 1.5) + ')';
            ctx.shadowBlur  = glow * 2;
        }
        ctx.fillStyle = p.color + alpha + ')';
        ctx.beginPath(); ctx.arc(sx, sy, radius, 0, Math.PI * 2); ctx.fill();

        if (glow > 4) {
            ctx.shadowBlur = glow * 0.4;
            ctx.fillStyle  = p.color + Math.min(1, alpha * 1.2) + ')';
            ctx.beginPath(); ctx.arc(sx, sy, radius * 0.5, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
        }
    });

    requestAnimationFrame(animate);
}

animate();
