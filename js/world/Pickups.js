import * as THREE from 'three';
import { TextureFactory } from '../utils/TextureFactory.js';

/**
 * Pickups - Manages pickup items (ammo, health, power-ups, etc.)
 * 
 * NOTE: Requires global references to:
 * - scene (THREE.Scene)
 * - camera (THREE.Camera)
 * - Various game state variables (reserve, playerHealth, etc.)
 * - playSound, addScore, updateHUD functions
 */
export const PICKUP_TYPES = {
    ammo: { color: 0xffaa00, glowColor: 0xffcc00, height: 0.4, label: 'AMMO', rarity: 1 },
    health: { color: 0x00ff00, glowColor: 0x44ff44, height: 0.5, label: '+HEALTH', rarity: 1 },
    speed: { color: 0x00ffff, glowColor: 0x44ffff, height: 0.5, label: 'SPEED BOOST!', rarity: 2 },
    damage: { color: 0xff0000, glowColor: 0xff4444, height: 0.5, label: '2X DAMAGE!', rarity: 2 },
    rapidfire: { color: 0xff8800, glowColor: 0xffaa44, height: 0.5, label: 'RAPID FIRE!', rarity: 2 },
    infiniteammo: { color: 0xffff00, glowColor: 0xffffaa, height: 0.5, label: 'INFINITE AMMO!', rarity: 3 },
    explosive: { color: 0xff4400, glowColor: 0xff6622, height: 0.5, label: 'EXPLOSIVE ROUNDS!', rarity: 3 },
    penetrating: { color: 0x8844ff, glowColor: 0xaa66ff, height: 0.5, label: 'ARMOR PIERCING!', rarity: 3 },
    shield: { color: 0x4488ff, glowColor: 0x66aaff, height: 0.5, label: 'SHIELD!', rarity: 2 },
    slowmo: { color: 0xaa00ff, glowColor: 0xcc44ff, height: 0.5, label: 'BULLET TIME!', rarity: 4 },
    nuke: { color: 0xff00ff, glowColor: 0xff44ff, height: 0.6, label: 'NUKE!', rarity: 5 }
};

export class Pickup {
    constructor(type, x, z, dependencies = {}) {
        const {
            scene,
            camera,
            getGameState = () => ({}),
            setGameState = () => {},
            playSound = () => {},
            addScore = () => {},
            updateHUD = () => {},
            showPickupText = () => {},
            triggerPowerupSlowmo = () => {},
            zombies = []
        } = dependencies;

        this.type = type;
        this.config = PICKUP_TYPES[type];
        this.scene = scene;
        this.camera = camera;
        this.getGameState = getGameState;
        this.setGameState = setGameState;
        this.playSound = playSound;
        this.addScore = addScore;
        this.updateHUD = updateHUD;
        this.showPickupText = showPickupText;
        this.triggerPowerupSlowmo = triggerPowerupSlowmo;
        this.zombies = zombies;

        // Clone from cache (fast - shares geometry/material refs)
        this.mesh = this.createPickupMesh(type);
        this.mesh.position.set(x, -4.5 + this.config.height, z);
        scene.add(this.mesh);

        // Glow effect - use cached geometry & material (zero allocation)
        this.glowGeo = new THREE.SphereGeometry(0.8, 16, 16);
        this.glowMat = new THREE.MeshBasicMaterial({
            color: this.config.glowColor,
            transparent: true,
            opacity: 0.15
        });
        this.glow = new THREE.Mesh(this.glowGeo, this.glowMat);
        this.mesh.add(this.glow);

        // Point light for visibility
        this.light = new THREE.PointLight(this.config.glowColor, 0.8, 8);
        this.light.position.set(0, 0.5, 0);
        this.mesh.add(this.light);

        this.bobOffset = Math.random() * Math.PI * 2;
        this.lifeTime = 30; // Despawn after 30 seconds
        this.collected = false;
    }

    createPickupMesh(type) {
        // Simplified mesh creation - full implementation would create detailed meshes
        const config = PICKUP_TYPES[type];
        const group = new THREE.Group();

        // Base shape (simplified - full version has detailed meshes per type)
        const baseGeo = new THREE.BoxGeometry(0.6, 0.4, 0.6);
        const baseMat = new THREE.MeshStandardMaterial({
            color: config.color,
            emissive: config.glowColor,
            emissiveIntensity: 0.3
        });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.castShadow = true;
        group.add(base);

        return group;
    }

    update(dt, time) {
        if (this.collected) return true;

        // Bob and rotate
        this.mesh.position.y = -4.5 + this.config.height + Math.sin(time * 0.003 + this.bobOffset) * 0.15;
        this.mesh.rotation.y += dt * 2;

        // Pulse glow
        this.glow.material.opacity = 0.1 + Math.sin(time * 0.005) * 0.05;
        this.light.intensity = 0.6 + Math.sin(time * 0.005) * 0.3;

        // Check pickup collision with player
        const dx = this.camera.position.x - this.mesh.position.x;
        const dz = this.camera.position.z - this.mesh.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < 2.5) {
            this.collect();
            return true;
        }

        // Lifetime
        this.lifeTime -= dt;
        if (this.lifeTime <= 0) {
            this.remove();
            return true;
        }

        // Flicker when about to despawn
        if (this.lifeTime < 5) {
            this.mesh.visible = Math.sin(time * 0.02) > 0;
        }

        return false;
    }

    collect() {
        this.collected = true;
        this.playSound('pickup');

        // Show floating text
        this.showPickupText(this.config.label, this.config.color);

        const gameState = this.getGameState();

        // Apply effect based on type
        switch (this.type) {
            case 'ammo':
                this.setGameState({ reserve: Math.min(gameState.reserve + 60, 300) });
                this.addScore(50);
                break;

            case 'health':
                this.setGameState({ 
                    playerHealth: Math.min(gameState.playerHealth + 50, gameState.maxPlayerHealth) 
                });
                this.addScore(50);
                break;

            case 'speed':
                this.setGameState({ speedBoostTimer: 10 });
                this.addScore(100);
                break;

            case 'damage':
                this.setGameState({ damageBoostTimer: 10 });
                this.addScore(100);
                break;

            case 'rapidfire':
                this.setGameState({ rapidFireTimer: 8 });
                this.addScore(150);
                break;

            case 'infiniteammo':
                this.setGameState({ infiniteAmmoTimer: 10 });
                // Also refill current mag
                const weaponState = gameState.currentWeapon || 'ak';
                if (weaponState === 'ak') {
                    this.setGameState({ ammo: 30 });
                } else if (weaponState === 'sniper') {
                    this.setGameState({ sniperAmmo: 5 });
                } else if (weaponState === 'shotgun') {
                    this.setGameState({ shotgunAmmo: 8 });
                }
                this.addScore(200);
                break;

            case 'explosive':
                this.setGameState({ explosiveRoundsTimer: 8 });
                this.addScore(200);
                break;

            case 'penetrating':
                this.setGameState({ penetratingRoundsTimer: 10 });
                this.addScore(150);
                break;

            case 'shield':
                this.setGameState({ shieldTimer: 12 });
                this.addScore(150);
                break;

            case 'slowmo':
                this.triggerPowerupSlowmo();
                this.addScore(250);
                break;

            case 'nuke':
                // Kill all zombies!
                for (const zombie of this.zombies) {
                    if (!zombie.isDead) {
                        zombie.die();
                    }
                }
                this.addScore(500);
                this.playSound('nuke');
                break;
        }

        this.updateHUD();
        this.remove();
    }

    remove() {
        this.scene.remove(this.mesh);
    }
}

export class PickupManager {
    constructor(dependencies = {}) {
        const {
            scene,
            camera,
            getGameState = () => ({}),
            setGameState = () => {},
            playSound = () => {},
            addScore = () => {},
            updateHUD = () => {},
            triggerPowerupSlowmo = () => {},
            zombies = []
        } = dependencies;

        this.scene = scene;
        this.camera = camera;
        this.getGameState = getGameState;
        this.setGameState = setGameState;
        this.playSound = playSound;
        this.addScore = addScore;
        this.updateHUD = updateHUD;
        this.triggerPowerupSlowmo = triggerPowerupSlowmo;
        this.zombies = zombies;

        this.pickups = [];
        this.lastPickupSpawnTime = 0;
        this.PICKUP_SPAWN_INTERVAL = 15; // Seconds between potential spawns
        this.MAX_PICKUPS = 5; // Maximum pickups on field at once
    }

    spawnPickup(type, x, z) {
        // Clamp to arena
        x = Math.max(-170, Math.min(170, x));
        z = Math.max(-170, Math.min(170, z));
        
        const pickup = new Pickup(type, x, z, {
            scene: this.scene,
            camera: this.camera,
            getGameState: this.getGameState,
            setGameState: this.setGameState,
            playSound: this.playSound,
            addScore: this.addScore,
            updateHUD: this.updateHUD,
            showPickupText: this.showPickupText.bind(this),
            triggerPowerupSlowmo: this.triggerPowerupSlowmo,
            zombies: this.zombies
        });
        this.pickups.push(pickup);
    }

    getRandomPickupType() {
        // Build weighted array based on rarity (lower rarity = more common)
        // Rarity 1: 40% chance, Rarity 2: 25%, Rarity 3: 18%, Rarity 4: 12%, Rarity 5: 5%
        const rarityWeights = { 1: 40, 2: 25, 3: 18, 4: 12, 5: 5 };
        const weightedTypes = [];

        for (const [type, config] of Object.entries(PICKUP_TYPES)) {
            const weight = rarityWeights[config.rarity] || 10;
            for (let i = 0; i < weight; i++) {
                weightedTypes.push(type);
            }
        }

        return weightedTypes[Math.floor(Math.random() * weightedTypes.length)];
    }

    showPickupText(text, color) {
        let textEl = document.getElementById('pickup-text');
        if (!textEl) {
            textEl = document.createElement('div');
            textEl.id = 'pickup-text';
            textEl.style.cssText = `
                position: absolute; top: 40%; left: 50%; transform: translateX(-50%);
                font-size: 32px; font-weight: bold; pointer-events: none;
                text-shadow: 0 0 10px currentColor, 0 0 20px currentColor;
                transition: opacity 0.3s, top 0.5s;
            `;
            document.body.appendChild(textEl);
        }

        textEl.textContent = text;
        textEl.style.color = '#' + color.toString(16).padStart(6, '0');
        textEl.style.opacity = '1';
        textEl.style.top = '40%';

        setTimeout(() => {
            textEl.style.opacity = '0';
            textEl.style.top = '35%';
        }, 1000);
    }

    update(dt, time) {
        // Update existing pickups
        for (let i = this.pickups.length - 1; i >= 0; i--) {
            if (this.pickups[i].update(dt, time)) {
                this.pickups.splice(i, 1);
            }
        }

        // Spawn pickups during waves (rarity-based)
        const gameState = this.getGameState();
        if (gameState.waveInProgress && this.pickups.length < this.MAX_PICKUPS) {
            const timeSec = time / 1000;
            if (timeSec - this.lastPickupSpawnTime > this.PICKUP_SPAWN_INTERVAL) {
                // Chance increases with wave number (up to 60%)
                const spawnChance = Math.min(0.3 + gameState.currentWave * 0.03, 0.6);
                if (Math.random() < spawnChance) {
                    const type = this.getRandomPickupType();
                    // Spawn at random position around player (not too close, not too far)
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 15 + Math.random() * 35;
                    const x = this.camera.position.x + Math.cos(angle) * dist;
                    const z = this.camera.position.z + Math.sin(angle) * dist;
                    this.spawnPickup(type, x, z);
                    this.lastPickupSpawnTime = timeSec;
                }
            }
        }
    }
}

