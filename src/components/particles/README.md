# Particles

A canvas particle system shown behind the page in night mode. Everything lives in `particles.js`; its Contents block lists the sections referred to below.

## How it works

1. **Night mode starts it.** The scene is created the first time night mode turns on (`spawnScene()`). In day mode the animation loop stops after the canvas fades out, and resumes where it left off next time (section 7).
2. **Particles belong to tiers.** Each tier in `TIERS` (section 2) sets size, mass, lifetime and glow; its colour comes from the active palette in `PALETTES`. `MIX` lists which tiers are spawned; `pct` is how common each one is. Tier 9 is a single heavy "anchor" in the centre, created separately (`makeTier9()`).
3. **Forces move them.** Every frame, heavy particles (mass ≥ 1) attract and repel each other and pull light particles toward them, with a swirl that makes them orbit. Friction and a little random jitter keep it calm (`CONFIG`).
4. **Particles live and die.** Each fades in, lives for its tier's `lifetime`, fades out and is respawned somewhere else.
5. **Pulses run through the scene** (sections 5–6). The first pulse starts from tier 9. Tiers 4 and 5 slowly charge up; once charged, a burst of 1–3 pulse rings can start, followed by 4–9 s of silence. A ring that hits a charged tier 4/5 particle can set off a new ring, which gives the chain reaction. Rings are invisible — only the particles they pass light up.
6. **Light dots draw them** (section 4). Each colour gets one soft radial-gradient sprite, drawn once and then stamped with `drawImage`, with additive blending (`'lighter'`) so overlapping light adds up. This replaces `shadowBlur`, which is too expensive per particle.

## Add-ons

- **`colorWave.js`** — clicking the page in night mode sends a pulse from the click point that recolours the particles as it spreads, moving to the next palette in `PALETTES` each time. It only uses the exports in `particles.js` section 8. To turn it off, remove its import from `src/main.js`.

## Tuning

| What | Where |
|---|---|
| Number of particles, speed, friction, forces | `CONFIG` |
| Size, brightness, halo size, core brightness | `VISUAL` |
| Which tiers exist and how common they are | `MIX`, `pct` in `TIERS` |
| Colours (one per tier, plus the core) | `PALETTES` |
| Which palette the scene starts in | `DEFAULT_PALETTE` |
| Halo at rest (few bright "stars") | `haloRest` in `TIERS` |
| Halo while a pulse passes (small ones bloom) | `haloPulse` in `TIERS` |
| Pulse speed and ring width | `RING_SPEED`, `RING_BAND` (section 5) |

## Limitations

- On screens narrower than 768 px, `CONFIG.count` drops from 250 to 80 particles. This is decided once, on page load.
- The canvas is drawn at CSS pixel size, not device pixels, so on high-density (retina) screens the particles are slightly soft.
