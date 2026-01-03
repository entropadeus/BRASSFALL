import * as THREE from 'three';
import { TextureFactory } from '../utils/TextureFactory.js';

/**
 * Impacts - Manages bullet impacts, decals, explosions, and penetration effects
 * 
 * NOTE: Requires global references to:
 * - scene (THREE.Scene)
 * - obstacles (array) - for collision detection
 * - zombies (array) - for explosion damage
 * - Springs - for screen shake
 * - playSound - audio function
 */
export class Impacts {
    constructor(dependencies = {}) {
        const {
            scene,
            obstacles = [],
            zombies = [],
            Springs,
            playSound = () => {},
            envMapTex
        } = dependencies;

        this.scene = scene;
        this.obstacles = obstacles;
        this.zombies = zombies;
        this.Spring = Springs;
        this.playSound = playSound;

        // Impact arrays
        this.decals = [];

        // Create decal texture and material
        this.decalTex = TextureFactory.impact();
        this.decalMat = new THREE.MeshBasicMaterial({
            map: this.decalTex,
            transparent: true,
            polygonOffset: true,
            polygonOffsetFactor: -1
        });
    }

    spawnDecal(point, normal) {
        const decal = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), this.decalMat);
        decal.position.copy(point);
        decal.position.addScaledVector(normal, 0.01);
        decal.lookAt(point.clone().add(normal));
        decal.rotation.z = Math.random() * Math.PI * 2;
        this.scene.add(decal);
        this.decals.push({ mesh: decal, life: 10.0 }); // Fixed: 10 seconds
    }

    spawnExplosion(position, radius, damageMultiplier = 1.0, bloodSystem) {
        // Visual: expanding orange sphere
        const explosionGeo = new THREE.SphereGeometry(0.5, 16, 12);
        const explosionMat = new THREE.MeshBasicMaterial({
            color: 0xff4400,
            transparent: true,
            opacity: 0.8
        });
        const explosion = new THREE.Mesh(explosionGeo, explosionMat);
        explosion.position.copy(position);
        this.scene.add(explosion);

        // Point light for flash
        const explosionLight = new THREE.PointLight(0xff6600, 5, radius * 2);
        explosionLight.position.copy(position);
        this.scene.add(explosionLight);

        // Animate expansion and fade
        let scale = 0.5;
        let opacity = 0.8;
        const maxScale = radius * 0.5;

        const animateExplosion = () => {
            scale += 0.8;
            opacity -= 0.1;
            explosionLight.intensity -= 0.6;

            explosion.scale.setScalar(scale);
            explosionMat.opacity = Math.max(0, opacity);

            if (opacity > 0 && scale < maxScale) {
                requestAnimationFrame(animateExplosion);
            } else {
                this.scene.remove(explosion);
                this.scene.remove(explosionLight);
                explosionGeo.dispose();
                explosionMat.dispose();
            }
        };
        animateExplosion();

        // Spawn fire particles using blood system
        if (bloodSystem) {
            for (let i = 0; i < 8; i++) {
                const sprite = bloodSystem.bloodSpritePool.get();
                if (!sprite) continue;
                sprite.material = new THREE.SpriteMaterial({
                    color: Math.random() > 0.5 ? 0xff4400 : 0xffaa00,
                    transparent: true,
                    opacity: 0.9,
                    depthWrite: false
                });
                sprite.position.copy(position);
                sprite.scale.setScalar(0.2 + Math.random() * 0.3);
                sprite.visible = true;
                this.scene.add(sprite);

                const vel = new THREE.Vector3(
                    (Math.random() - 0.5) * 10,
                    Math.random() * 8 + 2,
                    (Math.random() - 0.5) * 10
                );

                bloodSystem.bloodParticles.push({
                    mesh: sprite,
                    velocity: vel,
                    life: 0.3 + Math.random() * 0.3,
                    gravity: 5,
                    type: 'explosion'
                });
            }
        }

        // AOE damage to zombies
        for (const zombie of this.zombies) {
            if (zombie.isDead) continue;
            const dist = position.distanceTo(zombie.mesh.position);
            if (dist < radius) {
                // Damage falls off with distance
                const falloff = 1 - (dist / radius);
                const damage = falloff * damageMultiplier;
                zombie.hit(position, damage);

                // Screen shake for close explosions
                if (dist < radius * 0.5 && this.Spring) {
                    this.Spring.shakeX.impulse((Math.random() - 0.5) * 3 * falloff);
                    this.Spring.shakeY.impulse(Math.random() * 2 * falloff);
                }
            }
        }

        // Play explosion sound
        this.playSound('explosion');
    }

    spawnPenetrationEffect(position, bloodSystem) {
        if (!position) return; // Guard against undefined position

        // Bright sparks at penetration point (would need spark system)
        // For now, just spawn blood spray
        if (bloodSystem) {
            const hitDir = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                Math.random(),
                (Math.random() - 0.5) * 2
            ).normalize();
            bloodSystem.spawnBloodSpray(position, hitDir, 0.5);
        }
    }

    update(dt) {
        // Update decals
        for (let i = this.decals.length - 1; i >= 0; i--) {
            const d = this.decals[i];
            d.life -= dt;

            if (d.life <= 0) {
                this.scene.remove(d.mesh);
                if (d.mesh.geometry) d.mesh.geometry.dispose();
                if (d.mesh.material) d.mesh.material.dispose();
                this.decals.splice(i, 1);
                continue;
            }

            // Fade out in last second
            if (d.life < 1.0) {
                d.mesh.material.opacity = d.life;
            }
        }
    }
}

