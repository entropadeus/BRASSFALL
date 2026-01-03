import * as THREE from 'three';

/**
 * Targets - Manages shooting targets that pop up from obstacles
 * 
 * NOTE: Requires global references to:
 * - scene (THREE.Scene)
 * - camera (THREE.Camera)
 * - obstacles (array)
 */
export class ShootingTarget {
    constructor(position, dependencies = {}) {
        const {
            scene,
            camera,
            obstacles = []
        } = dependencies;

        this.scene = scene;
        this.camera = camera;
        this.obstacles = obstacles;

        this.mesh = this.createTargetMesh();
        this.mesh.position.copy(position);
        this.mesh.position.y = -5; // Ground level

        this.pivotPoint = new THREE.Group();
        this.pivotPoint.position.copy(this.mesh.position);
        this.pivotPoint.add(this.mesh);
        this.mesh.position.set(0, 0, 0);

        scene.add(this.pivotPoint);

        this.isUp = false;
        this.isAnimating = false;
        this.rotation = 0;
        this.targetRotation = Math.PI / 2; // Fallen state

        // Add hitbox to raycast targets
        this.hitbox = new THREE.Mesh(
            new THREE.BoxGeometry(1.6, 4, 0.5),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        this.hitbox.position.y = 2;
        this.pivotPoint.add(this.hitbox);
        this.hitbox.userData.isTarget = true;
        this.hitbox.userData.targetRef = this;
    }

    createTargetMesh() {
        const group = new THREE.Group();

        // Head
        const headGeo = new THREE.CircleGeometry(0.8, 16);
        const targetMat = new THREE.MeshStandardMaterial({
            color: 0xff4444,
            roughness: 0.8,
            side: THREE.DoubleSide
        });
        const head = new THREE.Mesh(headGeo, targetMat);
        head.position.y = 3.2;
        group.add(head);

        // Body (torso)
        const bodyGeo = new THREE.PlaneGeometry(1.6, 2.4);
        const body = new THREE.Mesh(bodyGeo, targetMat);
        body.position.y = 1.6;
        group.add(body);

        // Base/stand
        const standMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.6 });
        const standGeo = new THREE.BoxGeometry(0.15, 4.4, 0.15);
        const stand = new THREE.Mesh(standGeo, standMat);
        stand.position.y = 2.0;
        stand.position.z = 0.15;
        group.add(stand);

        const baseGeo = new THREE.BoxGeometry(1.2, 0.15, 0.8);
        const base = new THREE.Mesh(baseGeo, standMat);
        base.position.y = -0.05;
        group.add(base);

        return group;
    }

    popup(obstacle) {
        if (this.isAnimating) return;
        this.isAnimating = true;

        // Position behind obstacle
        const pos = obstacle.position.clone();
        pos.x += (Math.random() - 0.5) * 2;
        pos.z += (Math.random() > 0.5 ? 2 : -2);
        this.pivotPoint.position.set(pos.x, -5, pos.z);
        this.pivotPoint.rotation.y = Math.atan2(
            this.camera.position.x - pos.x,
            this.camera.position.z - pos.z
        );

        // Animate up
        this.targetRotation = 0;
        this.isUp = true;
    }

    knockDown() {
        if (!this.isUp || this.isAnimating) return;
        this.isAnimating = true;
        this.targetRotation = Math.PI / 2;
        this.isUp = false;

        // Schedule popup at new location
        setTimeout(() => {
            if (this.obstacles.length > 0) {
                const randomObstacle = this.obstacles[Math.floor(Math.random() * this.obstacles.length)];
                this.popup(randomObstacle);
            }
        }, 1500 + Math.random() * 2000);
    }

    update(dt) {
        // Smooth rotation animation
        const diff = this.targetRotation - this.rotation;
        if (Math.abs(diff) > 0.01) {
            this.rotation += diff * 8 * dt;
            this.pivotPoint.rotation.x = -this.rotation;
        } else {
            this.rotation = this.targetRotation;
            this.isAnimating = false;
        }
    }

    getHitbox() {
        return this.hitbox;
    }
}

export class TargetManager {
    constructor(dependencies = {}) {
        const {
            scene,
            camera,
            obstacles = []
        } = dependencies;

        this.scene = scene;
        this.camera = camera;
        this.obstacles = obstacles;
        this.targets = [];
    }

    init() {
        // Create shooting targets
        for (let i = 0; i < 8; i++) {
            const target = new ShootingTarget(new THREE.Vector3(0, -5, 0), {
                scene: this.scene,
                camera: this.camera,
                obstacles: this.obstacles
            });
            this.targets.push(target);

            // Spawn at random obstacle after delay
            setTimeout(() => {
                if (this.obstacles.length > 0) {
                    const randomObstacle = this.obstacles[Math.floor(Math.random() * this.obstacles.length)];
                    target.popup(randomObstacle);
                }
            }, 1000 + i * 500);
        }
    }

    update(dt) {
        for (const target of this.targets) {
            target.update(dt);
        }
    }

    getTargets() {
        return this.targets;
    }
}

