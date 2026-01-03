import * as THREE from 'three';
import { Springs } from '../utils/Springs.js';

/**
 * Movement - Handles player movement, jumping, and physics
 * 
 * NOTE: Requires global references to:
 * - camera (THREE.Camera)
 * - getTerrainHeight function
 * - resolveCollision function
 * - Springs object
 */
export class Movement {
    constructor(dependencies = {}) {
        const {
            camera,
            getTerrainHeight = () => -5,
            resolveCollision = (oldX, oldZ, newX, newZ, radius) => ({ x: newX, z: newZ, collided: false }),
            Springs
        } = dependencies;

        this.camera = camera;
        this.getTerrainHeight = getTerrainHeight;
        this.resolveCollision = resolveCollision;
        this.Spring = Springs;

        this.moveState = { f: false, b: false, l: false, r: false, sprint: false };
        this.velocity = new THREE.Vector3();
        this.baseSpeed = 9.0;
        this.sprintMultiplier = 1.8;
        this.speedBoostMultiplier = 1.5;

        // Jump physics
        this.verticalVelocity = 0;
        this.playerHeight = 0;
        this.currentGroundLevel = 0;
        this.gravity = 35;
        this.jumpForce = 12;
        this.isGrounded = true;
        this.canJump = true;
    }

    handleKeyDown(e, gameState) {
        const { isPaused = false, isGameOver = false, isAiming = false } = gameState;

        if (isPaused || isGameOver) return;

        switch (e.code) {
            case 'KeyW':
                this.moveState.f = true;
                break;
            case 'KeyS':
                this.moveState.b = true;
                break;
            case 'KeyA':
                this.moveState.l = true;
                break;
            case 'KeyD':
                this.moveState.r = true;
                break;
            case 'ShiftLeft':
                this.moveState.sprint = true;
                break;
            case 'Space':
                if (this.isGrounded && this.canJump) {
                    this.verticalVelocity = this.jumpForce;
                    this.isGrounded = false;
                    this.canJump = false;
                    // Slight upward weapon motion on jump
                    if (this.Spring && this.Spring.bobY) {
                        this.Spring.bobY.impulse(-1.5);
                    }
                }
                break;
        }
    }

    handleKeyUp(e) {
        switch (e.code) {
            case 'KeyW':
                this.moveState.f = false;
                break;
            case 'KeyS':
                this.moveState.b = false;
                break;
            case 'KeyA':
                this.moveState.l = false;
                break;
            case 'KeyD':
                this.moveState.r = false;
                break;
            case 'ShiftLeft':
                this.moveState.sprint = false;
                break;
            case 'Space':
                this.canJump = true;
                break;
        }
    }

    update(dt, time, gameState) {
        const {
            isPaused = false,
            isGameOver = false,
            isAiming = false,
            speedBoostTimer = 0,
            pointerLocked = false
        } = gameState;

        if (!pointerLocked || isGameOver) return;

        // Smoother deceleration for fluid feel
        const friction = this.isGrounded ? 8.0 : 3.0;
        this.velocity.x -= this.velocity.x * friction * dt;
        this.velocity.z -= this.velocity.z * friction * dt;

        const fIn = Number(this.moveState.f) - Number(this.moveState.b);
        const rIn = Number(this.moveState.r) - Number(this.moveState.l);

        // Sprinting logic - only when moving forward and not aiming
        const isSprinting = this.moveState.sprint && this.moveState.f && !isAiming && this.isGrounded;
        const speedMultiplier = speedBoostTimer > 0 ? this.speedBoostMultiplier : 1;
        const currentSpeed = (isAiming ? this.baseSpeed * 0.5 : 
                             (isSprinting ? this.baseSpeed * this.sprintMultiplier : this.baseSpeed)) * speedMultiplier;

        // Smoother acceleration
        const accel = this.isGrounded ? 12.0 : 4.0;
        if (this.moveState.f || this.moveState.b) {
            this.velocity.z += fIn * currentSpeed * accel * dt;
        }
        if (this.moveState.l || this.moveState.r) {
            this.velocity.x += rIn * currentSpeed * accel * dt;
        }

        const fwd = new THREE.Vector3();
        this.camera.getWorldDirection(fwd);
        fwd.y = 0;
        fwd.normalize();
        const rgt = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();

        // Store old position for collision resolution
        const oldX = this.camera.position.x;
        const oldZ = this.camera.position.z;

        // Calculate new position
        const newX = oldX + rgt.x * this.velocity.x * dt;
        const newZ = oldZ + rgt.z * this.velocity.x * dt;
        const finalX = newX + fwd.x * this.velocity.z * dt;
        const finalZ = newZ + fwd.z * this.velocity.z * dt;

        // Apply collision detection and resolution (player radius ~0.5)
        const playerRadius = 0.5;
        const resolved = this.resolveCollision(oldX, oldZ, finalX, finalZ, playerRadius);
        this.camera.position.x = resolved.x;
        this.camera.position.z = resolved.z;

        // Calculate dynamic ground level based on terrain height at player position
        const terrainY = this.getTerrainHeight(this.camera.position.x, this.camera.position.z);
        this.currentGroundLevel = terrainY + 5; // Eye level is 5 units above terrain

        // Jump physics
        if (!this.isGrounded) {
            this.verticalVelocity -= this.gravity * dt;
            this.playerHeight += this.verticalVelocity * dt;

            // Organic airborne weapon drift
            if (this.Spring) {
                const airTime = Math.abs(this.verticalVelocity) / this.gravity;

                // Weapon tilts based on vertical velocity
                if (this.verticalVelocity > 0) {
                    // Rising - weapon tips back slightly
                    if (this.Spring.tilt) this.Spring.tilt.target = this.verticalVelocity * 0.008;
                    if (this.Spring.bobY) this.Spring.bobY.target = -this.verticalVelocity * 0.004;
                    if (this.Spring.bobZ) this.Spring.bobZ.target = this.verticalVelocity * 0.003;
                } else {
                    // Falling - weapon tips forward, bracing for landing
                    if (this.Spring.tilt) this.Spring.tilt.target = this.verticalVelocity * 0.012;
                    if (this.Spring.bobY) this.Spring.bobY.target = -this.verticalVelocity * 0.006;
                    if (this.Spring.bobZ) this.Spring.bobZ.target = this.verticalVelocity * 0.002;
                    if (this.Spring.roll) {
                        this.Spring.roll.target = Math.sin(this.playerHeight * 2) * 0.02;
                    }
                }

                // Subtle floating sway while airborne
                if (this.Spring.swayX) {
                    this.Spring.swayX.target += Math.sin(time * 0.003) * 0.005;
                }
                if (this.Spring.idleSway) {
                    this.Spring.idleSway.target = Math.cos(time * 0.002) * 0.01;
                }
            }
        }

        // Ground collision
        const eyeHeight = 5;
        const targetHeight = this.currentGroundLevel + eyeHeight + this.playerHeight;
        const currentHeight = this.camera.position.y;

        if (currentHeight <= targetHeight) {
            // Landing
            if (!this.isGrounded) {
                const impact = Math.abs(this.verticalVelocity);
                if (impact > 5 && this.Spring && this.Spring.landing) {
                    this.Spring.landing.impulse(impact * 0.3);
                }
            }
            this.camera.position.y = targetHeight;
            this.isGrounded = true;
            this.verticalVelocity = 0;
            this.playerHeight = 0;
        } else {
            this.isGrounded = false;
        }
    }

    getMoveState() {
        return this.moveState;
    }

    getVelocity() {
        return this.velocity;
    }

    reset() {
        this.moveState = { f: false, b: false, l: false, r: false, sprint: false };
        this.velocity.set(0, 0, 0);
        this.verticalVelocity = 0;
        this.playerHeight = 0;
        this.isGrounded = true;
        this.canJump = true;
    }
}

