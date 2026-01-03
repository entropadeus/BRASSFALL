/**
 * Main Entry Point - BRASSFALL
 * 
 * This file initializes all game systems and starts the game loop.
 * 
 * NOTE: This is a simplified integration. Full integration will require:
 * - Proper dependency injection for all modules
 * - Complete game state management
 * - Full game loop implementation
 * - Integration of all weapon, enemy, and effect systems
 */

import * as THREE from 'three';

// Core modules
import { Constants, Physics, Input } from './core/index.js';

// Utilities
import { Spring, Springs, ObjectPool, TextureFactory } from './utils/index.js';

// Audio
import { AudioManager, actx, playSound } from './audio/index.js';

// Rendering
import { Scene, PostProcessing, Skybox } from './rendering/index.js';

// World
import { Environment, PickupManager, TargetManager } from './world/index.js';

// Player
import { Player } from './player/index.js';

// Effects
import { BloodSystem, Particles, Impacts, ScreenEffects } from './effects/index.js';

// UI
import { HUD, Menu, Notifications, Multiplier } from './ui/index.js';

// Enemies (placeholder - full implementation in separate files)
// import { Zombie } from './enemies/Zombie.js';
// import { HiveMind } from './enemies/HiveMind.js';

// Weapons (placeholder - full implementation in separate files)
// import { WeaponManager } from './weapons/WeaponManager.js';

/**
 * Game Class - Main game controller
 */
class Game {
    constructor() {
        // Verify Three.js is available
        if (typeof THREE === 'undefined') {
            throw new Error('THREE.js is not loaded. Please include Three.js before this script.');
        }

        // Verify TWEEN is available (for animations)
        if (typeof TWEEN === 'undefined') {
            console.warn('TWEEN.js is not loaded. Some animations may not work.');
        }

        console.log('Initializing BRASSFALL game systems...');

        // Initialize core systems
        this.physics = new Physics({
            obstacles: [],
            MAP_HALF: Constants.MAP_HALF,
            HILL_RADIUS: Constants.HILL_RADIUS,
            HILL_HEIGHT: Constants.HILL_HEIGHT,
            HILL_CENTER_X: Constants.HILL_CENTER_X,
            HILL_CENTER_Z: Constants.HILL_CENTER_Z
        });

        this.input = new Input();

        // Initialize rendering
        this.sceneManager = new Scene();
        this.scene = this.sceneManager.getScene();
        this.camera = this.sceneManager.initCamera();
        this.renderer = this.sceneManager.initRenderer();
        this.composer = this.sceneManager.initComposer(this.renderer);

        // Initialize post-processing
        this.postProcessing = new PostProcessing(
            this.composer,
            this.renderer,
            this.scene,
            this.camera
        );

        // Initialize skybox (disabled for indoor)
        this.skybox = new Skybox(this.scene);

        // Initialize audio
        this.audioManager = new AudioManager();
        window.playSound = playSound; // Global access for compatibility

        // Initialize world
        this.environment = new Environment({
            scene: this.scene,
            camera: this.camera
        });
        this.environment.init();
        this.physics.setObstacles(this.environment.getObstacles());

        // Initialize player
        this.player = new Player({
            camera: this.camera,
            getTerrainHeight: (x, z) => this.physics.getTerrainHeight(x, z),
            resolveCollision: (oldX, oldZ, newX, newZ, radius) => 
                this.physics.resolveCollision(oldX, oldZ, newX, newZ, radius),
            Springs: Springs
        });

        // Initialize effects
        this.bloodSystem = new BloodSystem({
            scene: this.scene,
            obstacles: this.environment.getObstacles(),
            zombies: [], // Will be populated when enemies are initialized
            Springs: Springs,
            playSound: playSound,
            MAX_BLOOD_PARTICLES: Constants.MAX_BLOOD_PARTICLES
        });

        this.particles = new Particles({
            scene: this.scene,
            MAX_SPARKS: Constants.MAX_SPARKS,
            MAX_DEBRIS: Constants.MAX_DEBRIS
        });

        this.impacts = new Impacts({
            scene: this.scene,
            obstacles: this.environment.getObstacles(),
            zombies: [],
            Springs: Springs,
            playSound: playSound
        });

        this.screenEffects = new ScreenEffects();

        // Initialize pickups
        this.pickupManager = new PickupManager({
            scene: this.scene,
            camera: this.camera,
            getGameState: () => this.getGameState(),
            setGameState: (state) => this.setGameState(state),
            playSound: playSound,
            addScore: (points) => this.addScore(points),
            updateHUD: () => this.hud.update(),
            triggerPowerupSlowmo: () => {}, // TODO: Implement slow-mo
            zombies: []
        });

        // Initialize targets
        this.targetManager = new TargetManager({
            scene: this.scene,
            camera: this.camera,
            obstacles: this.environment.getObstacles()
        });
        this.targetManager.init();

        // Initialize UI
        this.hud = new HUD({
            getGameState: () => this.getGameState(),
            getWeaponState: () => this.getWeaponState()
        });

        this.menu = new Menu({
            restartGame: () => this.restart(),
            AudioManager: this.audioManager
        });

        this.notifications = new Notifications();
        this.multiplier = new Multiplier({
            AudioManager: this.audioManager,
            playSound: playSound
        });

        // Make audio context available to multiplier
        this.audioManager.actx = actx;

        // Game state
        this.gameState = {
            isPaused: false,
            isGameOver: false,
            playerHealth: 100,
            maxPlayerHealth: 100,
            score: 0,
            currentWave: 0,
            zombiesThisWave: 0,
            zombiesKilledThisWave: 0,
            waveInProgress: false,
            betweenWaves: true,
            isAiming: false,
            currentWeapon: 'ak',
            ammo: 30,
            reserve: 90,
            sniperAmmo: 5,
            shotgunAmmo: 8,
            isReloading: false,
            speedBoostTimer: 0,
            damageBoostTimer: 0,
            rapidFireTimer: 0,
            infiniteAmmoTimer: 0,
            explosiveRoundsTimer: 0,
            penetratingRoundsTimer: 0,
            shieldTimer: 0,
            isRegenerating: false,
            pointerLocked: false,
            shakeX: 0,
            shakeY: 0,
            shakeRoll: 0
        };

        // Setup input handlers
        this.setupInputHandlers();

        // Setup resize handler
        window.addEventListener('resize', () => {
            this.sceneManager.handleResize();
            this.postProcessing.handleResize();
        });

        // Initialize HUD
        this.hud.update(true);
    }

    setupInputHandlers() {
        document.addEventListener('keydown', (e) => {
            this.input.handleKeyDown(e, {
                onPause: () => this.menu.togglePause(),
                onReload: () => {}, // TODO: Implement reload
                onWeaponSwitch: (weapon) => {}, // TODO: Implement weapon switch
                onMoveStateChange: (moveState) => {
                    this.player.getMovement().moveState = moveState;
                },
                onJump: () => {
                    this.player.getMovement().handleKeyDown(e, this.gameState);
                }
            });
            this.player.handleKeyDown(e, this.gameState);
        });

        document.addEventListener('keyup', (e) => {
            this.input.handleKeyUp(e, {
                onMoveStateChange: (moveState) => {
                    this.player.getMovement().moveState = moveState;
                }
            });
            this.player.handleKeyUp(e);
        });

        document.addEventListener('mousedown', (e) => {
            this.input.handleMouseDown(e, {
                onRequestPointerLock: () => {
                    this.input.requestPointerLock();
                },
                onFireStart: () => {}, // TODO: Implement fire
                onAimStart: () => {
                    this.gameState.isAiming = true;
                }
            });
        });

        document.addEventListener('mouseup', (e) => {
            this.input.handleMouseUp(e, {
                onFireStop: () => {}, // TODO: Implement fire stop
                onAimStop: () => {
                    this.gameState.isAiming = false;
                }
            });
        });

        document.addEventListener('mousemove', (e) => {
            this.input.handleMouseMove(e, {
                onMouseMove: (e) => {
                    this.player.handleMouseMove(e, this.gameState);
                }
            });
            this.player.handleMouseMove(e, this.gameState);
        });

        document.addEventListener('wheel', (e) => {
            this.input.handleMouseWheel(e, {
                currentWeapon: this.gameState.currentWeapon,
                onWeaponSwitch: (weapon) => {} // TODO: Implement weapon switch
            });
        });
    }

    getGameState() {
        return this.gameState;
    }

    getWeaponState() {
        return {
            ammo: this.gameState.ammo,
            sniperAmmo: this.gameState.sniperAmmo,
            shotgunAmmo: this.gameState.shotgunAmmo,
            sniperMagSize: 5,
            shotgunMagSize: 8
        };
    }

    setGameState(updates) {
        Object.assign(this.gameState, updates);
    }

    addScore(points) {
        this.gameState.score += points;
        this.hud.update();
    }

    restart() {
        // Reset game state
        this.gameState = {
            isPaused: false,
            isGameOver: false,
            playerHealth: 100,
            maxPlayerHealth: 100,
            score: 0,
            currentWave: 0,
            zombiesThisWave: 0,
            zombiesKilledThisWave: 0,
            waveInProgress: false,
            betweenWaves: true,
            isAiming: false,
            currentWeapon: 'ak',
            ammo: 30,
            reserve: 90,
            sniperAmmo: 5,
            shotgunAmmo: 8,
            isReloading: false,
            speedBoostTimer: 0,
            damageBoostTimer: 0,
            rapidFireTimer: 0,
            infiniteAmmoTimer: 0,
            explosiveRoundsTimer: 0,
            penetratingRoundsTimer: 0,
            shieldTimer: 0,
            isRegenerating: false,
            pointerLocked: false,
            shakeX: 0,
            shakeY: 0,
            shakeRoll: 0
        };

        // Reset player
        this.player.reset();
        this.camera.position.set(0, 0, 0);

        // Reset UI
        this.hud.update(true);
        this.menu.hideGameOver();

        // Request pointer lock
        this.input.requestPointerLock();
    }

    update(dt, time) {
        // Update TWEEN animations (uses real time, not scaled)
        if (typeof TWEEN !== 'undefined') {
            TWEEN.update(time);
        }

        // Update pointer lock state
        this.gameState.pointerLocked = this.input.getPointerLocked();

        if (this.gameState.isPaused || this.gameState.isGameOver) {
            this.postProcessing.render();
            return;
        }

        // Update Springs (if needed globally)
        // Note: Individual systems update their own springs

        // Update player
        this.player.update(dt, time, this.gameState);

        // Update effects
        this.bloodSystem.update(dt);
        this.particles.update(dt);
        this.impacts.update(dt);

        // Update pickups
        this.pickupManager.update(dt, time);

        // Update targets
        this.targetManager.update(dt);

        // Update multiplier
        this.multiplier.update(dt);

        // Update post-processing
        // TODO: Calculate motion blur from camera/player velocity
        const motionBlurX = 0;
        const motionBlurY = 0;
        this.postProcessing.update(dt, motionBlurX, motionBlurY);

        // Update HUD (throttled)
        const frameCount = Math.floor(time / 1000 * 60); // Approximate frame count
        if (frameCount % Constants.HUD_UPDATE_INTERVAL === 0) {
            this.hud.update();
        }

        // Render
        this.postProcessing.render();
    }

    start() {
        let prevTime = performance.now();
        let frameCount = 0;
        
        const animate = (time) => {
            requestAnimationFrame(animate);
            
            // Calculate delta time (capped to prevent large jumps)
            const dt = Math.min((time - prevTime) / 1000, 0.1);
            prevTime = time;
            frameCount++;
            
            // Update shadow maps (throttled)
            if (frameCount % (Constants.SHADOW_UPDATE_INTERVAL * 2) === 0 && this.renderer) {
                this.renderer.shadowMap.needsUpdate = true;
            }
            
            this.update(dt, time);
        };
        
        animate(performance.now());
    }
}

// Initialize and start game
let game = null;

try {
    game = new Game();
    game.start();
    
    // Make game accessible globally for debugging
    window.game = game;
    
    console.log('✅ BRASSFALL initialized successfully');
    console.log('Game instance available at window.game');
} catch (error) {
    console.error('❌ Failed to initialize game:', error);
    console.error('Stack trace:', error.stack);
    
    // Show error to user
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        color: #f00;
        padding: 20px;
        border: 2px solid #f00;
        z-index: 10000;
        font-family: monospace;
        max-width: 600px;
    `;
    errorDiv.innerHTML = `
        <h2>Initialization Error</h2>
        <p>${error.message}</p>
        <p style="font-size: 12px; color: #888;">Check browser console for details</p>
    `;
    document.body.appendChild(errorDiv);
}

