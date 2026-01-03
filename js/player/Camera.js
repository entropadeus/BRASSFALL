import * as THREE from 'three';
import { Springs } from '../utils/Springs.js';

/**
 * Camera - Handles camera rotation, mouse look, FOV, and camera effects
 * 
 * NOTE: Requires global references to:
 * - camera (THREE.Camera)
 * - Springs object
 */
export class Camera {
    constructor(dependencies = {}) {
        const {
            camera,
            Springs
        } = dependencies;

        this.camera = camera;
        this.Spring = Springs;

        this.pitch = 0;
        this.yaw = 0;
        this.recoil = 0;
        this.currentFOV = 90;
        this.aimFOV = 60;
        this.normalFOV = 90;

        this.mouseSensitivity = 0.002;
        this.aimSensitivity = 0.001;
    }

    handleMouseMove(e, gameState) {
        const { isAiming = false, pointerLocked = false } = gameState;

        if (!pointerLocked) return;

        // Reject abnormally large mouse deltas (prevents 180-flip glitch)
        const MAX_DELTA = 150;
        let mx = e.movementX;
        let my = e.movementY;
        if (Math.abs(mx) > MAX_DELTA || Math.abs(my) > MAX_DELTA) {
            return; // Skip this frame entirely - it's a glitched input
        }

        const sens = isAiming ? this.aimSensitivity : this.mouseSensitivity;
        this.yaw -= mx * sens;
        this.pitch -= my * sens;

        // Clamp pitch to prevent flipping
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
    }

    update(dt, gameState) {
        const {
            isAiming = false,
            shakeX = 0,
            shakeY = 0,
            shakeRoll = 0
        } = gameState;

        // Update springs
        if (this.Spring) {
            // Update all springs if they exist
            const springKeys = ['bobX', 'bobY', 'bobZ', 'swayX', 'swayY', 'tilt', 'roll', 'idleSway', 'sprintBob', 'sprintTilt', 'sprintRoll', 'landingTilt', 'landing'];
            springKeys.forEach(key => {
                if (this.Spring[key] && typeof this.Spring[key].update === 'function') {
                    this.Spring[key].update(dt);
                }
            });
        }

        // Get spring values (with fallbacks)
        const bobX = this.Spring?.bobX?.position || 0;
        const bobY = this.Spring?.bobY?.position || 0;
        const bobZ = this.Spring?.bobZ?.position || 0;
        const swayX = this.Spring?.swayX?.position || 0;
        const swayY = this.Spring?.swayY?.position || 0;
        const tilt = this.Spring?.tilt?.position || 0;
        const roll = this.Spring?.roll?.position || 0;
        const idleSway = this.Spring?.idleSway?.position || 0;
        const sprintBob = this.Spring?.sprintBob?.position || 0;
        const sprintTilt = this.Spring?.sprintTilt?.position || 0;
        const sprintRoll = this.Spring?.sprintRoll?.position || 0;
        const landingTilt = this.Spring?.landingTilt?.position || 0;
        const breathe = Math.sin(Date.now() * 0.001) * 0.02;

        // Strafe tilt (simplified)
        const strafeTilt = 0; // Would be calculated from movement state

        // Camera Recoil Recovery + Screen Shake
        this.recoil = THREE.MathUtils.lerp(this.recoil, 0, 0.08);
        this.camera.rotation.set(
            this.pitch + this.recoil + shakeY * 0.018 + breathe * 0.1,
            this.yaw + shakeX * 0.018,
            (roll + shakeRoll) * 0.08 + strafeTilt * 0.5,
            'YXZ'
        );

        // FOV interpolation for aiming
        if (isAiming) {
            this.currentFOV = THREE.MathUtils.lerp(this.currentFOV, this.aimFOV, 0.15);
        } else {
            this.currentFOV = THREE.MathUtils.lerp(this.currentFOV, this.normalFOV, 0.15);
        }
        this.camera.fov = this.currentFOV;
        this.camera.updateProjectionMatrix();
    }

    addRecoil(amount) {
        this.recoil += amount;
    }

    getPitch() {
        return this.pitch;
    }

    getYaw() {
        return this.yaw;
    }

    reset() {
        this.pitch = 0;
        this.yaw = 0;
        this.recoil = 0;
        this.currentFOV = this.normalFOV;
        this.camera.fov = this.currentFOV;
        this.camera.updateProjectionMatrix();
    }
}

