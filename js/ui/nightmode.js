function toggleNightMode() {
    const turningOn = !document.body.classList.contains('night-mode');
    document.body.classList.toggle('night-mode');

    if (turningOn) {
        particles.length = 0;
        for (let i = 0; i < CONFIG.count; i++) particles.push(spawnParticle());
        const _t9 = TIERS[9];
        particles.push({
            tier: 9, x: 0, y: 0, cx: 0, cy: 0,
            z: Z_CENTER, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, vz: 0,
            size: rnd(_t9.size[0], _t9.size[1]), mass: _t9.mass, inertia: _t9.inertia,
            glowMult: _t9.glowMult, centerPull: 0.00003, repelDist: CONFIG.attract.repelDist,
            lifeMax: Infinity, life: _t9.fadeIn, fadeIn: _t9.fadeIn,
            color: _t9.color, spin: 1, ecc: 0.6 + Math.random() * 0.8,
            orbitAngle: Math.random() * Math.PI * 2, isPulser: false, isDefaultTier9: true,
        });
        impulseRings.length = 0;
        firstPulse = true;
        firstPulseTimer = 0;
        pulseReady = false;
    }
}

const nameToggle = document.getElementById('name-toggle');
if (nameToggle) nameToggle.addEventListener('click', toggleNightMode);

const navNightToggle = document.getElementById('nav-night-toggle');
if (navNightToggle) navNightToggle.addEventListener('click', toggleNightMode);tre