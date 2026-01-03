/**
 * ZombieVariants - Configuration for different zombie types
 */

export const ZOMBIE_VARIANTS = {
    normal: {
        name: 'Normal',
        scale: 1.0,
        healthMod: 1.0,
        speedMod: 1.0,
        damageMod: 1.0,
        skinColor: 0x5a6b4a,     // Gray-green
        skinColorDark: 0x3d4a35,
        shirtColor: null,        // Use default texture
        pantsColor: 0x252525,
        spawnWeight: 50          // Higher = more common
    },
    runner: {
        name: 'Runner',
        scale: 0.85,
        healthMod: 0.5,          // Low health
        speedMod: 1.8,           // Very fast
        damageMod: 0.7,
        skinColor: 0x8a9a8a,     // Pale gray
        skinColorDark: 0x6a7a6a,
        shirtColor: 0x444444,
        pantsColor: 0x333333,
        spawnWeight: 25
    },
    brute: {
        name: 'Brute',
        scale: 1.5,
        healthMod: 12.0,         // Extremely tanky
        speedMod: 0.55,          // Slow
        damageMod: 3.0,          // Hits hard
        skinColor: 0x4a2525,     // Dark red/brown
        skinColorDark: 0x351818,
        shirtColor: 0x2a1515,
        pantsColor: 0x1a1010,
        spawnWeight: 10
    },
    crawler: {
        name: 'Crawler',
        scale: 0.65,
        healthMod: 0.8,
        speedMod: 0.7,
        damageMod: 1.2,
        skinColor: 0x5a4a35,     // Rotted brown
        skinColorDark: 0x3d3020,
        shirtColor: 0x352a20,
        pantsColor: 0x252015,
        spawnWeight: 15
    }
};

/**
 * Pick random variant based on wave and weights
 * @param {number} waveNum - Current wave number
 * @returns {string} Variant name
 */
export function pickZombieVariant(waveNum) {
    // Early waves: mostly normal zombies
    // Later waves: more special variants
    const variantChance = Math.min(0.6, 0.1 + waveNum * 0.05);

    if (Math.random() > variantChance) {
        return 'normal';
    }

    // Pick weighted random variant (excluding normal for special spawn)
    const specialVariants = ['runner', 'brute', 'crawler'];
    let weights = specialVariants.map(v => {
        let w = ZOMBIE_VARIANTS[v].spawnWeight;
        // Brutes more common in later waves
        if (v === 'brute' && waveNum >= 5) w *= 1.5;
        // Runners more common early
        if (v === 'runner' && waveNum < 3) w *= 1.5;
        return w;
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let roll = Math.random() * totalWeight;

    for (let i = 0; i < specialVariants.length; i++) {
        roll -= weights[i];
        if (roll <= 0) return specialVariants[i];
    }

    return 'normal';
}

