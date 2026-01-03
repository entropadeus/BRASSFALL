# BRASSFALL - Modular Refactoring Documentation

## Overview

The codebase has been refactored from a monolithic `index.html` file (12,458 lines) into a modular structure with separate JavaScript modules for different game systems.

## Directory Structure

```
shootaz/
├── index.html              # Original monolithic file (preserved)
├── index_new.html          # New minimal HTML entry point
├── js/
│   ├── main.js            # Main game entry point
│   ├── core/              # Core game systems
│   │   ├── constants.js  # Game configuration constants
│   │   ├── Physics.js     # Collision detection and resolution
│   │   ├── Input.js       # Input handling
│   │   └── index.js
│   ├── utils/             # Utility modules
│   │   ├── Spring.js      # Spring physics class
│   │   ├── Springs.js     # Pre-configured spring instances
│   │   ├── ObjectPool.js  # Object pooling utility
│   │   ├── TextureFactory.js # Procedural texture generation
│   │   └── index.js
│   ├── audio/             # Audio system
│   │   ├── AudioManager.js # Audio context and volume management
│   │   ├── SoundEffects.js # Procedural sound effects
│   │   └── index.js
│   ├── rendering/         # Rendering system
│   │   ├── Scene.js       # Scene, camera, renderer setup
│   │   ├── PostProcessing.js # Post-processing effects pipeline
│   │   ├── Skybox.js      # Procedural skybox
│   │   ├── shaders/       # GLSL shaders
│   │   │   ├── VignetteShader.js
│   │   │   ├── ChromaticAberrationShader.js
│   │   │   ├── FilmGrainShader.js
│   │   │   ├── MotionBlurShader.js
│   │   │   ├── SSAOShader.js
│   │   │   ├── GodRaysShader.js
│   │   │   ├── DepthOfFieldShader.js
│   │   │   ├── LensFlareShader.js
│   │   │   ├── HeatDistortionShader.js
│   │   │   ├── ColorGradingShader.js
│   │   │   ├── SSRShader.js
│   │   │   ├── AtmosphericScatteringShader.js
│   │   │   ├── CelShadingShader.js
│   │   │   ├── OutlineShader.js
│   │   │   ├── SkyShader.js
│   │   │   └── index.js
│   │   └── index.js
│   ├── world/             # World/environment
│   │   ├── Environment.js  # Floor, walls, obstacles, lighting
│   │   ├── Pickups.js     # Pickup items and manager
│   │   ├── Targets.js     # Shooting targets
│   │   └── index.js
│   ├── player/            # Player systems
│   │   ├── Movement.js    # Movement controls and physics
│   │   ├── Camera.js      # Camera rotation and mouse look
│   │   ├── Player.js      # Player controller
│   │   └── index.js
│   ├── effects/           # Visual effects
│   │   ├── BloodSystem.js # Blood particles, gore, decals
│   │   ├── Particles.js   # Sparks, debris, tracers, shells
│   │   ├── Impacts.js     # Bullet impacts, explosions
│   │   ├── ScreenEffects.js # Screen-space effects
│   │   └── index.js
│   ├── ui/                # User interface
│   │   ├── HUD.js         # Heads-up display
│   │   ├── Menu.js        # Main menu, pause menu
│   │   ├── Notifications.js # Hitmarkers, notifications
│   │   ├── Multiplier.js  # Kill multiplier system
│   │   └── index.js
│   ├── weapons/           # Weapon systems
│   │   ├── MuzzleFlash.js # Muzzle flash VFX
│   │   ├── WeaponBase.js  # Base weapon class
│   │   ├── WeaponManager.js # Weapon switching and management
│   │   └── index.js
│   └── enemies/           # Enemy systems
│       ├── Zombie.js      # Zombie class
│       ├── ZombieVariants.js # Zombie type configurations
│       ├── HiveMind.js     # Swarm intelligence
│       ├── ZombieMesh.js   # Zombie mesh generation
│       └── index.js
├── styles/                # CSS files
│   ├── main.css          # Base styles
│   ├── hud.css           # HUD styles
│   ├── menu.css          # Menu styles
│   └── animations.css    # Animation styles
└── REFACTORING.md        # This file
```

## Module Dependencies

### Core Dependencies
- `core/constants.js` - No dependencies
- `core/Physics.js` - No dependencies
- `core/Input.js` - No dependencies

### Utility Dependencies
- `utils/Spring.js` - No dependencies
- `utils/Springs.js` - Depends on `Spring.js`
- `utils/ObjectPool.js` - No dependencies
- `utils/TextureFactory.js` - No dependencies

### Audio Dependencies
- `audio/AudioManager.js` - No dependencies
- `audio/SoundEffects.js` - Depends on `AudioManager.js`

### Rendering Dependencies
- `rendering/Scene.js` - No dependencies
- `rendering/PostProcessing.js` - Depends on shaders
- `rendering/Skybox.js` - Depends on `SkyShader.js`

### World Dependencies
- `world/Environment.js` - Depends on `TextureFactory.js`
- `world/Pickups.js` - Depends on `TextureFactory.js`
- `world/Targets.js` - No dependencies

### Player Dependencies
- `player/Movement.js` - Depends on `Springs.js`, `Physics.js`
- `player/Camera.js` - Depends on `Springs.js`
- `player/Player.js` - Depends on `Movement.js`, `Camera.js`

### Effects Dependencies
- `effects/BloodSystem.js` - Depends on `ObjectPool.js`
- `effects/Particles.js` - Depends on `ObjectPool.js`
- `effects/Impacts.js` - Depends on `TextureFactory.js`
- `effects/ScreenEffects.js` - No dependencies

### UI Dependencies
- `ui/HUD.js` - No dependencies (uses DOM)
- `ui/Menu.js` - Depends on `AudioManager.js`
- `ui/Notifications.js` - No dependencies
- `ui/Multiplier.js` - Depends on `AudioManager.js`

## Integration Status

### ✅ Completed
- All modules extracted and organized
- Clear separation of concerns
- Dependency injection patterns established
- Entry point structure created (`index_new.html`, `js/main.js`)

### ⚠️ Partial Integration
- `js/main.js` - Basic structure created, needs full game loop implementation
- Weapon systems - Base classes created, full weapon implementations needed
- Enemy systems - Classes exist, need integration with game loop
- Wave system - Needs implementation in main game loop

### 🔄 Remaining Work

1. **Complete Game Loop** (`js/main.js`)
   - Full integration of all systems
   - Wave spawning system
   - Zombie AI updates
   - Weapon shooting mechanics
   - Power-up effects
   - Score and multiplier systems

2. **Weapon Implementation**
   - Complete AK47, Sniper, Shotgun classes
   - Integrate with shooting mechanics
   - Shell ejection systems
   - Reload animations

3. **Enemy Integration**
   - Zombie spawning system
   - HiveMind AI updates
   - Pathfinding and collision
   - Death and ragdoll physics

4. **Testing**
   - Module import/export verification
   - Integration testing
   - Performance testing
   - Bug fixes

## Usage

### Development
1. Use `index_new.html` as the entry point
2. Modules use ES6 imports/exports
3. Run with a local server (ES modules require HTTP)
4. Check browser console for import errors

### Module Import Example
```javascript
import { Constants } from './core/constants.js';
import { Physics } from './core/Physics.js';
import { Player } from './player/Player.js';
```

## Notes

- The original `index.html` is preserved for reference
- All modules use dependency injection for testability
- Some modules still reference global state (to be refactored)
- Full integration requires implementing the complete game loop
- Performance optimizations may be needed after integration

## Next Steps

1. Complete `js/main.js` game loop
2. Implement missing weapon functionality
3. Integrate enemy spawning and AI
4. Add wave system
5. Test and debug
6. Optimize performance
7. Replace `index.html` with `index_new.html` once stable

