import * as THREE from 'three';
import { Movement } from './Movement.js';
import { Camera } from './Camera.js';

/**
 * Player - Combines movement and camera into a player controller
 */
export class Player {
    constructor(dependencies = {}) {
        const {
            camera,
            getTerrainHeight,
            resolveCollision,
            Springs
        } = dependencies;

        this.camera = camera;
        this.movement = new Movement({
            camera,
            getTerrainHeight,
            resolveCollision,
            Springs
        });
        this.cameraController = new Camera({
            camera,
            Springs
        });
    }

    handleKeyDown(e, gameState) {
        this.movement.handleKeyDown(e, gameState);
    }

    handleKeyUp(e) {
        this.movement.handleKeyUp(e);
    }

    handleMouseMove(e, gameState) {
        this.cameraController.handleMouseMove(e, gameState);
    }

    update(dt, time, gameState) {
        this.movement.update(dt, time, gameState);
        this.cameraController.update(dt, gameState);
    }

    getMovement() {
        return this.movement;
    }

    getCamera() {
        return this.cameraController;
    }

    reset() {
        this.movement.reset();
        this.cameraController.reset();
        this.camera.position.set(0, 0, 0);
    }
}

