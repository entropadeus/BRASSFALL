/**
 * Constants - Game configuration constants
 */
export const Constants = {
    // Particle limits
    MAX_BLOOD_PARTICLES: 120,
    MAX_SPARKS: 60,
    MAX_DEBRIS: 40,

    // Update intervals
    SHADOW_UPDATE_INTERVAL: 3, // Update shadows every 3 frames
    HUD_UPDATE_INTERVAL: 2, // Update HUD every 2 frames

    // Pickup system
    PICKUP_SPAWN_INTERVAL: 15, // Seconds between potential spawns
    MAX_PICKUPS: 5, // Maximum pickups on field at once

    // Health regeneration
    HEALTH_REGEN_DELAY: 5.0, // Seconds without damage before regen starts
    HEALTH_REGEN_RATE: 15, // Health per second when regenerating

    // Mouse input
    MAX_MOUSE_DELTA: 150, // Maximum mouse movement delta to prevent glitches

    // Map dimensions
    MAP_SIZE: 140,
    MAP_HALF: 70,
    HILL_RADIUS: 18,
    HILL_HEIGHT: 5,
    HILL_CENTER_X: 0,
    HILL_CENTER_Z: 0,
    ROOF_HEIGHT: 30,

    // Player physics
    BASE_SPEED: 9.0,
    SPRINT_MULTIPLIER: 1.8,
    SPEED_BOOST_MULTIPLIER: 1.5,
    GRAVITY: 35,
    JUMP_FORCE: 12,
    PLAYER_RADIUS: 0.5,
    EYE_HEIGHT: 5,

    // Zombie physics
    ZOMBIE_RADIUS: 0.6,

    // Weapon configs
    AK47_FIRE_RATE: 0.1,
    AK47_DAMAGE: 25,
    AK47_MAG_SIZE: 30,
    AK47_RESERVE_AMMO: 90,

    SNIPER_FIRE_RATE: 1.2,
    SNIPER_DAMAGE: 100,
    SNIPER_MAG_SIZE: 5,
    SNIPER_RESERVE_AMMO: 20,

    SHOTGUN_FIRE_RATE: 0.8,
    SHOTGUN_DAMAGE: 15,
    SHOTGUN_PELLETS: 8,
    SHOTGUN_MAG_SIZE: 8,
    SHOTGUN_RESERVE_AMMO: 32,

    // Power-up durations (seconds)
    SPEED_BOOST_DURATION: 10,
    DAMAGE_BOOST_DURATION: 10,
    RAPID_FIRE_DURATION: 8,
    INFINITE_AMMO_DURATION: 10,
    EXPLOSIVE_ROUNDS_DURATION: 8,
    PENETRATING_ROUNDS_DURATION: 10,
    SHIELD_DURATION: 12,

    // Multiplier system
    KILL_MULTIPLIER_MAX: 10,
    KILL_MULTIPLIER_DECAY_TIME: 3.0, // Seconds before multiplier decays

    // Wave system
    INITIAL_ZOMBIES_PER_WAVE: 10,
    ZOMBIES_PER_WAVE_INCREMENT: 5,
    WAVE_COUNTDOWN: 3, // Seconds between waves

    // Camera
    NORMAL_FOV: 90,
    AIM_FOV: 60,
    MOUSE_SENSITIVITY: 0.002,
    AIM_SENSITIVITY: 0.001
};

