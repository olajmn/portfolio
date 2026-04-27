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
    count:      200,
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

// ── TIERS ──
// 10 particle types, named 1–10 (1 = smallest, 10 = largest)
// pct   = % of total count — all must add up to 1.0
// size  = [min, max] radius
// alpha = [min, max] opacity
// mass  = how strongly this tier pushes/pulls (multiplier)
// color = rgba string
const TIERS = {
    1:  { pct: 0.25,  size: [0.4, 0.7],  alpha: [0.15, 0.30], mass: 0.4, color: 'rgba(80,  140, 255, '  },
    2:  { pct: 0.20,  size: [0.7, 1.0],  alpha: [0.25, 0.40], mass: 0.6, color: 'rgba(80,  140, 255, '  },
    3:  { pct: 0.15,  size: [1.0, 1.4],  alpha: [0.30, 0.50], mass: 0.8, color: 'rgba(60,  110, 220, '  },
    4:  { pct: 0.12,  size: [1.4, 1.9],  alpha: [0.35, 0.55], mass: 1.0, color: 'rgba(60,  110, 220, '  },
    5:  { pct: 0.10,  size: [1.9, 2.5],  alpha: [0.40, 0.60], mass: 1.2, color: 'rgba(40,   80, 180, '  },
    6:  { pct: 0.08,  size: [2.5, 3.2],  alpha: [0.45, 0.65], mass: 1.5, color: 'rgba(20,   40, 120, '  },
    7:  { pct: 0.05,  size: [3.2, 4.2],  alpha: [0.50, 0.70], mass: 2.0, color: 'rgba(20,   40, 120, '  },
    8:  { pct: 0.03,  size: [4.2, 5.5],  alpha: [0.55, 0.75], mass: 2.8, color: 'rgba(120, 170, 255, '  },
    9:  { pct: 0.015, size: [5.5, 7.0],  alpha: [0.60, 0.80], mass: 4.0, color: 'rgba(180, 210, 255, '  },
    10: { pct: 0.005, size: [7.0, 9.0],  alpha: [0.75, 0.95], mass: 6.0, color: 'rgba(220, 235, 255, '  },
};

// Picks a random tier based on pct weights
function pickTier() {
    let r = Math.random();
    for (const [key, t] of Object.entries(TIERS)) {
        r -= t.pct;
        if (r <= 0) return { tier: parseInt(key), ...t };
    }
    return { tier: 10, ...TIERS[10] };
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
        size:  rndBetween(t.size[0],  t.size[1]),
        alpha: rndBetween(t.alpha[0], t.alpha[1]),
        mass:  t.mass,
        color: t.color,
        spin:  Math.random() < 0.5 ? 1 : -1,
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
            const avgMass = (a.mass + b.mass) / 2;
            const force   = dist < cfg.repelDist
                ? -cfg.push * (1 - dist / cfg.repelDist) * avgMass
                :  cfg.pull * (1 - dist / cfg.maxDist)  * avgMass;

            a.vx += nx * force;  a.vy += ny * force;  a.vz += nz * force * 0.2;
            b.vx -= nx * force;  b.vy -= ny * force;  b.vz -= nz * force * 0.2;

            // Swirl between neighbours
            const falloff = 1 - dist / cfg.maxDist;
            const tx = -ny, ty = nx;
            a.vx += tx * cfg.swirl * falloff * b.spin;
            a.vy += ty * cfg.swirl * falloff * b.spin;
            b.vx -= tx * cfg.swirl * falloff * a.spin;
            b.vy -= ty * cfg.swirl * falloff * a.spin;
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

        const r = p.size * scale;
        ctx.shadowColor = p.color + Math.min(1, p.alpha * 1.4) + ')';
        ctx.shadowBlur  = r * 3;
        ctx.fillStyle   = p.color + p.alpha + ')';
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(0.4, r), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    });

    requestAnimationFrame(animate);
}

animate();
