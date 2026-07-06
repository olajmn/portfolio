// ──────────────────────────────────────────────
// SETUP
// ──────────────────────────────────────────────
const canvas = document.getElementById('particle-canvas');
const ctx    = canvas.getContext('2d');
function resizeCanvas() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const isMobile = window.innerWidth < 768;

const FOCAL    = 600;
const Z_CENTER = 600;


// ──────────────────────────────────────────────
// CONFIG
// ──────────────────────────────────────────────
// This is the only thing you need to change.

const CONFIG = {
    count:         isMobile ? 80 : 333,      // total number of particles
    bg:       '0, 0, 0',    // background color (r, g, b)
    speed:        0.02,      // global speed multiplier (1.0 = full, 0.5 = half speed)
    brownian:    0.002,      // random jitter per frame
    friction:    0.975,      // deceleration per frame (1.0 = none, 0.95 = a lot)

    attract: {
        maxDist:   90,       // gravity range (px)
        repelDist: 28,       // distance where repulsion starts
        pull:      0.002,    // attraction force
        push:      0.014,    // repulsion force
        swirl:     0.006,    // swirl force (creates orbits)
    },
};

const VISUAL = {
    maxRadius: 6,     // largest possible radius (px)
    alphaMin:  0.14,  // smallest opacity
    alphaMax:  0.95,  // largest opacity
    maxGlow:   18,    // largest glow blur (px)
};

// MIX — which tiers are active
const MIX = [1, 2, 3, 4, 5, 6, ];

// TIERS — properties per tier
//   pct:        relative spawn probability
//   size:       [min, max] abstract size → radius, alpha, glow
//   mass:       gravity strength
//   inertia:    inertia — high = resists forces
//   glowMult:   glow multiplier
//   centerPull: how hard the particle is pulled toward its spawn point
//   lifetime:   [min, max] lifetime as a fraction of 1800 frames
//   minCount:   always at least this many on screen
//   maxCount:   never more than this many on screen
const TIERS = {
    1: { pct: 1.00, size: [0.18, 0.28], mass: 0.3, inertia:  3.0, glowMult: 0.3, repelDist:  5,            lifetime: [0.2, 0.5], color: 'rgba( 75, 130, 230, ' },
    2: { pct: 0.90, size: [0.24, 0.33], mass: 0.5, inertia:  3.0, glowMult: 0.5, repelDist:  8,            lifetime: [0.3, 0.6], color: 'rgba( 65, 120, 225, ' },
    3: { pct: 0.80, size: [0.28, 0.38], mass: 0.7, inertia:  4.0, glowMult: 0.5, repelDist: 11,            lifetime: [0.8, 1.4], color: 'rgba( 55, 108, 218, ' },

    4: { pct: 0.40, size: [0.18, 0.28], mass: 3.0, inertia:  5.0, glowMult: 0.8, centerPull: 0.00002,     lifetime: [1.0, 1.4], color: 'rgba( 60, 115, 225, ' },
    5: { pct: 0.30, size: [0.28, 0.38], mass: 4.5, inertia:  6.5, glowMult: 1.2, centerPull: 0.00005,     lifetime: [1.0, 1.4], color: 'rgba( 40,  85, 195, ' },
    6: { pct: 0.22, size: [0.38, 0.50], mass: 6.0, inertia:  8.0, glowMult: 1.6, centerPull: 0.00012,     lifetime: [1.2, 1.6], color: 'rgba( 25,  55, 165, ' },

    9: { pct: 0.04, size: [0.14, 0.20], mass: 30.0, inertia: 14.0, glowMult: 6.0, lifetime: [2.4, 2.6], fadeStart: 0.45, fadeIn: 220, spin: 1, color: 'rgba( 20,  50, 180, ' },
};


// ──────────────────────────────────────────────
// SPAWN
// ──────────────────────────────────────────────
function rnd(min, max) { return min + Math.random() * (max - min); }

function pickTier() {
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
    const x = (Math.random() - 0.5) * canvas.width  * 1.0;
    const y = (Math.random() - 0.5) * canvas.height * 1.0;
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
        repelDist:  t.repelDist ?? CONFIG.attract.repelDist,
        lifeMax:    rnd(t.lifetime[0], t.lifetime[1]) * 1800,
        life: 0, fadeIn: t.fadeIn ?? 60,
        color: t.color,
        spin:       t.spin ?? (Math.random() < 0.5 ? 1 : -1),
        ecc:          0.6 + Math.random() * 0.8,
        orbitAngle:   Math.random() * Math.PI * 2,
        pulseStrength: 0, // immature particles start uncharged
    };
}

// Builds a tier-9 particle from TIERS[9] defaults, overridden by whatever varies per spawn site
function makeTier9(props) {
    const t = TIERS[9];
    return {
        tier: 9,
        size:       rnd(t.size[0], t.size[1]),
        mass:       t.mass,
        inertia:    t.inertia,
        glowMult:   t.glowMult,
        repelDist:  CONFIG.attract.repelDist,
        lifeMax:    Infinity,
        fadeIn:     t.fadeIn,
        color:      t.color,
        ecc:        0.6 + Math.random() * 0.8,
        orbitAngle: Math.random() * Math.PI * 2,
        ...props,
    };
}

const particles = [];
for (let i = 0; i < CONFIG.count; i++) particles.push(spawnParticle());

// Permanent tier 9 — always floating around
particles.push(makeTier9({
    x:  (Math.random() - 0.5) * canvas.width  * 0.85,
    y:  (Math.random() - 0.5) * canvas.height * 0.85,
    cx: (Math.random() - 0.5) * canvas.width  * 0.5,
    cy: (Math.random() - 0.5) * canvas.height * 0.5,
    z:  Z_CENTER,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    vz: 0,
    centerPull: 0,
    life: TIERS[9].fadeIn,
    spin: 1,
    isDefaultTier9: true,
}));


// ──────────────────────────────────────────────
// PULSE
// ──────────────────────────────────────────────
const impulseRings = [];
let RING_SPEED   = 2.8;
let RING_BAND    = 55;
let firstPulse    = true;
let firstPulseTimer = 100; // no delay — the first pulse comes right away
let pulseReady    = false; // blocks a new pulse while the system is exhausted
let silenceTimer  = 0;    // mandatory silence between bursts
let burstRemain   = 0;    // number of remaining pulses in the ongoing burst
let burstTimer    = 0;    // frames until the next pulse in the burst


// ──────────────────────────────────────────────
// ANIMATION
// ──────────────────────────────────────────────
function project(x, y, z) {
    const sc = FOCAL / Math.max(z, 1);
    return { sx: canvas.width / 2 + x * sc, sy: canvas.height / 2 + y * sc, scale: Z_CENTER / Math.max(z, 1) };
}

// These arrays are created once and reused every frame — avoids GC pressure
const heavy = [], light = [], newRings = [];

function animate() {
    ctx.fillStyle = `rgba(${CONFIG.bg}, 0.80)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Splits particles into heavy (mass ≥ 1) and light for performance
    const cfg   = CONFIG.attract;
    heavy.length = 0; light.length = 0;
    for (const p of particles) (p.mass >= 1 ? heavy : light).push(p);

    const tier9Range  = Math.min(canvas.width, canvas.height) * 0.3;

    function getTierRange(p) {
        if (p.tier === 9) return tier9Range;
        return cfg.maxDist;
    }

    function applyForces(a, b, bidirectional) {
        const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        const maxDist = Math.max(getTierRange(a), getTierRange(b));
        if (dist < 1 || dist > maxDist) return;

        const nx = dx/dist, ny = dy/dist, nz = dz/dist;
        const repelDist = Math.min(a.repelDist, b.repelDist);
        const attract   = dist > repelDist;
        const baseForce = attract ? cfg.pull * (1 - dist/maxDist) : cfg.push * (1 - dist/repelDist);

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

        const falloff = 1 - dist/maxDist;
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

    // First pulse always from tier 9, after a short delay
    if (firstPulse) {
        if (firstPulseTimer > 0) { firstPulseTimer--; }
        else {
            const t9 = particles.find(p => p.isDefaultTier9);
            if (t9) impulseRings.push({ x: t9.x, y: t9.y, r: 0, maxR: 550, alpha: 1.0 });
            firstPulse = false;
        }
    }

    // Find the average charge among tier 4/5
    const reactors = particles.filter(p => p.tier === 4 || p.tier === 5);
    const avgCharge = reactors.length
        ? reactors.reduce((s, p) => s + (p.pulseStrength ?? 0), 0) / reactors.length
        : 0;

    // A pulse can only start when the system is sufficiently charged
    if (!pulseReady && avgCharge > 0.82) pulseReady = true;

    if (silenceTimer > 0) silenceTimer--;
    if (burstTimer   > 0) burstTimer--;

    const doPulse = () => {
        const charged = reactors.filter(p => (p.pulseStrength ?? 0) > 0.8);
        const source  = charged.length ? charged : reactors;
        let wx = 0, wy = 0, wt = 0;
        for (const p of source) { const w = p.pulseStrength ?? 0; wx += p.x * w; wy += p.y * w; wt += w; }
        const ox = wt > 0 ? wx / wt : 0;
        const oy = wt > 0 ? wy / wt : 0;
        impulseRings.push({ x: ox, y: oy, r: 0, maxR: 550, alpha: 1.0 });
    };

    // Continue the ongoing burst
    if (burstRemain > 0 && burstTimer === 0) {
        doPulse();
        burstRemain--;
        if (burstRemain > 0) {
            burstTimer = 30 + Math.floor(Math.random() * 40);
        } else {
            silenceTimer = 240 + Math.floor(Math.random() * 300); // 4–9s silence
            pulseReady   = false;
        }
    }

    // Start a new burst
    if (!firstPulse && pulseReady && avgCharge > 0.75 && silenceTimer === 0 && burstRemain === 0 && Math.random() < 0.0008) {
        doPulse();
        burstRemain = 1 + Math.floor(Math.random() * 3); // 1–3 extra pulses
        burstTimer  = 30 + Math.floor(Math.random() * 40);
        pulseReady  = false;
    }

    newRings.length = 0;

    particles.forEach(p => {
        p.vx *= CONFIG.friction;
        p.vy *= CONFIG.friction;
        p.vx += (Math.random() - 0.5) * CONFIG.brownian / p.inertia;
        p.vy += (Math.random() - 0.5) * CONFIG.brownian / p.inertia;
        p.vz  = p.vz * 0.88 + (Z_CENTER - p.z) * 0.002;

        const maxSpd = 3.5 + p.mass * 0.3;
        const spd    = Math.hypot(p.vx, p.vy);
        if (spd > maxSpd) { p.vx *= maxSpd/spd; p.vy *= maxSpd/spd; }

        p.x += p.vx * CONFIG.speed;  p.y += p.vy * CONFIG.speed;  p.z += p.vz * CONFIG.speed;
        p.vx += (p.cx - p.x) * p.centerPull;
        p.vy += (p.cy - p.y) * p.centerPull;


        p.life++;
        if (p.life > p.lifeMax) { delete p.isClickTier9; Object.assign(p, spawnParticle()); return; }

        const { sx, sy, scale } = project(p.x, p.y, p.z);
        if (scale < 0.05) return;

        const smooth    = t => t * t * (3 - 2 * t);   // smoothstep: S-curve 0→1
        const fadeIn    = smooth(Math.min(1, p.life / p.fadeIn));
        const fadeStart = p.fadeStart ?? 0.85;
        const fadeOut   = smooth(Math.max(0, 1 - Math.max(0, p.life - p.lifeMax * fadeStart) / (p.lifeMax * (1 - fadeStart))));
        const lf        = fadeIn * fadeOut;

        const radius = Math.max(0.4, p.size * VISUAL.maxRadius * scale);
        const alpha  = (VISUAL.alphaMin + p.size * (VISUAL.alphaMax - VISUAL.alphaMin)) * lf;

        let impulse = 0;
        if (p.tier !== 9) {
            for (const ring of impulseRings) {
                const dist = Math.hypot(p.x - ring.x, p.y - ring.y);
                const bandFrac = 1 - Math.abs(dist - ring.r) / RING_BAND;
                if (bandFrac > 0) impulse = Math.max(impulse, bandFrac * ring.alpha * (1 - ring.r / ring.maxR));
            }
            // Particle matures gradually — pulseStrength follows the fadeIn curve
            const maturity = Math.min(1, p.life / (p.fadeIn * 3));
            if ((p.pulseStrength ?? 0) < maturity) p.pulseStrength = Math.min(maturity, (p.pulseStrength ?? 0) + 0.0013);
            const reactivity = p.pulseStrength ?? 1;
            if (impulse > 0.22 && (p.tier === 4 || p.tier === 5) && Math.random() < 0.10 * reactivity && impulseRings.length + newRings.length < 12) {
                newRings.push({ x: p.x, y: p.y, r: 0, maxR: 420, alpha: 1.0 });
                p.pulseStrength = reactivity * 0.25;
            }
        }

        const glowBoost  = 1 + impulse * 2.5;
        const glow       = p.size * VISUAL.maxGlow * scale * lf * p.glowMult * glowBoost;

        ctx.shadowBlur = 0;

        if (p.tier === 9) {
            if (!isMobile) {
                const haloR = radius * 10;
                const grad  = ctx.createRadialGradient(sx, sy, radius, sx, sy, haloR);
                grad.addColorStop(0, 'rgba( 40,  90, 220, 0.28)');
                grad.addColorStop(1, 'rgba( 20,  50, 180, 0)');
                ctx.shadowBlur = 0;
                ctx.fillStyle  = grad;
                ctx.beginPath(); ctx.arc(sx, sy, haloR, 0, Math.PI * 2); ctx.fill();

                ctx.shadowColor = 'rgba(80, 140, 255, 1.0)';
                ctx.shadowBlur  = radius * 32;
            }
            ctx.fillStyle   = 'rgba(80, 140, 255, ' + (alpha * 0.85) + ')';
            ctx.beginPath(); ctx.arc(sx, sy, radius * 2.2, 0, Math.PI * 2); ctx.fill();

            if (!isMobile) {
                ctx.shadowBlur  = radius * 14;
            }
            ctx.fillStyle   = 'rgba(160, 200, 255, ' + (alpha * 0.9) + ')';
            ctx.beginPath(); ctx.arc(sx, sy, radius * 0.7, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur  = 0;
        }

        const canGlow = !isMobile && ((p.tier === 5 || p.tier === 6 || p.tier === 9) || (p.tier >= 3 && impulse > 0.6));
        const pulseAlpha  = Math.min(1, alpha * (1 + impulse * 2.0));
        const growMult    = p.tier <= 2 ? 0.2 : 0.02;
        const pulseRadius = radius * (1 + impulse * growMult);
        if (canGlow && glow > 4) {
            ctx.shadowColor = p.color + Math.min(1, pulseAlpha * 1.5) + ')';
            ctx.shadowBlur  = glow * 2;
        }
        ctx.fillStyle = p.color + pulseAlpha + ')';
        ctx.beginPath(); ctx.arc(sx, sy, pulseRadius, 0, Math.PI * 2); ctx.fill();

        if (!isMobile && impulse > 0.3) {
            ctx.shadowBlur = 0;
            ctx.fillStyle  = `rgba(200, 225, 255, ${impulse * alpha * 0.9})`;
            ctx.beginPath(); ctx.arc(sx, sy, radius, 0, Math.PI * 2); ctx.fill();
        }

        if (canGlow && glow > 4) {
            ctx.shadowBlur = glow * 0.4;
            ctx.fillStyle  = p.color + Math.min(1, alpha * 1.2) + ')';
            ctx.beginPath(); ctx.arc(sx, sy, radius * 0.5, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
        }
    });

    for (const ring of newRings) impulseRings.push(ring);

    for (const ring of impulseRings) { ring.r += RING_SPEED; ring.alpha *= 0.9985; }
    for (let i = impulseRings.length - 1; i >= 0; i--)
        if (impulseRings[i].r > impulseRings[i].maxR) impulseRings.splice(i, 1);

    requestAnimationFrame(animate);
}

animate();

document.addEventListener('nightmode-toggle', () => {
    const turningOn = document.body.classList.contains('night-mode');
    if (turningOn) {
        particles.length = 0;
        for (let i = 0; i < CONFIG.count; i++) particles.push(spawnParticle());
        particles.push(makeTier9({
            x: 0, y: 0, cx: 0, cy: 0,
            z: Z_CENTER,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            vz: 0,
            centerPull: 0.00003,
            life: TIERS[9].fadeIn,
            spin: 1,
            isDefaultTier9: true,
        }));
        impulseRings.length = 0;
        firstPulse = true;
        firstPulseTimer = 0;
        pulseReady = false;
    }
});
