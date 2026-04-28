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
    count:    320,           // totalt antall partikler
    bg:       '0, 0, 0',    // bakgrunnsfarge (r, g, b)
    brownian: 0.003,         // tilfeldig jitter per frame
    friction: 0.975,         // bremsing per frame (1.0 = ingen, 0.95 = mye)

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
    1: { pct: 1.00, size: [0.07, 0.13], mass: 0.3, inertia:  3.0, glowMult: 0.3, repelDist:  5,            lifetime: [0.2, 0.5], color: 'rgba( 75, 130, 230, ' },
    2: { pct: 0.90, size: [0.13, 0.19], mass: 0.5, inertia:  3.0, glowMult: 0.5, repelDist:  8,            lifetime: [0.3, 0.6], color: 'rgba( 65, 120, 225, ' },
    3: { pct: 0.80, size: [0.15, 0.22], mass: 0.7, inertia:  4.0, glowMult: 0.5, repelDist: 11,            lifetime: [0.4, 0.7], color: 'rgba( 55, 108, 218, ' },

    4: { pct: 0.40, size: [0.18, 0.28], mass: 3.0, inertia:  5.0, glowMult: 0.8, centerPull: 0.00002,     lifetime: [0.5, 0.7], color: 'rgba( 60, 115, 225, ' },
    5: { pct: 0.30, size: [0.28, 0.38], mass: 4.5, inertia:  6.5, glowMult: 1.2, centerPull: 0.00005,     lifetime: [0.5, 0.7], color: 'rgba( 40,  85, 195, ' },
    6: { pct: 0.22, size: [0.38, 0.50], mass: 6.0, inertia:  8.0, glowMult: 1.6, centerPull: 0.00012,     lifetime: [0.6, 0.8], color: 'rgba( 25,  55, 165, ' },

    9: { pct: 0.04, size: [0.10, 0.16], mass: 30.0, inertia: 14.0, glowMult: 6.0, minCount: 1, maxCount: 3, lifetime: [1.4, 1.6], color: 'rgba(240, 245, 255, ' },
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
        repelDist:  t.repelDist ?? CONFIG.attract.repelDist,
        lifeMax:    rnd(t.lifetime[0], t.lifetime[1]) * 1800,
        life: 0, fadeIn: 60,
        color: t.color,
        spin:       Math.random() < 0.5 ? 1 : -1,
        ecc:        0.6 + Math.random() * 0.8,
        orbitAngle: Math.random() * Math.PI * 2,
        trail:      [],
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
    ctx.fillStyle = `rgba(${CONFIG.bg}, 0.80)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Deler partikler i tunge (mass ≥ 1) og lette for ytelse
    const cfg   = CONFIG.attract;
    const heavy = [], light = [];
    for (const p of particles) (p.mass >= 1 ? heavy : light).push(p);

    const tier9Range = Math.min(canvas.width, canvas.height) * 0.3;

    function applyForces(a, b, bidirectional) {
        const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        const maxDist = (a.tier === 9 || b.tier === 9) ? tier9Range : cfg.maxDist;
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

    particles.forEach(p => {
        p.vx *= CONFIG.friction;
        p.vy *= CONFIG.friction;
        p.vx += (Math.random() - 0.5) * CONFIG.brownian / p.inertia;
        p.vy += (Math.random() - 0.5) * CONFIG.brownian / p.inertia;
        p.vz  = p.vz * 0.88 + (Z_CENTER - p.z) * 0.002;

        const maxSpd = 1.5 + p.mass * 0.2;
        const spd    = Math.hypot(p.vx, p.vy);
        if (spd > maxSpd) { p.vx *= maxSpd/spd; p.vy *= maxSpd/spd; }

        p.x += p.vx;  p.y += p.vy;  p.z += p.vz;
        p.vx += (p.cx - p.x) * p.centerPull;
        p.vy += (p.cy - p.y) * p.centerPull;

        // Oppdater hale-historikk (ikke for tier 9 selv)
        if (p.tier !== 9) {
            p.trail.push({ x: p.x, y: p.y });
            if (p.trail.length > 20) p.trail.shift();
        }

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

        // Hale — antall punkter skalerer med hastighet
        const numPts  = p.tier === 9 ? 0 : Math.min(
            Math.floor(Math.max(0, spd - 0.25) * 14),
            p.trail.length - 1
        );
        if (numPts > 0) {
            ctx.shadowBlur = 0;
            for (let i = 0; i < numPts; i++) {
                const pt   = p.trail[p.trail.length - 1 - i];
                const pos  = project(pt.x, pt.y, p.z);
                const frac = (numPts - i) / numPts;   // 1 nær partikkelen, ~0 i halen
                ctx.fillStyle = p.color + (alpha * frac * 0.4) + ')';
                ctx.beginPath();
                ctx.arc(pos.sx, pos.sy, Math.max(0.15, radius * frac * 0.55), 0, Math.PI * 2);
                ctx.fill();
            }
        }

        if (p.tier === 9) {
            const haloR = radius * 6;
            const grad  = ctx.createRadialGradient(sx, sy, radius, sx, sy, haloR);
            grad.addColorStop(0, 'rgba(220, 230, 255, 0.18)');
            grad.addColorStop(1, 'rgba(200, 215, 255, 0)');
            ctx.shadowBlur = 0;
            ctx.fillStyle  = grad;
            ctx.beginPath(); ctx.arc(sx, sy, haloR, 0, Math.PI * 2); ctx.fill();
        }

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
