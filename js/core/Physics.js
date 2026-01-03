import * as THREE from 'three';

/**
 * Physics - Collision detection and resolution system
 */
export class Physics {
    constructor(dependencies = {}) {
        const {
            obstacles = [],
            MAP_HALF = 70,
            HILL_RADIUS = 18,
            HILL_HEIGHT = 5,
            HILL_CENTER_X = 0,
            HILL_CENTER_Z = 0
        } = dependencies;

        this.obstacles = obstacles;
        this.MAP_HALF = MAP_HALF;
        this.HILL_RADIUS = HILL_RADIUS;
        this.HILL_HEIGHT = HILL_HEIGHT;
        this.HILL_CENTER_X = HILL_CENTER_X;
        this.HILL_CENTER_Z = HILL_CENTER_Z;
    }

    setObstacles(obstacles) {
        this.obstacles = obstacles;
    }

    getBoundingBox(obj) {
        const box = new THREE.Box3();
        box.setFromObject(obj);
        return box;
    }

    checkCollision(x, z, radius, excludeObj = null) {
        // Check walls (map boundaries)
        if (Math.abs(x) + radius > this.MAP_HALF || Math.abs(z) + radius > this.MAP_HALF) {
            return true;
        }

        // Check obstacles
        for (const obstacle of this.obstacles) {
            if (obstacle === excludeObj) continue;

            const box = this.getBoundingBox(obstacle);
            const centerX = (box.min.x + box.max.x) / 2;
            const centerZ = (box.min.z + box.max.z) / 2;
            const sizeX = box.max.x - box.min.x;
            const sizeZ = box.max.z - box.min.z;
            const obstacleRadius = Math.max(sizeX, sizeZ) / 2;

            const dx = x - centerX;
            const dz = z - centerZ;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist < radius + obstacleRadius) {
                return true;
            }
        }

        return false;
    }

    checkCollisionAdvanced(x, z, radius, excludeObj = null) {
        // Check walls (map boundaries)
        if (Math.abs(x) + radius > this.MAP_HALF || Math.abs(z) + radius > this.MAP_HALF) {
            // Calculate normal from nearest wall
            let normalX = 0, normalZ = 0;
            if (x + radius > this.MAP_HALF) normalX = -1;
            else if (x - radius < -this.MAP_HALF) normalX = 1;
            if (z + radius > this.MAP_HALF) normalZ = -1;
            else if (z - radius < -this.MAP_HALF) normalZ = 1;

            // Normalize
            const mag = Math.sqrt(normalX * normalX + normalZ * normalZ);
            if (mag > 0) {
                normalX /= mag;
                normalZ /= mag;
            }

            return { collided: true, normalX, normalZ, isWall: true };
        }

        // Check obstacles
        for (const obstacle of this.obstacles) {
            if (obstacle === excludeObj) continue;

            const box = this.getBoundingBox(obstacle);
            const centerX = (box.min.x + box.max.x) / 2;
            const centerZ = (box.min.z + box.max.z) / 2;
            const sizeX = box.max.x - box.min.x;
            const sizeZ = box.max.z - box.min.z;
            const obstacleRadius = Math.max(sizeX, sizeZ) / 2;

            const dx = x - centerX;
            const dz = z - centerZ;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist < radius + obstacleRadius) {
                // Calculate normal (direction from obstacle to entity)
                let normalX = dx;
                let normalZ = dz;
                if (dist > 0.01) {
                    normalX /= dist;
                    normalZ /= dist;
                } else {
                    // Directly on top - push in random direction
                    const angle = Math.random() * Math.PI * 2;
                    normalX = Math.cos(angle);
                    normalZ = Math.sin(angle);
                }

                return { collided: true, normalX, normalZ, isWall: false, obstacle };
            }
        }

        return { collided: false, normalX: 0, normalZ: 0 };
    }

    resolveCollision(oldX, oldZ, newX, newZ, radius, excludeObj = null) {
        // Try new position
        const collision = this.checkCollisionAdvanced(newX, newZ, radius, excludeObj);
        if (!collision.collided) {
            return { x: newX, z: newZ, collided: false };
        }

        // Calculate movement vector
        const moveX = newX - oldX;
        const moveZ = newZ - oldZ;
        const moveMag = Math.sqrt(moveX * moveX + moveZ * moveZ);

        if (moveMag < 0.001) {
            return { x: oldX, z: oldZ, collided: true };
        }

        // Project movement onto surface (slide along obstacle)
        // Slide direction = movement - (movement dot normal) * normal
        const dotProduct = moveX * collision.normalX + moveZ * collision.normalZ;
        const slideX = moveX - dotProduct * collision.normalX;
        const slideZ = moveZ - dotProduct * collision.normalZ;

        // Try sliding position
        const slideNewX = oldX + slideX;
        const slideNewZ = oldZ + slideZ;

        if (!this.checkCollision(slideNewX, slideNewZ, radius, excludeObj)) {
            return { x: slideNewX, z: slideNewZ, collided: true };
        }

        // If slide failed, try axis-aligned movement (legacy fallback)
        // Try sliding along X axis only
        if (!this.checkCollision(newX, oldZ, radius, excludeObj)) {
            return { x: newX, z: oldZ, collided: true };
        }

        // Try sliding along Z axis only
        if (!this.checkCollision(oldX, newZ, radius, excludeObj)) {
            return { x: oldX, z: newZ, collided: true };
        }

        // Can't move, stay at old position
        return { x: oldX, z: oldZ, collided: true };
    }

    getTerrainHeight(x, z) {
        const dx = x - this.HILL_CENTER_X;
        const dz = z - this.HILL_CENTER_Z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist >= this.HILL_RADIUS) {
            return -5; // Base ground level
        }

        // Smooth cosine falloff for natural hill shape
        const ratio = dist / this.HILL_RADIUS;
        const height = this.HILL_HEIGHT * Math.cos(ratio * Math.PI / 2);
        return -5 + height;
    }

    isOnHill(x, z, margin = 2) {
        const dx = x - this.HILL_CENTER_X;
        const dz = z - this.HILL_CENTER_Z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        return dist < (this.HILL_RADIUS + margin);
    }
}

