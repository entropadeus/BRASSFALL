import * as THREE from 'three';
import { ObjectPool } from '../utils/ObjectPool.js';

/**
 * Particles - Manages sparks, debris, tracers, shells, and other particle effects
 * 
 * NOTE: Requires global references to:
 * - scene (THREE.Scene)
 * - MAX_SPARKS, MAX_DEBRIS - constants
 */
export class Particles {
    constructor(dependencies = {}) {
        const {
            scene,
            MAX_SPARKS = 100,
            MAX_DEBRIS = 50
        } = dependencies;

        this.scene = scene;

        // Particle arrays
        this.sparks = [];
        this.debris = [];
        this.tracers = [];
        this.shells = [];

        // Create geometries and materials
        this.sparkGeo = new THREE.SphereGeometry(0.02, 3, 3);
        this.debrisGeo = new THREE.BoxGeometry(0.05, 0.05, 0.05);
        this.debrisMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.9 });

        // Pre-create spark materials
        this.sparkMats = [];
        for (let i = 0; i < 30; i++) {
            this.sparkMats.push(new THREE.MeshBasicMaterial({
                color: 0xffdd44,
                transparent: true,
                blending: THREE.AdditiveBlending
            }));
        }
        this.sparkMatIdx = 0;

        // Create object pools
        this.sparkPool = new ObjectPool(
            () => {
                const m = new THREE.Mesh(this.sparkGeo, this.sparkMats[0]);
                m.visible = false;
                return m;
            },
            (s) => { s.visible = false; },
            MAX_SPARKS
        );

        this.debrisPool = new ObjectPool(
            () => {
                const d = new THREE.Mesh(this.debrisGeo, this.debrisMat);
                d.visible = false;
                return d;
            },
            (d) => { d.visible = false; },
            MAX_DEBRIS
        );

        // Reusable vector
        this._tempVec3 = new THREE.Vector3();
    }

    spawnImpactSparks(point, normal) {
        for (let i = 0; i < 3; i++) { // Further reduced for performance
            const spark = this.sparkPool.get();
            spark.material = this.sparkMats[this.sparkMatIdx++ % this.sparkMats.length];
            spark.position.copy(point);
            spark.visible = true;
            this._tempVec3.copy(normal).multiplyScalar(5 + Math.random() * 10);
            this._tempVec3.x += (Math.random() - 0.5) * 8;
            this._tempVec3.y += Math.random() * 5;
            this._tempVec3.z += (Math.random() - 0.5) * 8;
            spark.userData = {
                velocity: this._tempVec3.clone(),
                life: 0.2 + Math.random() * 0.3
            };
            this.scene.add(spark);
            this.sparks.push(spark);
        }
    }

    spawnDebris(point, normal) {
        for (let i = 0; i < 1; i++) { // Further reduced for performance
            const d = this.debrisPool.get();
            d.position.copy(point);
            d.visible = true;
            this._tempVec3.copy(normal).multiplyScalar(2 + Math.random() * 4);
            this._tempVec3.x += (Math.random() - 0.5) * 4;
            this._tempVec3.y += Math.random() * 3;
            this._tempVec3.z += (Math.random() - 0.5) * 4;
            d.userData = {
                velocity: this._tempVec3.clone(),
                rotVel: new THREE.Vector3(Math.random() * 10, Math.random() * 10, Math.random() * 10),
                life: 1.0 + Math.random() * 1.0 // Fixed: 1-2 seconds
            };
            this.scene.add(d);
            this.debris.push(d);
        }
    }

    spawnTracer(start, end) {
        // Main tracer line
        const points = [start, end];
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({
            color: 0xffff88,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending
        });
        const line = new THREE.Line(geo, mat);
        this.scene.add(line);
        this.tracers.push({ mesh: line, life: 0.1 }); // Fixed: 0.1 seconds

        // Glow tracer (wider, softer)
        const glowMat = new THREE.LineBasicMaterial({
            color: 0xffaa44,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending
        });
        const glowLine = new THREE.Line(geo.clone(), glowMat);
        this.scene.add(glowLine);
        this.tracers.push({ mesh: glowLine, life: 0.08 }); // Fixed: 0.08 seconds
    }

    spawnShotgunPelletTracer(start, end) {
        const dir = new THREE.Vector3().subVectors(end, start);
        const dist = dir.length();
        dir.normalize();

        const tracerGeo = new THREE.CylinderGeometry(0.015, 0.015, Math.min(dist, 4), 4);
        const tracerMat = new THREE.MeshBasicMaterial({
            color: 0xffdd88,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        const tracer = new THREE.Mesh(tracerGeo, tracerMat);

        // Position at midpoint
        tracer.position.copy(start).add(dir.clone().multiplyScalar(dist / 2));
        tracer.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

        this.scene.add(tracer);
        this.tracers.push({
            mesh: tracer,
            velocity: dir.clone().multiplyScalar(250),
            life: 0.08 // Very short life for pellet tracers
        });
    }

    update(dt) {
        // Update sparks
        for (let i = this.sparks.length - 1; i >= 0; i--) {
            const spark = this.sparks[i];
            if (!spark.userData || !spark.userData.life) {
                this.sparks.splice(i, 1);
                continue;
            }

            spark.userData.life -= dt;
            if (spark.userData.life <= 0) {
                this.scene.remove(spark);
                this.sparkPool.release(spark);
                this.sparks.splice(i, 1);
                continue;
            }

            spark.position.addScaledVector(spark.userData.velocity, dt);
            spark.userData.velocity.y -= 20 * dt; // Gravity
            spark.userData.velocity.multiplyScalar(0.95); // Friction
        }

        // Update debris
        for (let i = this.debris.length - 1; i >= 0; i--) {
            const d = this.debris[i];
            if (!d.userData || !d.userData.life) {
                this.debris.splice(i, 1);
                continue;
            }

            d.userData.life -= dt;
            if (d.userData.life <= 0) {
                this.scene.remove(d);
                this.debrisPool.release(d);
                this.debris.splice(i, 1);
                continue;
            }

            d.position.addScaledVector(d.userData.velocity, dt);
            d.rotation.x += d.userData.rotVel.x * dt;
            d.rotation.y += d.userData.rotVel.y * dt;
            d.rotation.z += d.userData.rotVel.z * dt;
            d.userData.velocity.y -= 20 * dt; // Gravity
            d.userData.velocity.multiplyScalar(0.95); // Friction
            d.userData.rotVel.multiplyScalar(0.98); // Angular friction
        }

        // Update tracers
        for (let i = this.tracers.length - 1; i >= 0; i--) {
            const tracer = this.tracers[i];
            tracer.life -= dt;
            if (tracer.life <= 0) {
                this.scene.remove(tracer.mesh);
                if (tracer.mesh.geometry) tracer.mesh.geometry.dispose();
                if (tracer.mesh.material) tracer.mesh.material.dispose();
                this.tracers.splice(i, 1);
                continue;
            }

            // Move tracer if it has velocity
            if (tracer.velocity) {
                tracer.mesh.position.addScaledVector(tracer.velocity, dt);
            }

            // Fade out
            if (tracer.mesh.material.opacity !== undefined) {
                tracer.mesh.material.opacity = tracer.life / 0.1;
            }
        }

        // Update shells
        for (let i = this.shells.length - 1; i >= 0; i--) {
            const shell = this.shells[i];
            if (!shell.userData || !shell.userData.life) {
                this.shells.splice(i, 1);
                continue;
            }

            shell.userData.life -= dt;
            if (shell.userData.life <= 0) {
                this.scene.remove(shell);
                this.shells.splice(i, 1);
                continue;
            }

            if (shell.userData.velocity) {
                shell.position.addScaledVector(shell.userData.velocity, dt);
                shell.userData.velocity.y -= 20 * dt; // Gravity
                shell.userData.velocity.multiplyScalar(0.95); // Friction
            }
        }
    }
}

