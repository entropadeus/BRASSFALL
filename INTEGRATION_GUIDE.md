# Integration Guide - Completing the Game Loop

## Current Status

The modular structure is complete. All systems are extracted and organized. The remaining work is to fully integrate all systems into a working game loop.

## Integration Checklist

### 1. Weapon System Integration

**Current State**: Base classes exist (`WeaponBase`, `WeaponManager`)

**Needs**:
- [ ] Complete weapon shooting mechanics
- [ ] Raycasting for bullet hits
- [ ] Damage calculation
- [ ] Reload animations
- [ ] Shell ejection
- [ ] Muzzle flash integration

**Integration Points**:
```javascript
// In main.js Game class
import { WeaponManager } from './weapons/index.js';

// Initialize weapons
this.weaponManager = new WeaponManager({
    scene: this.scene,
    camera: this.camera,
    // ... other dependencies
});

// In update loop
this.weaponManager.update(dt);

// In input handlers
if (this.input.getIsFiring()) {
    this.weaponManager.shoot();
}
```

### 2. Enemy System Integration

**Current State**: `Zombie` class exists, `HiveMind` exists

**Needs**:
- [ ] Zombie spawning system
- [ ] Wave-based spawning
- [ ] HiveMind AI updates
- [ ] Pathfinding integration
- [ ] Death/ragdoll physics
- [ ] Damage application

**Integration Points**:
```javascript
// In main.js Game class
import { Zombie, HiveMind } from './enemies/index.js';

this.zombies = [];
this.hiveMind = new HiveMind({
    zombies: this.zombies,
    // ... other dependencies
});

// In update loop
this.hiveMind.update(dt);
for (const zombie of this.zombies) {
    zombie.update(dt, time);
}

// Spawning logic
function spawnZombie(waveNum) {
    const zombie = new Zombie(x, z, waveNum);
    this.zombies.push(zombie);
    this.scene.add(zombie.mesh);
}
```

### 3. Shooting System

**Needs**:
- [ ] Raycasting setup
- [ ] Hit detection
- [ ] Damage calculation
- [ ] Headshot detection
- [ ] Impact effects
- [ ] Blood effects

**Integration Points**:
```javascript
// In main.js
import * as THREE from 'three';

this.raycaster = new THREE.Raycaster();
this.targets = []; // For raycasting

// Shooting function
shoot() {
    this.raycaster.setFromCamera(
        new THREE.Vector2(0, 0),
        this.camera
    );
    
    const intersects = this.raycaster.intersectObjects(this.targets);
    if (intersects.length > 0) {
        const hit = intersects[0];
        // Apply damage, spawn effects, etc.
    }
}
```

### 4. Wave System

**Needs**:
- [ ] Wave progression
- [ ] Zombie count calculation
- [ ] Spawn timing
- [ ] Wave completion detection
- [ ] Between-wave countdown

**Integration Points**:
```javascript
// Wave state
this.waveState = {
    currentWave: 0,
    zombiesThisWave: 0,
    zombiesKilledThisWave: 0,
    zombiesSpawnedThisWave: 0,
    waveInProgress: false,
    betweenWaves: true,
    nextWaveCountdown: 3
};

// Wave update function
updateWaveSystem(dt) {
    if (this.waveState.betweenWaves) {
        this.waveState.nextWaveCountdown -= dt;
        if (this.waveState.nextWaveCountdown <= 0) {
            this.startNextWave();
        }
    } else {
        // Spawn zombies
        // Check wave completion
    }
}
```

### 5. Power-up Effects

**Needs**:
- [ ] Speed boost application
- [ ] Damage multiplier
- [ ] Rapid fire mode
- [ ] Infinite ammo
- [ ] Explosive rounds
- [ ] Penetrating rounds
- [ ] Shield effect
- [ ] Slow-motion

**Integration Points**:
```javascript
// In pickup collection
case 'speed':
    this.gameState.speedBoostTimer = Constants.SPEED_BOOST_DURATION;
    break;

// In movement update
const speedMultiplier = this.gameState.speedBoostTimer > 0 
    ? Constants.SPEED_BOOST_MULTIPLIER 
    : 1.0;
```

### 6. Score and Multiplier

**Needs**:
- [ ] Kill score calculation
- [ ] Multiplier application
- [ ] Score display updates
- [ ] Floating score text

**Integration Points**:
```javascript
// On zombie kill
onZombieKilled(zombie, isHeadshot) {
    const baseScore = isHeadshot ? 100 : 50;
    const multipliedScore = this.multiplier.addKill(baseScore, isHeadshot);
    this.addScore(multipliedScore);
}
```

## Implementation Order

1. **Basic Shooting** - Get raycasting and hit detection working
2. **Zombie Spawning** - Spawn zombies and basic AI
3. **Damage System** - Apply damage and handle deaths
4. **Wave System** - Implement wave progression
5. **Weapon Integration** - Complete weapon mechanics
6. **Effects Integration** - Blood, particles, impacts
7. **Power-ups** - Implement all power-up effects
8. **Polish** - UI updates, sounds, animations

## Testing Strategy

1. **Unit Tests** - Test individual modules
2. **Integration Tests** - Test module interactions
3. **Gameplay Tests** - Test full game flow
4. **Performance Tests** - Check FPS and memory

## Common Integration Patterns

### Dependency Injection
```javascript
// Good: Dependencies injected
class System {
    constructor({ dependency1, dependency2 }) {
        this.dep1 = dependency1;
        this.dep2 = dependency2;
    }
}

// Bad: Global dependencies
class System {
    constructor() {
        this.dep1 = globalDep1; // Hard to test
    }
}
```

### State Management
```javascript
// Centralized game state
this.gameState = {
    // All game state here
};

// Systems access via getter
getGameState() {
    return this.gameState;
}
```

### Update Loop Pattern
```javascript
update(dt, time) {
    // Update in order:
    // 1. Input
    // 2. Physics
    // 3. Game logic
    // 4. Effects
    // 5. UI
    // 6. Render
}
```

## Next Steps

1. Start with basic shooting and hit detection
2. Add zombie spawning
3. Implement damage system
4. Add wave progression
5. Integrate all systems
6. Test and optimize

See `MODULE_STATUS.md` for detailed status of each module.

