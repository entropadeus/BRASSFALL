/**
 * Module Verification Script
 * 
 * This script verifies that all modules can be imported correctly.
 * Run this in the browser console or as a test script.
 */

async function verifyModules() {
    const modules = [
        // Core
        () => import('./core/index.js'),
        () => import('./core/constants.js'),
        () => import('./core/Physics.js'),
        () => import('./core/Input.js'),
        
        // Utils
        () => import('./utils/index.js'),
        () => import('./utils/Spring.js'),
        () => import('./utils/Springs.js'),
        () => import('./utils/ObjectPool.js'),
        () => import('./utils/TextureFactory.js'),
        
        // Audio
        () => import('./audio/index.js'),
        () => import('./audio/AudioManager.js'),
        () => import('./audio/SoundEffects.js'),
        
        // Rendering
        () => import('./rendering/index.js'),
        () => import('./rendering/Scene.js'),
        () => import('./rendering/PostProcessing.js'),
        () => import('./rendering/Skybox.js'),
        () => import('./rendering/shaders/index.js'),
        
        // World
        () => import('./world/index.js'),
        () => import('./world/Environment.js'),
        () => import('./world/Pickups.js'),
        () => import('./world/Targets.js'),
        
        // Player
        () => import('./player/index.js'),
        () => import('./player/Movement.js'),
        () => import('./player/Camera.js'),
        () => import('./player/Player.js'),
        
        // Effects
        () => import('./effects/index.js'),
        () => import('./effects/BloodSystem.js'),
        () => import('./effects/Particles.js'),
        () => import('./effects/Impacts.js'),
        () => import('./effects/ScreenEffects.js'),
        
        // UI
        () => import('./ui/index.js'),
        () => import('./ui/HUD.js'),
        () => import('./ui/Menu.js'),
        () => import('./ui/Notifications.js'),
        () => import('./ui/Multiplier.js'),
        
        // Weapons
        () => import('./weapons/index.js'),
        () => import('./weapons/MuzzleFlash.js'),
        () => import('./weapons/WeaponBase.js'),
        () => import('./weapons/WeaponManager.js'),
        
        // Enemies
        () => import('./enemies/index.js'),
        () => import('./enemies/Zombie.js'),
        () => import('./enemies/ZombieVariants.js'),
        () => import('./enemies/HiveMind.js'),
        () => import('./enemies/ZombieMesh.js'),
    ];

    const results = {
        success: [],
        failed: []
    };

    console.log('Verifying module imports...\n');

    for (const moduleLoader of modules) {
        try {
            const module = await moduleLoader();
            const moduleName = moduleLoader.toString().match(/['"]([^'"]+)['"]/)?.[1] || 'unknown';
            results.success.push(moduleName);
            console.log(`✅ ${moduleName}`);
        } catch (error) {
            const moduleName = moduleLoader.toString().match(/['"]([^'"]+)['"]/)?.[1] || 'unknown';
            results.failed.push({ module: moduleName, error: error.message });
            console.error(`❌ ${moduleName}: ${error.message}`);
        }
    }

    console.log(`\n✅ Successfully imported: ${results.success.length} modules`);
    console.log(`❌ Failed to import: ${results.failed.length} modules`);
    
    if (results.failed.length > 0) {
        console.log('\nFailed modules:');
        results.failed.forEach(({ module, error }) => {
            console.error(`  - ${module}: ${error}`);
        });
    }

    return results;
}

// Export for use in main.js or run directly
if (typeof window !== 'undefined') {
    window.verifyModules = verifyModules;
}

export { verifyModules };

