//  PARTICLES — canvas particle system (pseudo-3D, physics-based) revealed in
//  night mode. Runs only while night mode is on; see 7. Night mode.

// Contents
//  1. Setup
//  2. Config
//     - CONFIG, VISUAL, MIX, TIERS, PALETTES
//  3. Spawn
//     - rnd(), pickTier(), spawnParticle(), makeTier9(), spawnScene()
//  4. Light dots
//     - getSprite(), stamp()
//  5. Pulse state
//  6. Animation
//     - project(), animate()
//  7. Night mode
//  8. Click


// ──────────────────────────────────────────────
// 1. SETUP
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
// 2. CONFIG
// ──────────────────────────────────────────────
// Everything tunable lives in this section.

const CONFIG = {
    count:         isMobile ? 80 : 250,      // total number of particles
    bg:       '0, 0, 0',    // background color (r, g, b)
    speed:        0.015,      // global speed multiplier (1.0 = full, 0.5 = half speed)
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
    maxGlow:   18,    // largest glow strength, before compression below

    // Halo size is compressed (square root of the glow), so large particles
    // don't get huge halos and small ones stay visible
    halo: {
        scale: 2.2,   // halo radius as a multiple of the particle radius
        glow:  3.0,   // extra radius per square root of glow strength
        min:   3,     // smallest halo radius (px)
        max:   24,    // largest halo radius (px), tier 9 excluded
        swell: 0.4,   // how much a blooming halo grows while a pulse passes
    },
    coreBoost: 0.8,   // base brightness of the core
    corePulse: 1.5,   // extra core brightness while a pulse passes
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
//   haloRest:   halo strength at rest (0 = core only, 1 = full halo) — few "stars" shine
//   haloPulse:  extra halo while a pulse ring passes — small ones bloom when they blink
//   tier 9 is never spawned randomly (not in MIX) — see makeTier9()
//   colours live in PALETTES below, not here
const TIERS = {
    1: {
        pct:        1.00,
        size:       [0.18, 0.28],
        mass:       0.3,
        inertia:    3.0,
        glowMult:   0.3,
        repelDist:  5,
        lifetime:   [0.2, 0.5],
        haloRest:   0.10,
        haloPulse:  1.2,
    },
    2: {
        pct:        0.90,
        size:       [0.24, 0.33],
        mass:       0.5,
        inertia:    3.0,
        glowMult:   0.5,
        repelDist:  8,
        lifetime:   [0.3, 0.6],
        haloRest:   0.10,
        haloPulse:  1.0,
    },
    3: {
        pct:        0.80,
        size:       [0.28, 0.38],
        mass:       0.7,
        inertia:    4.0,
        glowMult:   0.5,
        repelDist:  11,
        lifetime:   [0.8, 1.4],
        haloRest:   0.15,
        haloPulse:  0.9,
    },
    4: {
        pct:        0.40,
        size:       [0.18, 0.28],
        mass:       3.0,
        inertia:    5.0,
        glowMult:   0.8,
        centerPull: 0.00002,
        lifetime:   [1.0, 1.4],
        haloRest:   0.20,
        haloPulse:  0.6,
    },
    5: {
        pct:        0.30,
        size:       [0.28, 0.38],
        mass:       4.5,
        inertia:    6.5,
        glowMult:   1.2,
        centerPull: 0.00005,
        lifetime:   [1.0, 1.4],
        haloRest:   0.30,
        haloPulse:  0.5,
    },
    6: {
        pct:        0.22,
        size:       [0.38, 0.50],
        mass:       6.0,
        inertia:    8.0,
        glowMult:   1.6,
        centerPull: 0.00012,
        lifetime:   [1.2, 1.6],
        haloRest:   0.90,
        haloPulse:  0.3,
    },
    9: {
        size:       [0.14, 0.20],
        mass:       30.0,
        inertia:    14.0,
        glowMult:   6.0,
        fadeIn:     220,
        spin:       1,
        haloRest:   1.00,
        haloPulse:  0.0,
    },
};

// PALETTES — one colour per tier, plus the bright core shared by all particles.
// Same pattern in every palette: small tiers lightest, large tiers deepest.
// Colours are 'rgba(r, g, b, ' prefixes; the alpha is added when drawing.
const PALETTES = {
    blue: {
        1:    'rgba( 75, 130, 230, ',
        2:    'rgba( 65, 120, 225, ',
        3:    'rgba( 55, 108, 218, ',
        4:    'rgba( 60, 115, 225, ',
        5:    'rgba( 40,  85, 195, ',
        6:    'rgba( 25,  55, 165, ',
        9:    'rgba( 20,  50, 180, ',
        core: 'rgba(210, 228, 255, ',
    },
    red: {
        1:    'rgba(235,  95,  90, ',
        2:    'rgba(225,  80,  78, ',
        3:    'rgba(215,  68,  66, ',
        4:    'rgba(222,  76,  72, ',
        5:    'rgba(190,  50,  50, ',
        6:    'rgba(160,  32,  36, ',
        9:    'rgba(170,  30,  35, ',
        core: 'rgba(255, 222, 215, ',
    },
    green: {
        1:    'rgba( 90, 215, 140, ',
        2:    'rgba( 78, 200, 128, ',
        3:    'rgba( 66, 188, 116, ',
        4:    'rgba( 72, 195, 122, ',
        5:    'rgba( 45, 160,  95, ',
        6:    'rgba( 28, 128,  72, ',
        9:    'rgba( 25, 135,  75, ',
        core: 'rgba(220, 255, 230, ',
    },
};

// The palette new particles are born in
const ACTIVE_PALETTE = 'blue';


// ──────────────────────────────────────────────
// 3. SPAWN
// ──────────────────────────────────────────────
function rnd(min, max) { return min + Math.random() * (max - min); }

function pickTier() {
    const total = MIX.reduce((s, id) => s + TIERS[id].pct, 0);
    let r = Math.random() * total;
    for (const id of MIX) { r -= TIERS[id].pct; if (r <= 0) return { tier: id, ...TIERS[id] }; }
    return { tier: MIX.at(-1), ...TIERS[MIX.at(-1)] };
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
        palette: ACTIVE_PALETTE,
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
        palette:    ACTIVE_PALETTE,
        spin:       t.spin,
        ecc:        0.6 + Math.random() * 0.8,
        orbitAngle: Math.random() * Math.PI * 2,
        ...props,
    };
}

// Filled by spawnScene() the first time night mode turns on
const particles = [];

function spawnScene() {
    for (let i = 0; i < CONFIG.count; i++) particles.push(spawnParticle());

    // Permanent tier 9 — starts in the center, where the first pulse comes from
    particles.push(makeTier9({
        x: 0, y: 0, cx: 0, cy: 0,
        z: Z_CENTER,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: 0,
        centerPull: 0.00003,
        life: TIERS[9].fadeIn,
        isDefaultTier9: true,
    }));
}


// ──────────────────────────────────────────────
// 4. LIGHT DOTS
// ──────────────────────────────────────────────
// One soft radial-gradient sprite per colour, drawn once and then stamped with
// drawImage. Much cheaper than shadowBlur, which is recomputed for every
// particle on every frame.
const SPRITE_SIZE = 128;
const sprites     = new Map();

function getSprite(color) {
    if (sprites.has(color)) return sprites.get(color);

    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = SPRITE_SIZE;
    const g    = sprite.getContext('2d');
    const half = SPRITE_SIZE / 2;
    const grad = g.createRadialGradient(half, half, 0, half, half, half);
    grad.addColorStop(0,    color + '1)');
    grad.addColorStop(0.15, color + '0.85)');
    grad.addColorStop(0.35, color + '0.3)');
    grad.addColorStop(0.65, color + '0.07)');
    grad.addColorStop(1,    color + '0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);

    sprites.set(color, sprite);
    return sprite;
}

// Draws a sprite centred on (x, y) with the given radius
function stamp(sprite, x, y, r) {
    ctx.drawImage(sprite, x - r, y - r, r * 2, r * 2);
}


// ──────────────────────────────────────────────
// 5. PULSE STATE
// ──────────────────────────────────────────────
const impulseRings = [];
const RING_SPEED = 2.8;
const RING_BAND  = 55;
let firstPulse    = true;  // the first pulse comes right away, from tier 9
let pulseReady    = false; // blocks a new pulse while the system is exhausted
let silenceTimer  = 0;    // mandatory silence between bursts
let burstRemain   = 0;    // number of remaining pulses in the ongoing burst
let burstTimer    = 0;    // frames until the next pulse in the burst


// ──────────────────────────────────────────────
// 6. ANIMATION
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

    // First pulse always from tier 9
    if (firstPulse) {
        const t9 = particles.find(p => p.isDefaultTier9);
        if (t9) impulseRings.push({ x: t9.x, y: t9.y, r: 0, maxR: 550, alpha: 1.0 });
        firstPulse = false;
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

    // Light adds up where particles overlap, like real light
    ctx.globalCompositeOperation = 'lighter';

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
        if (p.life > p.lifeMax) { Object.assign(p, spawnParticle()); return; }

        const { sx, sy, scale } = project(p.x, p.y, p.z);
        if (scale < 0.05) return;

        const smooth    = t => t * t * (3 - 2 * t);   // smoothstep: S-curve 0→1
        const fadeIn    = smooth(Math.min(1, p.life / p.fadeIn));
        const fadeStart = 0.85;   // fade-out starts at 85% of the lifetime
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

        const glow        = p.size * VISUAL.maxGlow * scale * lf * p.glowMult;
        const pulseAlpha  = Math.min(1, alpha * (1 + impulse * 2.0));
        const growMult    = p.tier <= 2 ? 0.2 : 0.02;
        const pulseRadius = radius * (1 + impulse * growMult);

        // Halo: the tier's soft light dot. Size is compressed so it stays close
        // between tiers; strength comes from the tier's haloRest + haloPulse.
        // Tier 9 is the scene's anchor: a larger, softer halo and a bigger core,
        // and no pulse reaction (it is the source of the first pulse).
        const tier     = TIERS[p.tier];
        const isAnchor = p.tier === 9;
        const strength = Math.min(1, tier.haloRest + impulse * tier.haloPulse);
        const H        = VISUAL.halo;
        const halo     = isAnchor
            ? Math.min(radius * 6, H.max * 1.6)
            : Math.min(H.max, Math.max(H.min, pulseRadius * H.scale + Math.sqrt(glow) * H.glow))
              * (1 + impulse * tier.haloPulse * H.swell);
        ctx.globalAlpha = (isAnchor ? alpha * 0.5 : pulseAlpha) * strength;
        const colors = PALETTES[p.palette];
        if (ctx.globalAlpha > 0.01) stamp(getSprite(colors[p.tier]), sx, sy, halo);

        // Core: a bright centre, stronger while a pulse ring passes through
        ctx.globalAlpha = Math.min(1, alpha * (VISUAL.coreBoost + impulse * VISUAL.corePulse));
        stamp(getSprite(colors.core), sx, sy, isAnchor ? radius * 2.2 : pulseRadius);
    });

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    for (const ring of newRings) impulseRings.push(ring);

    for (const ring of impulseRings) { ring.r += RING_SPEED; ring.alpha *= 0.9985; }
    for (let i = impulseRings.length - 1; i >= 0; i--)
        if (impulseRings[i].r > impulseRings[i].maxR) impulseRings.splice(i, 1);

    if (running) requestAnimationFrame(animate);
}


// ──────────────────────────────────────────────
// 7. NIGHT MODE — run only while the canvas is visible
// ──────────────────────────────────────────────
// The scene starts fresh the first time night mode turns on, then pauses
// in day mode and resumes where it left off.
let running = false;
let started = false;

// Dim the particles once the hero is scrolled past, so they don't compete
// with the text (opacity in night-mode.css)
const homeSection = document.getElementById('home');
function updateDim() {
    canvas.classList.toggle('is-dimmed', window.scrollY > homeSection.offsetHeight * 0.6);
}
window.addEventListener('scroll', updateDim, { passive: true });
updateDim();

// Keep drawing until the fade-out finishes, then stop
canvas.addEventListener('transitionend', () => {
    if (!document.body.classList.contains('night-mode')) running = false;
});

document.addEventListener('nightmode-toggle', () => {
    const turningOn = document.body.classList.contains('night-mode');
    if (!turningOn) return;

    if (!started) {
        started = true;
        spawnScene();
    }

    if (!running) {
        running = true;
        requestAnimationFrame(animate);
    }
});


// ──────────────────────────────────────────────
// 8. CLICK — send a pulse from where the page is clicked
// ──────────────────────────────────────────────
// Listens on the whole page (the canvas sits behind the content), but skips
// clicks meant for something else: links, buttons, the navbar, the name that
// toggles night mode, and clicks that end a text selection.
const CLICK_IGNORE = 'a, button, input, textarea, nav, #name-toggle';

document.addEventListener('click', (e) => {
    if (!running || !document.body.classList.contains('night-mode')) return;
    if (e.target.closest(CLICK_IGNORE)) return;
    if (window.getSelection().toString()) return;

    // Screen → scene coordinates (at Z_CENTER the projection scale is 1)
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - canvas.width / 2;
    const y = e.clientY - rect.top  - canvas.height / 2;
    impulseRings.push({ x, y, r: 0, maxR: 550, alpha: 1.0 });
});
