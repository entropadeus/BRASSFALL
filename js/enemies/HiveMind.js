import * as THREE from 'three';

/**
 * HiveMind - Shared zombie intelligence system
 * Manages flanking positions, threat awareness, and swarm behavior
 * 
 * NOTE: This requires global references to:
 * - camera (THREE.Camera)
 * - isFiring (boolean) - whether player is currently firing
 */
export const HiveMind = {
    // Shared state (updated once per frame, all zombies reference)
    playerPos: { x: 0, z: 0 },
    playerVelocity: { x: 0, z: 0 },
    threatDirection: { x: 0, z: 0 },  // Where player is shooting/aiming
    threatIntensity: 0,                 // How much threat (0-1)
    
    // Flanking system - 8 positions around player
    flankSlots: [],
    flankRadius: 8.0,                    // Distance from player for flanking
    numFlankSlots: 8,
    
    // Performance tracking
    frameCounter: 0,
    
    /**
     * Update shared intelligence (called once per frame)
     * @param {number} dt - Delta time
     * @param {THREE.Camera} camera - Player camera
     * @param {boolean} isFiring - Whether player is firing
     */
    update(dt, camera, isFiring) {
        this.frameCounter++;
        
        // Track player position and velocity
        const oldX = this.playerPos.x;
        const oldZ = this.playerPos.z;
        this.playerPos.x = camera.position.x;
        this.playerPos.z = camera.position.z;
        
        // Calculate player velocity (smoothed)
        const velX = (this.playerPos.x - oldX) / dt;
        const velZ = (this.playerPos.z - oldZ) / dt;
        this.playerVelocity.x = THREE.MathUtils.lerp(this.playerVelocity.x, velX, 0.3);
        this.playerVelocity.z = THREE.MathUtils.lerp(this.playerVelocity.z, velZ, 0.3);
        
        // Calculate threat direction (where player is aiming)
        const cameraDir = new THREE.Vector3();
        camera.getWorldDirection(cameraDir);
        this.threatDirection.x = cameraDir.x;
        this.threatDirection.z = cameraDir.z;
        
        // Update threat intensity (higher when player is shooting/aiming)
        if (isFiring) {
            this.threatIntensity = Math.min(1.0, this.threatIntensity + dt * 5);
        } else {
            this.threatIntensity = Math.max(0, this.threatIntensity - dt * 2);
        }
        
        // Precompute flank positions around player (once per frame)
        const angleStep = (Math.PI * 2) / this.numFlankSlots;
        this.flankSlots = [];
        for (let i = 0; i < this.numFlankSlots; i++) {
            const angle = i * angleStep;
            this.flankSlots.push({
                x: this.playerPos.x + Math.cos(angle) * this.flankRadius,
                z: this.playerPos.z + Math.sin(angle) * this.flankRadius,
                angle: angle,
                occupied: false,
                occupiedBy: null
            });
        }
    },
    
    /**
     * Find best available flank slot for a zombie
     * @param {Zombie} zombie - Zombie instance
     * @returns {Object|null} Flank slot or null
     */
    claimFlankSlot(zombie) {
        // Find closest unoccupied slot
        let bestSlot = null;
        let bestDist = Infinity;
        
        for (const slot of this.flankSlots) {
            if (slot.occupied && slot.occupiedBy !== zombie) continue;
            
            const dx = slot.x - zombie.mesh.position.x;
            const dz = slot.z - zombie.mesh.position.z;
            const dist = dx * dx + dz * dz; // Squared distance
            
            if (dist < bestDist) {
                bestDist = dist;
                bestSlot = slot;
            }
        }
        
        if (bestSlot) {
            // Release old slot if zombie had one
            for (const slot of this.flankSlots) {
                if (slot.occupiedBy === zombie) {
                    slot.occupied = false;
                    slot.occupiedBy = null;
                }
            }
            
            bestSlot.occupied = true;
            bestSlot.occupiedBy = zombie;
            return bestSlot;
        }
        
        return null;
    },
    
    /**
     * Release a flank slot when zombie dies or changes behavior
     * @param {Zombie} zombie - Zombie instance
     */
    releaseFlankSlot(zombie) {
        for (const slot of this.flankSlots) {
            if (slot.occupiedBy === zombie) {
                slot.occupied = false;
                slot.occupiedBy = null;
            }
        }
    }
};

