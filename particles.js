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
    count:         350,      // totalt antall partikler
    bg:       '0, 0, 0',    // bakgrunnsfarge (r, g, b)
    speed:        0.55,      // global fartsmultiplikator (1.0 = full, 0.5 = halvfart)
    brownian:    0.003,      // tilfeldig jitter per frame
    friction:    0.975,      // bremsing per frame (1.0 = ingen, 0.95 = mye)
    clickTier9Max:  8,       // maks antall klikk-spawnede tier 9 om gangen

    attract: {
        maxDist:   90,       // gravitasjonsrekkevidde (px)
        repelDist: 28,       // avstand der frastøtning starter
        pull:      0.002,    // attraksjonskraft
        push:      0.014,    // frastøtningskraft
        swirl:     0.006,    // svirlingskraft (skaper baner)
    },
};

const VISUAL = {
    maxRadius: 6,     // størst mulig radius (px)
    alphaMin:  0.14,  // minste opacity
    alphaMax:  0.95,  // største opacity
    maxGlow:   18,    // største glow-blur (px)
};

// MIX — hvilke tiers som er aktive
const MIX = [1, 2, 3, 4, 5, 6, ];

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
    1: { pct: 1.00, size: [0.18, 0.28], mass: 0.3, inertia:  3.0, glowMult: 0.3, repelDist:  5,            lifetime: [0.2, 0.5], color: 'rgba( 75, 130, 230, ' },
    2: { pct: 0.90, size: [0.24, 0.33], mass: 0.5, inertia:  3.0, glowMult: 0.5, repelDist:  8,            lifetime: [0.3, 0.6], color: 'rgba( 65, 120, 225, ' },
    3: { pct: 0.80, size: [0.28, 0.38], mass: 0.7, inertia:  4.0, glowMult: 0.5, repelDist: 11,            lifetime: [0.8, 1.4], color: 'rgba( 55, 108, 218, ' },

    4: { pct: 0.40, size: [0.18, 0.28], mass: 3.0, inertia:  5.0, glowMult: 0.8, centerPull: 0.00002,     lifetime: [1.0, 1.4], color: 'rgba( 60, 115, 225, ' },
    5: { pct: 0.30, size: [0.28, 0.38], mass: 4.5, inertia:  6.5, glowMult: 1.2, centerPull: 0.00005,     lifetime: [1.0, 1.4], color: 'rgba( 40,  85, 195, ' },
    6: { pct: 0.22, size: [0.38, 0.50], mass: 6.0, inertia:  8.0, glowMult: 1.6, centerPull: 0.00012,     lifetime: [1.2, 1.6], color: 'rgba( 25,  55, 165, ' },

    9: { pct: 0.04, size: [0.14, 0.20], mass: 30.0, inertia: 14.0, glowMult: 6.0, lifetime: [2.4, 2.6], fadeStart: 0.45, fadeIn: 220, spin: 1, color: 'rgba( 20,  50, 180, ' },
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
        ecc:        0.6 + Math.random() * 0.8,
        orbitAngle: Math.random() * Math.PI * 2,
        isPulser:   false,
    };
}

const particles = [];
for (let i = 0; i < CONFIG.count; i++) particles.push(spawnParticle());


// ── PROJEKSJON ──
function project(x, y, z) {
    const sc = FOCAL / Math.max(z, 1);
    return { sx: canvas.width / 2 + x * sc, sy: canvas.height / 2 + y * sc, scale: Z_CENTER / Math.max(z, 1) };
}

// ── NEURON IMPULS ──
const impulseRings = [];
const RING_SPEED   = 1.8;
const RING_BAND    = 20;
let pulseTimer = 120; // frames til neste puls

// ── TIER 10 — MUSEKLIKK ──
let mouseParticle = null;

function screenToWorld(ex, ey) {
    const r = canvas.getBoundingClientRect();
    return { x: ex - r.left - canvas.width / 2, y: ey - r.top - canvas.height / 2 };
}

function applyClickImpulse(x, y) {
    const range = Math.hypot(canvas.width, canvas.height);
    for (const p of particles) {
        if (p === mouseParticle) continue;
        const dx = x - p.x, dy = y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 1) continue;
        const falloff = Math.max(0, 1 - dist / range);
        const force = falloff * 20.0;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
    }
}

canvas.addEventListener('mousedown', e => {
    const { x, y } = screenToWorld(e.clientX, e.clientY);
    mouseParticle = {
        tier: 10, x, y, cx: x, cy: y,
        z: Z_CENTER, vx: 0, vy: 0, vz: 0,
        size: 0.12, mass: 0, inertia: 20, glowMult: 0, pullMult: 0,
        centerPull: 0, repelDist: 0,
        lifeMax: Infinity, life: 0, fadeIn: 1, fadeStart: 0.85,
        color: 'rgba(255, 255, 255, ',
        spin: 0, ecc: 1.0, orbitAngle: 0,
    };
    particles.push(mouseParticle);
    applyClickImpulse(x, y);

    const clickTier9 = particles.filter(p => p.isClickTier9);
    if (clickTier9.length >= CONFIG.clickTier9Max) {
        const oldest = clickTier9[0];
        particles.splice(particles.indexOf(oldest), 1);
    }
    {
        const t = TIERS[9];
        particles.push({
            tier: 9, x, y, cx: x, cy: y,
            z:  Z_CENTER + (Math.random() - 0.5) * 40,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            vz: (Math.random() - 0.5) * 0.05,
            size:        rnd(t.size[0], t.size[1]),
            mass:        t.mass,
            inertia:     t.inertia,
            glowMult:    t.glowMult,
            centerPull:  0,
            repelDist:   CONFIG.attract.repelDist,
            lifeMax:     rnd(t.lifetime[0], t.lifetime[1]) * 1800,
            life: 0,     fadeIn: t.fadeIn ?? 60,
            color:       t.color,
            spin:        Math.random() < 0.5 ? 1 : -1,
            ecc:         0.6 + Math.random() * 0.8,
            orbitAngle:  Math.random() * Math.PI * 2,
            isPulser:    false,
            isClickTier9: true,
        });
    }
});

canvas.addEventListener('mousemove', e => {
    if (!mouseParticle) return;
    const { x, y } = screenToWorld(e.clientX, e.clientY);
    mouseParticle.x  = x;
    mouseParticle.y  = y;
    mouseParticle.vx = 0;
    mouseParticle.vy = 0;
});

function releaseMouse() {
    if (!mouseParticle) return;
    particles.splice(particles.indexOf(mouseParticle), 1);
    mouseParticle = null;
}
canvas.addEventListener('mouseup',    releaseMouse);
canvas.addEventListener('mouseleave', releaseMouse);



// ── ANIMASJON ──
function animate() {
    ctx.fillStyle = `rgba(${CONFIG.bg}, 0.80)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Deler partikler i tunge (mass ≥ 1) og lette for ytelse
    const cfg   = CONFIG.attract;
    const heavy = [], light = [];
    for (const p of particles) (p.mass >= 1 ? heavy : light).push(p);

    const tier9Range  = Math.min(canvas.width, canvas.height) * 0.3;
    const tier10Range = Math.hypot(canvas.width, canvas.height);

    function getTierRange(p) {
        if (p.tier === 10) return tier10Range;
        if (p.tier === 9)  return tier9Range;
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
        const pullMult  = b.pullMult ?? 1;
        const baseForce = attract ? cfg.pull * pullMult * (1 - dist/maxDist) : cfg.push * (1 - dist/repelDist);

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

    pulseTimer--;
    if (pulseTimer <= 0) {
        const tier6 = particles.filter(p => p.tier === 6);

        // Fyll opp til 5 pulsere om noen har dødd og respawnet
        const pulsers = tier6.filter(p => p.isPulser);
        tier6.filter(p => !p.isPulser)
             .slice(0, 2 - pulsers.length)
             .forEach(p => p.isPulser = true);

        const tier9active = particles.filter(p => p.isClickTier9);
        const active = [...tier6.filter(p => p.isPulser), ...tier9active];
        if (active.length > 0) {
            const p = active[Math.floor(Math.random() * active.length)];
            impulseRings.push({ x: p.x, y: p.y, r: 0, maxR: 300, alpha: 1.0 });
        }
        pulseTimer = Math.round(120 + Math.random() * 120);
    }

    const newRings = [];

    particles.forEach(p => {
        // Tier 10 følger musa — ingen fysikk, bare tegning (ser ut som tier 9)
        if (p.tier === 10) {
            const { sx, sy, scale } = project(p.x, p.y, p.z);
            const t9color = 'rgba(240, 245, 255, ';
            const r       = Math.max(0.4, 0.13 * VISUAL.maxRadius * scale);
            const haloR   = r * 6;
            const grad    = ctx.createRadialGradient(sx, sy, r, sx, sy, haloR);
            grad.addColorStop(0, 'rgba(220, 230, 255, 0.18)');
            grad.addColorStop(1, 'rgba(200, 215, 255, 0)');
            ctx.shadowBlur = 0;
            ctx.fillStyle  = grad;
            ctx.beginPath(); ctx.arc(sx, sy, haloR, 0, Math.PI * 2); ctx.fill();
            ctx.shadowColor = t9color + '0.9)';
            ctx.shadowBlur  = r * VISUAL.maxGlow * scale * 6.0 * 2;
            ctx.fillStyle   = t9color + '0.92)';
            ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur  = r * VISUAL.maxGlow * scale * 6.0 * 0.4;
            ctx.fillStyle   = t9color + '1)';
            ctx.beginPath(); ctx.arc(sx, sy, r * 0.5, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur  = 0;
            return;
        }

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

        const smooth    = t => t * t * (3 - 2 * t);   // smoothstep: S-kurve 0→1
        const fadeIn    = smooth(Math.min(1, p.life / p.fadeIn));
        const fadeStart = p.fadeStart ?? 0.85;
        const fadeOut   = smooth(Math.max(0, 1 - Math.max(0, p.life - p.lifeMax * fadeStart) / (p.lifeMax * (1 - fadeStart))));
        const lf        = fadeIn * fadeOut;

        const radius = Math.max(0.4, p.size * VISUAL.maxRadius * scale);
        const alpha  = (VISUAL.alphaMin + p.size * (VISUAL.alphaMax - VISUAL.alphaMin)) * lf;

        // Felles avstandsberegning til cursor — brukes av glow og hale
        const distToMouse = mouseParticle
            ? Math.hypot(p.x - mouseParticle.x, p.y - mouseParticle.y)
            : Infinity;
        const mouseProx  = distToMouse < tier10Range
            ? 1 - distToMouse / tier10Range
            : 0;


        let impulse = 0;
        if (p.tier !== 9 && p.tier !== 10) {
            for (const ring of impulseRings) {
                const dist = Math.hypot(p.x - ring.x, p.y - ring.y);
                const bandFrac = 1 - Math.abs(dist - ring.r) / RING_BAND;
                if (bandFrac > 0) impulse = Math.max(impulse, bandFrac * ring.alpha);
            }
            if (impulse > 0.55 && (p.tier === 4 || p.tier === 5) && Math.random() < 0.12)
                newRings.push({ x: p.x, y: p.y, r: 0, maxR: 160, alpha: 0.55 });
        }

        const glowBoost  = 1 + mouseProx * 1.8 + impulse * 2.5;
        const glow       = p.size * VISUAL.maxGlow * scale * lf * p.glowMult * glowBoost;

        ctx.shadowBlur = 0;

        if (p.tier === 9) {
            const haloR = radius * 10;
            const grad  = ctx.createRadialGradient(sx, sy, radius, sx, sy, haloR);
            grad.addColorStop(0, 'rgba( 40,  90, 220, 0.28)');
            grad.addColorStop(1, 'rgba( 20,  50, 180, 0)');
            ctx.shadowBlur = 0;
            ctx.fillStyle  = grad;
            ctx.beginPath(); ctx.arc(sx, sy, haloR, 0, Math.PI * 2); ctx.fill();

            ctx.shadowColor = 'rgba(80, 140, 255, 1.0)';
            ctx.shadowBlur  = radius * 32;
            ctx.fillStyle   = 'rgba(80, 140, 255, ' + (alpha * 0.85) + ')';
            ctx.beginPath(); ctx.arc(sx, sy, radius * 2.2, 0, Math.PI * 2); ctx.fill();

            ctx.shadowBlur  = radius * 14;
            ctx.fillStyle   = 'rgba(160, 200, 255, ' + (alpha * 0.9) + ')';
            ctx.beginPath(); ctx.arc(sx, sy, radius * 0.7, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur  = 0;
        }

        const canGlow = (p.tier === 5 || p.tier === 6 || p.tier === 9);
        if (canGlow && glow > 4) {
            ctx.shadowColor = p.color + Math.min(1, alpha * 1.5) + ')';
            ctx.shadowBlur  = glow * 2;
        }
        ctx.fillStyle = p.color + alpha + ')';
        ctx.beginPath(); ctx.arc(sx, sy, radius, 0, Math.PI * 2); ctx.fill();

        if (impulse > 0.3) {
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

    for (const ring of impulseRings) ring.r += RING_SPEED;
    for (let i = impulseRings.length - 1; i >= 0; i--)
        if (impulseRings[i].r > impulseRings[i].maxR) impulseRings.splice(i, 1);

    requestAnimationFrame(animate);
}

animate();
