import * as THREE from 'three';
import { ObjectPool } from '../utils/ObjectPool.js';

/**
 * BloodSystem - Manages blood particles, gore chunks, decals, and pools
 * 
 * NOTE: Requires global references to:
 * - scene (THREE.Scene)
 * - obstacles (array) - for collision detection
 * - zombies (array) - for explosion damage
 * - Springs - for screen shake
 * - playSound - audio function
 * - MAX_BLOOD_PARTICLES - constant
 */
export class BloodSystem {
    constructor(dependencies = {}) {
        const {
            scene,
            obstacles = [],
            zombies = [],
            Springs,
            playSound = () => {},
            MAX_BLOOD_PARTICLES = 200
        } = dependencies;

        this.scene = scene;
        this.obstacles = obstacles;
        this.zombies = zombies;
        this.Spring = Springs;
        this.playSound = playSound;

        // Blood particle arrays
        this.bloodParticles = [];
        this.goreChunks = [];
        this.bloodDecals = [];
        this.bloodPools = [];

        // Create blood textures
        this.createBloodTextures();

        // Create materials
        this.createMaterials();

        // Create object pools
        this.bloodSpritePool = new ObjectPool(
            () => {
                const s = new THREE.Sprite(this.bloodSpriteMats[0]);
                s.visible = false;
                return s;
            },
            (s) => { s.visible = false; },
            MAX_BLOOD_PARTICLES
        );

        this.bloodMatIdx = 0;

        // Reusable vectors
        this._bloodVel = new THREE.Vector3();
        this._bloodRayDir = new THREE.Vector3();
        this._upNormal = new THREE.Vector3(0, 1, 0);
        this.bloodRaycaster = new THREE.Raycaster();
    }

    createBloodTextures() {
        // Blood splatter texture (procedural)
        const bloodTexCanvas = document.createElement('canvas');
        bloodTexCanvas.width = 64;
        bloodTexCanvas.height = 64;
        const bloodCtx = bloodTexCanvas.getContext('2d');
        const bloodGrad = bloodCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
        bloodGrad.addColorStop(0, 'rgba(180, 0, 0, 1)');
        bloodGrad.addColorStop(0.3, 'rgba(120, 0, 0, 0.8)');
        bloodGrad.addColorStop(0.7, 'rgba(80, 0, 0, 0.4)');
        bloodGrad.addColorStop(1, 'rgba(40, 0, 0, 0)');
        bloodCtx.fillStyle = bloodGrad;
        bloodCtx.fillRect(0, 0, 64, 64);
        this.bloodSpriteTex = new THREE.CanvasTexture(bloodTexCanvas);

        // Blood mist texture
        const mistTexCanvas = document.createElement('canvas');
        mistTexCanvas.width = 128;
        mistTexCanvas.height = 128;
        const mistCtx = mistTexCanvas.getContext('2d');
        const mistGrad = mistCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
        mistGrad.addColorStop(0, 'rgba(150, 0, 0, 0.6)');
        mistGrad.addColorStop(0.5, 'rgba(100, 0, 0, 0.3)');
        mistGrad.addColorStop(1, 'rgba(60, 0, 0, 0)');
        mistCtx.fillStyle = mistGrad;
        mistCtx.fillRect(0, 0, 128, 128);
        this.bloodMistTex = new THREE.CanvasTexture(mistTexCanvas);

        // Blood decal texture (splatter pattern)
        const bloodDecalCanvas = document.createElement('canvas');
        bloodDecalCanvas.width = 256;
        bloodDecalCanvas.height = 256;
        const decalCtx = bloodDecalCanvas.getContext('2d');
        decalCtx.fillStyle = 'rgba(0,0,0,0)';
        decalCtx.fillRect(0, 0, 256, 256);
        // Main splat
        decalCtx.beginPath();
        decalCtx.arc(128, 128, 60 + Math.random() * 20, 0, Math.PI * 2);
        decalCtx.fillStyle = 'rgba(100, 0, 0, 0.9)';
        decalCtx.fill();
        // Splatter droplets
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 40 + Math.random() * 80;
            const x = 128 + Math.cos(angle) * dist;
            const y = 128 + Math.sin(angle) * dist;
            const r = 3 + Math.random() * 12;
            decalCtx.beginPath();
            decalCtx.arc(x, y, r, 0, Math.PI * 2);
            decalCtx.fillStyle = `rgba(${80 + Math.random() * 40}, 0, 0, ${0.6 + Math.random() * 0.4})`;
            decalCtx.fill();
        }
        // Streaks
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            decalCtx.beginPath();
            decalCtx.moveTo(128, 128);
            const len = 50 + Math.random() * 70;
            decalCtx.lineTo(128 + Math.cos(angle) * len, 128 + Math.sin(angle) * len);
            decalCtx.strokeStyle = `rgba(90, 0, 0, ${0.5 + Math.random() * 0.3})`;
            decalCtx.lineWidth = 2 + Math.random() * 4;
            decalCtx.stroke();
        }
        this.bloodDecalTex = new THREE.CanvasTexture(bloodDecalCanvas);
    }

    createMaterials() {
        // Gore materials
        this.goreMat = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.6 });
        this.boneMat = new THREE.MeshStandardMaterial({ color: 0xf5f5dc, roughness: 0.4 });
        this.organMat = new THREE.MeshStandardMaterial({ color: 0x4a0000, roughness: 0.7 });
        this.brainMat = new THREE.MeshStandardMaterial({ color: 0xcc6677, roughness: 0.8 });
        this.skullMat = new THREE.MeshStandardMaterial({ color: 0xddccbb, roughness: 0.5 });

        // Pre-create blood sprite materials (avoid runtime allocation)
        this.bloodSpriteMats = [];
        for (let i = 0; i < 40; i++) {
            this.bloodSpriteMats.push(new THREE.SpriteMaterial({
                map: this.bloodSpriteTex,
                color: new THREE.Color(0.5 + Math.random() * 0.3, 0, 0),
                transparent: true,
                opacity: 0.8,
                depthWrite: false
            }));
        }
    }

    spawnBloodSpray(position, direction, intensity = 1) {
        const count = Math.floor(10 * intensity); // More blood

        // Blood droplets
        for (let i = 0; i < count; i++) {
            const sprite = this.bloodSpritePool.get();
            sprite.material = this.bloodSpriteMats[this.bloodMatIdx++ % this.bloodSpriteMats.length];
            sprite.position.copy(position);
            sprite.scale.setScalar(0.1 + Math.random() * 0.15);
            sprite.visible = true;

            // VIOLENT blood spray velocity
            this._bloodVel.copy(direction).multiplyScalar(6 + Math.random() * 10);
            this._bloodVel.x += (Math.random() - 0.5) * 8;
            this._bloodVel.y += Math.random() * 6;
            this._bloodVel.z += (Math.random() - 0.5) * 8;

            this.scene.add(sprite);
            this.bloodParticles.push({
                mesh: sprite,
                velocity: this._bloodVel.clone(),
                life: 1.0 + Math.random() * 0.5,
                gravity: 15,
                type: 'droplet'
            });
        }

        // Light blood mist (only on major hits, reuse material)
        if (intensity > 1.5) {
            const sprite = this.bloodSpritePool.get();
            sprite.material = this.bloodSpriteMats[this.bloodMatIdx++ % this.bloodSpriteMats.length];
            sprite.position.copy(position);
            sprite.scale.setScalar(0.5);
            sprite.visible = true;

            this.scene.add(sprite);
            this.bloodParticles.push({
                mesh: sprite,
                velocity: direction.clone().multiplyScalar(2),
                life: 0.4,
                gravity: 0,
                type: 'mist',
                initialScale: 0.5
            });
        }
    }

    spawnGoreChunks(position, direction) {
        const chunkCount = 6 + Math.floor(Math.random() * 4); // More chunks

        for (let i = 0; i < chunkCount; i++) {
            let geo, mat;
            const type = Math.random();

            if (type < 0.6) {
                // Small meat chunk
                geo = new THREE.DodecahedronGeometry(0.08 + Math.random() * 0.08);
                mat = this.goreMat.clone();
            } else {
                // Bone fragment
                geo = new THREE.BoxGeometry(0.04, 0.12, 0.04);
                mat = this.boneMat.clone();
            }

            const chunk = new THREE.Mesh(geo, mat);
            chunk.position.copy(position);
            chunk.position.add(new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                Math.random() * 0.5,
                (Math.random() - 0.5) * 0.5
            ));
            chunk.castShadow = true;

            // VIOLENT - explosive chunk velocity
            const vel = direction.clone().multiplyScalar(8 + Math.random() * 10);
            vel.add(new THREE.Vector3(
                (Math.random() - 0.5) * 12,
                Math.random() * 8 + 4,
                (Math.random() - 0.5) * 12
            ));

            const rotVel = new THREE.Vector3(
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 30
            );

            this.scene.add(chunk);
            this.goreChunks.push({
                mesh: chunk,
                velocity: vel,
                rotVelocity: rotVel,
                life: 6 + Math.random() * 3,
                grounded: false,
                canBleed: Math.random() > 0.7,
                bleedTimer: 0
            });
        }
    }

    explodeHead(zombie, hitPoint, direction) {
        // Get the head mesh (first child of zombie mesh)
        const head = zombie.mesh.children[0];
        if (!head) return;

        // Get head world position before hiding
        const headWorldPos = new THREE.Vector3();
        head.getWorldPosition(headWorldPos);

        // Hide the head
        head.visible = false;
        zombie.headExploded = true;

        // Play headshot sound
        this.playSound('headshot');

        // MASSIVE blood spray in all directions
        for (let i = 0; i < 5; i++) {
            const sprayDir = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                Math.random() * 0.5 + 0.5,
                (Math.random() - 0.5) * 2
            ).normalize();
            this.spawnBloodSpray(headWorldPos.clone(), sprayDir, 3);
        }

        // Spawn skull fragments
        const skullFragCount = 6 + Math.floor(Math.random() * 4);
        for (let i = 0; i < skullFragCount; i++) {
            const size = 0.08 + Math.random() * 0.12;
            const geo = new THREE.TetrahedronGeometry(size);
            const chunk = new THREE.Mesh(geo, this.skullMat.clone());
            chunk.position.copy(headWorldPos);
            chunk.castShadow = true;

            // Explosive outward velocity
            const vel = new THREE.Vector3(
                (Math.random() - 0.5) * 20,
                Math.random() * 15 + 5,
                (Math.random() - 0.5) * 20
            );
            // Add direction bias from bullet
            vel.add(direction.clone().multiplyScalar(10));

            const rotVel = new THREE.Vector3(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40
            );

            this.scene.add(chunk);
            this.goreChunks.push({
                mesh: chunk,
                velocity: vel,
                rotVelocity: rotVel,
                life: 5 + Math.random() * 3,
                grounded: false,
                canBleed: true,
                bleedTimer: 0,
                isSkull: true
            });
        }

        // Spawn brain chunks (pink/red squishy bits)
        const brainChunkCount = 8 + Math.floor(Math.random() * 5);
        for (let i = 0; i < brainChunkCount; i++) {
            const size = 0.06 + Math.random() * 0.1;
            const geo = new THREE.SphereGeometry(size, 6, 4);
            // Deform slightly for organic look
            const positions = geo.attributes.position;
            for (let j = 0; j < positions.count; j++) {
                positions.setXYZ(j,
                    positions.getX(j) * (0.8 + Math.random() * 0.4),
                    positions.getY(j) * (0.8 + Math.random() * 0.4),
                    positions.getZ(j) * (0.8 + Math.random() * 0.4)
                );
            }

            const chunk = new THREE.Mesh(geo, this.brainMat.clone());
            chunk.position.copy(headWorldPos);
            chunk.castShadow = true;

            // Slower, goopier velocity for brain matter
            const vel = new THREE.Vector3(
                (Math.random() - 0.5) * 15,
                Math.random() * 10 + 3,
                (Math.random() - 0.5) * 15
            );
            vel.add(direction.clone().multiplyScalar(8));

            const rotVel = new THREE.Vector3(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20
            );

            this.scene.add(chunk);
            this.goreChunks.push({
                mesh: chunk,
                velocity: vel,
                rotVelocity: rotVel,
                life: 4 + Math.random() * 2,
                grounded: false,
                canBleed: true,
                bleedTimer: 0,
                isBrain: true
            });
        }

        // Create a blood mist cloud at head position
        for (let i = 0; i < 3; i++) {
            const mistSprite = this.bloodSpritePool.get();
            mistSprite.material = this.bloodSpriteMats[this.bloodMatIdx++ % this.bloodSpriteMats.length];
            mistSprite.position.copy(headWorldPos);
            mistSprite.position.add(new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5
            ));
            mistSprite.scale.setScalar(1.0 + Math.random() * 0.5);
            mistSprite.visible = true;

            this.scene.add(mistSprite);
            this.bloodParticles.push({
                mesh: mistSprite,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 2,
                    Math.random() * 2,
                    (Math.random() - 0.5) * 2
                ),
                life: 0.6,
                gravity: 0,
                type: 'mist',
                initialScale: mistSprite.scale.x
            });
        }
    }

    spawnBloodDecal(position, normal, size = 1) {
        const decalMat = new THREE.MeshBasicMaterial({
            map: this.bloodDecalTex,
            transparent: true,
            opacity: 0.85,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -2,
            side: THREE.DoubleSide
        });

        const decalSize = (1.5 + Math.random() * 1.5) * size;
        const decal = new THREE.Mesh(new THREE.PlaneGeometry(decalSize, decalSize), decalMat);
        decal.position.copy(position);

        // If normal is provided and not pointing up, orient to surface
        if (normal && Math.abs(normal.y) < 0.9) {
            // Vertical or angled surface (obstacle)
            decal.position.addScaledVector(normal, 0.02); // Offset slightly from surface
            decal.lookAt(position.clone().add(normal));
            decal.rotation.z = Math.random() * Math.PI * 2;
        } else {
            // Floor (horizontal surface)
            decal.position.y = -4.95; // Just above floor
            decal.rotation.x = -Math.PI / 2;
            decal.rotation.z = Math.random() * Math.PI * 2;
        }

        this.scene.add(decal);
        this.bloodDecals.push({
            mesh: decal,
            life: 10.0 + Math.random() * 5.0
        });
    }

    checkBloodObstacleCollision(particle) {
        if (!particle.velocity || particle.type !== 'droplet') return false;

        // Cast ray in direction of movement
        this._bloodRayDir.copy(particle.velocity).normalize();
        this.bloodRaycaster.set(particle.mesh.position, this._bloodRayDir);
        this.bloodRaycaster.far = particle.velocity.length() * 0.1; // Check short distance

        const hits = this.bloodRaycaster.intersectObjects(this.obstacles);
        if (hits.length > 0) {
            const hit = hits[0];
            // Spawn blood splat on obstacle surface
            this.spawnBloodDecal(hit.point, hit.face.normal, 0.4 + Math.random() * 0.3);
            return true;
        }
        return false;
    }

    spawnBloodPool(position) {
        const poolMat = new THREE.MeshBasicMaterial({
            color: 0x3a0000,
            transparent: true,
            opacity: 0.9,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -1
        });

        const pool = new THREE.Mesh(new THREE.CircleGeometry(0.1, 16), poolMat);
        pool.position.copy(position);
        pool.position.y = -4.98;
        pool.rotation.x = -Math.PI / 2;

        this.scene.add(pool);
        this.bloodPools.push({
            mesh: pool,
            targetSize: 2.0 + Math.random() * 1.5, // Bigger pools
            currentSize: 0.1,
            growthRate: 1.0 + Math.random() * 0.5, // Faster growth
            life: 8.0 + Math.random() * 5.0 // Fixed: 8-13 seconds
        });
    }

    update(dt) {
        // Update blood particles
        for (let i = this.bloodParticles.length - 1; i >= 0; i--) {
            const p = this.bloodParticles[i];
            p.life -= dt;

            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.bloodSpritePool.release(p.mesh);
                this.bloodParticles[i] = this.bloodParticles[this.bloodParticles.length - 1];
                this.bloodParticles.pop();
                continue;
            }

            if (p.type === 'droplet') {
                p.velocity.y -= p.gravity * dt;
                p.mesh.position.addScaledVector(p.velocity, dt);
                p.mesh.material.opacity = Math.min(1, p.life);

                // Check for obstacle collision (blood sticks to walls/crates)
                if (this.checkBloodObstacleCollision(p)) {
                    this.scene.remove(p.mesh);
                    this.bloodSpritePool.release(p.mesh);
                    this.bloodParticles[i] = this.bloodParticles[this.bloodParticles.length - 1];
                    this.bloodParticles.pop();
                    continue;
                }

                // Hit ground
                if (p.mesh.position.y < -4.8) {
                    if (Math.random() > 0.7) { // Increased decal spawns
                        this.spawnBloodDecal(p.mesh.position.clone(), this._upNormal, 0.3);
                    }
                    this.scene.remove(p.mesh);
                    this.bloodSpritePool.release(p.mesh);
                    this.bloodParticles[i] = this.bloodParticles[this.bloodParticles.length - 1];
                    this.bloodParticles.pop();
                }
            } else if (p.type === 'mist') {
                p.mesh.position.addScaledVector(p.velocity, dt);
                p.velocity.multiplyScalar(0.95);
                p.mesh.scale.setScalar(p.initialScale * (1 + (1 - p.life) * 3));
                p.mesh.material.opacity = p.life * 0.5;
            }
        }

        // Update gore chunks
        for (let i = this.goreChunks.length - 1; i >= 0; i--) {
            const g = this.goreChunks[i];
            g.life -= dt;

            if (g.life <= 0) {
                this.scene.remove(g.mesh);
                this.goreChunks[i] = this.goreChunks[this.goreChunks.length - 1];
                this.goreChunks.pop();
                continue;
            }

            if (!g.grounded) {
                g.velocity.y -= 20 * dt;
                g.mesh.position.addScaledVector(g.velocity, dt);
                g.mesh.rotation.x += g.rotVelocity.x * dt;
                g.mesh.rotation.y += g.rotVelocity.y * dt;
                g.mesh.rotation.z += g.rotVelocity.z * dt;

                // Check for obstacle collision (gore sticks to walls/crates)
                this._bloodRayDir.copy(g.velocity).normalize();
                this.bloodRaycaster.set(g.mesh.position, this._bloodRayDir);
                this.bloodRaycaster.far = g.velocity.length() * dt * 2;
                const goreHits = this.bloodRaycaster.intersectObjects(this.obstacles);
                if (goreHits.length > 0 && g.canBleed) {
                    const hit = goreHits[0];
                    // Splatter blood on obstacle
                    this.spawnBloodDecal(hit.point, hit.face.normal, 0.5 + Math.random() * 0.3);
                    // Bounce off
                    g.velocity.reflect(hit.face.normal).multiplyScalar(0.3);
                    g.rotVelocity.multiplyScalar(0.5);
                }

                if (g.mesh.position.y < -4.7) {
                    g.mesh.position.y = -4.7;
                    if (Math.abs(g.velocity.y) > 2) {
                        g.velocity.y *= -0.3;
                        g.velocity.x *= 0.7;
                        g.velocity.z *= 0.7;
                        g.rotVelocity.multiplyScalar(0.5);
                        if (Math.random() > 0.4) { // More decal spawns
                            this.spawnBloodDecal(g.mesh.position.clone(), this._upNormal, 0.5);
                        }
                    } else {
                        g.grounded = true;
                        g.velocity.set(0, 0, 0);
                    }
                }
            }

            if (g.life < 2) {
                g.mesh.material.opacity = g.life / 2;
                g.mesh.material.transparent = true;
            }
        }

        // Update blood pools
        for (let i = this.bloodPools.length - 1; i >= 0; i--) {
            const p = this.bloodPools[i];
            p.life -= dt;

            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.bloodPools[i] = this.bloodPools[this.bloodPools.length - 1];
                this.bloodPools.pop();
                continue;
            }

            if (p.currentSize < p.targetSize) {
                p.currentSize += p.growthRate * dt;
                p.mesh.scale.setScalar(p.currentSize);
            }

            if (p.life < 1.5) {
                p.mesh.material.opacity = (p.life / 1.5) * 0.9; // Fade over last 1.5 seconds
            }
        }

        // Update blood decals
        for (let i = this.bloodDecals.length - 1; i >= 0; i--) {
            const d = this.bloodDecals[i];
            d.life -= dt;

            if (d.life <= 0) {
                this.scene.remove(d.mesh);
                this.bloodDecals[i] = this.bloodDecals[this.bloodDecals.length - 1];
                this.bloodDecals.pop();
                continue;
            }

            if (d.life < 1.5) {
                d.mesh.material.opacity = (d.life / 1.5) * 0.85; // Fade over last 1.5 seconds
            }
        }
    }
}

