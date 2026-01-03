import * as THREE from 'three';

/**
 * MuzzleFlash - Creates and manages muzzle flash effects for weapons
 */
class MuzzleFlash {
    constructor(weaponGroup, position, scale = 1.0) {
        this.weaponGroup = weaponGroup;
        this.position = position;
        this.scale = scale;
        this.flashGroup = new THREE.Group();
        this.flashGroup.position.copy(position);
        
        // Core flash (bright white center)
        this.flashCoreMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        const flashCore = new THREE.Mesh(new THREE.PlaneGeometry(0.8 * scale, 0.8 * scale), this.flashCoreMat);
        this.flashGroup.add(flashCore);

        // Mid flash (orange/yellow)
        this.flashMidMat = new THREE.MeshBasicMaterial({
            color: 0xffaa44,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        for (let i = 0; i < 4; i++) {
            const f = new THREE.Mesh(new THREE.PlaneGeometry(1.5 * scale, 1.5 * scale), this.flashMidMat);
            f.rotation.z = (Math.PI / 4) * i;
            this.flashGroup.add(f);
        }

        // Outer flash (red/orange glow)
        this.flashOuterMat = new THREE.MeshBasicMaterial({
            color: 0xff6622,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        for (let i = 0; i < 6; i++) {
            const f = new THREE.Mesh(new THREE.PlaneGeometry(2.5 * scale, 2.5 * scale), this.flashOuterMat);
            f.rotation.z = (Math.PI / 3) * i;
            this.flashGroup.add(f);
        }

        // Flash streaks (elongated for directional feel)
        this.flashStreakMat = new THREE.MeshBasicMaterial({
            color: 0xffcc66,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        for (let i = 0; i < 3; i++) {
            const streak = new THREE.Mesh(new THREE.PlaneGeometry(0.3 * scale, 3.0 * scale), this.flashStreakMat);
            streak.rotation.z = (Math.PI / 3) * i + Math.PI / 6;
            streak.position.z = -0.5;
            this.flashGroup.add(streak);
        }

        weaponGroup.add(this.flashGroup);
    }

    trigger(intensity = 1.0) {
        const variance = 0.9 + Math.random() * 0.2;
        const flashIntensity = intensity * variance;
        
        this.flashCoreMat.opacity = flashIntensity;
        this.flashMidMat.opacity = flashIntensity * 0.9;
        this.flashOuterMat.opacity = flashIntensity * 0.7;
        this.flashStreakMat.opacity = flashIntensity * 0.8;

        // Random rotation
        this.flashGroup.rotation.z = Math.random() * Math.PI;
        this.flashGroup.scale.setScalar((this.scale * 0.75) + Math.random() * 0.5);

        // Fade out quickly
        setTimeout(() => {
            this.flashCoreMat.opacity = 0;
            this.flashMidMat.opacity = 0;
            this.flashOuterMat.opacity = 0;
            this.flashStreakMat.opacity = 0;
        }, 50);
    }

    update(deltaTime) {
        // Fade out over time
        if (this.flashCoreMat.opacity > 0) {
            this.flashCoreMat.opacity = Math.max(0, this.flashCoreMat.opacity - deltaTime * 20);
            this.flashMidMat.opacity = Math.max(0, this.flashMidMat.opacity - deltaTime * 20);
            this.flashOuterMat.opacity = Math.max(0, this.flashOuterMat.opacity - deltaTime * 20);
            this.flashStreakMat.opacity = Math.max(0, this.flashStreakMat.opacity - deltaTime * 20);
        }
    }
}

export { MuzzleFlash };

