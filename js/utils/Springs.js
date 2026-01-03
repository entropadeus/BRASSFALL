import { Spring } from './Spring.js';

// Separate springs for different axes - ULTRA FLUID & ORGANIC feel
export const Springs = {
    // Gun sway - multi-layered for organic feel
    swayX: new Spring(65, 5, 1.4),       // Softer, more floaty
    swayY: new Spring(65, 5, 1.4),
    swayLagX: new Spring(30, 3.5, 1.8),  // More lag for fluidity
    swayLagY: new Spring(30, 3.5, 1.8),
    swayLag2X: new Spring(18, 2.5, 2.2), // Third layer of lag
    swayLag2Y: new Spring(18, 2.5, 2.2),

    // Recoil - snappy initial kick with soft follow-through
    recoilZ: new Spring(280, 14, 0.9),   // Quick snap back
    recoilX: new Spring(180, 9, 1.1),    // Muzzle climb - softer
    recoilY: new Spring(140, 8, 1.2),    // Vertical rise
    recoilRoll: new Spring(200, 12, 1),  // Rotational recoil

    // Recoil recovery (slower return to neutral)
    recoilRecoverZ: new Spring(40, 4, 2),
    recoilRecoverX: new Spring(35, 3.5, 2),

    // Movement feel - very organic
    bobY: new Spring(50, 4, 1.4),        // Floatier vertical bob
    bobX: new Spring(40, 3.5, 1.5),      // Side-to-side sway
    bobZ: new Spring(35, 3, 1.6),        // Forward/back bob (new)
    roll: new Spring(45, 4, 1.3),        // Hip roll
    tilt: new Spring(30, 3, 1.5),        // Forward lean

    // Momentum/inertia
    momentumX: new Spring(25, 2.5, 2),   // Weapon trails behind movement
    momentumZ: new Spring(25, 2.5, 2),

    // Breathing/idle - very subtle organic motion
    breathe: new Spring(15, 1.5, 2.5),   // Slow breathing
    idleSway: new Spring(8, 1, 3),       // Ultra slow idle drift
    heartbeat: new Spring(100, 8, 0.5),  // Subtle pulse

    // Screen shake - responsive but not jarring
    shakeX: new Spring(250, 16, 1),
    shakeY: new Spring(250, 16, 1),
    shakeRoll: new Spring(200, 14, 1),   // Rotational shake

    // Camera smoothing - cinematic lag
    camLagX: new Spring(80, 6, 1.2),
    camLagY: new Spring(80, 6, 1.2),

    // ADS transition smoothing
    adsTransition: new Spring(120, 10, 1),
    adsFov: new Spring(100, 8, 1),

    // Landing impact
    landing: new Spring(200, 15, 1),
    landingTilt: new Spring(150, 12, 1),

    // Sprinting effects
    sprintBob: new Spring(70, 5, 1.2),
    sprintTilt: new Spring(50, 4, 1.3),
    sprintRoll: new Spring(60, 4.5, 1.2),

    // === NEW: Attention to Detail Springs ===
    // Strafe lean - weapon and camera tilt when strafing
    strafeTilt: new Spring(80, 6, 1.2),
    strafeRoll: new Spring(60, 5, 1.3),

    // Velocity-based weapon drag (trails behind fast movements)
    velocityDragX: new Spring(40, 4, 1.5),
    velocityDragY: new Spring(40, 4, 1.5),

    // Turn inertia - weapon lags when spinning camera fast
    turnLagX: new Spring(50, 4.5, 1.4),
    turnLagY: new Spring(50, 4.5, 1.4),

    // Weapon inspection sway
    inspectRotX: new Spring(25, 3, 2),
    inspectRotY: new Spring(25, 3, 2),
    inspectRotZ: new Spring(20, 2.5, 2),

    // Bolt carrier
    boltZ: new Spring(400, 18, 0.8),

    // Dynamic crosshair
    crosshairSpread: new Spring(120, 10, 1)
};

// Velocity tracking for inertia effects
export let lastCamYaw = 0;
export let lastCamPitch = 0;
export let camVelX = 0;
export let camVelY = 0;
export let moveVelSmooth = 0;
export let moveVelX = 0;
export let moveVelZ = 0;

// === NEW: Attention to Detail State ===
export let lastStrafeInput = 0;
export let idleTime = 0;                    // Time since last movement/action
export let isInspecting = false;            // Weapon inspection mode
export let inspectPhase = 0;                // Phase of inspection animation
export let lastFireTime = 0;                // For muzzle smoke timing
export let consecutiveShots = 0;            // For heat buildup
export let crosshairBaseSize = 20;          // Base crosshair size
export let crosshairCurrentSize = 20;       // Current crosshair size
export let lastDamageDir = null;            // Direction of last damage taken
export let damageIndicatorAlpha = 0;        // Fade for damage indicator
export let lowHealthPulse = 0;              // Pulse phase for low health effects

// Organic noise for idle animations
export function organicNoise(time, frequency, octaves = 3) {
    let value = 0;
    let amplitude = 1;
    let freq = frequency;
    for (let i = 0; i < octaves; i++) {
        value += Math.sin(time * freq) * amplitude;
        value += Math.cos(time * freq * 1.3) * amplitude * 0.5;
        freq *= 2.1;
        amplitude *= 0.5;
    }
    return value;
}

