import * as THREE from 'three';
import { TextureFactory } from '../utils/TextureFactory.js';

/**
 * Environment - Manages game world environment (floor, walls, obstacles, doors, terrain)
 * 
 * NOTE: Requires global references to:
 * - scene (THREE.Scene)
 * - camera (THREE.Camera)
 */
export class Environment {
    constructor(dependencies = {}) {
        const {
            scene,
            camera
        } = dependencies;

        this.scene = scene;
        this.camera = camera;
        this.obstacles = [];
        this.targets = []; // For raycasting

        this.MAP_SIZE = 140;
        this.MAP_HALF = this.MAP_SIZE / 2;
        this.HILL_RADIUS = 18;
        this.HILL_HEIGHT = 5;
        this.HILL_CENTER_X = 0;
        this.HILL_CENTER_Z = 0;
        this.ROOF_HEIGHT = 30;
    }

    init() {
        this.createLighting();
        this.createFloor();
        this.createCeiling();
        this.createHill();
        this.createWalls();
        this.createDoors();
        this.createObstacles();
    }

    createLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xdddde8, 0.6);
        this.scene.add(ambientLight);

        // Hemisphere light
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x666677, 0.5);
        this.scene.add(hemiLight);

        // Main directional light
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight.position.set(0, 100, 0);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.bias = -0.0002;
        dirLight.shadow.normalBias = 0.02;
        dirLight.shadow.radius = 3;
        dirLight.shadow.camera.left = -100;
        dirLight.shadow.camera.right = 100;
        dirLight.shadow.camera.top = 100;
        dirLight.shadow.camera.bottom = -100;
        dirLight.shadow.camera.near = 10;
        dirLight.shadow.camera.far = 150;
        this.scene.add(dirLight);

        // Fluorescent lights
        const FLUOR_ROWS = 5;
        const FLUOR_COLS = 5;
        const FLUOR_SPACING = 28;

        for (let row = 0; row < FLUOR_ROWS; row++) {
            for (let col = 0; col < FLUOR_COLS; col++) {
                const x = (col - (FLUOR_COLS - 1) / 2) * FLUOR_SPACING;
                const z = (row - (FLUOR_ROWS - 1) / 2) * FLUOR_SPACING;

                const fluorLight = new THREE.PointLight(0xffffff, 1.0, 50, 2);
                fluorLight.position.set(x, this.ROOF_HEIGHT - 2, z);
                this.scene.add(fluorLight);

                // Visible fluorescent tube
                const tubeGeo = new THREE.BoxGeometry(8, 0.3, 1);
                const tubeMat = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    emissive: 0xeeffff,
                    emissiveIntensity: 2
                });
                const tube = new THREE.Mesh(tubeGeo, tubeMat);
                tube.position.set(x, this.ROOF_HEIGHT - 1, z);
                this.scene.add(tube);
            }
        }

        // Fill lights
        const rimLight = new THREE.DirectionalLight(0xaaaacc, 0.1);
        rimLight.position.set(5, 10, 5);
        this.scene.add(rimLight);

        const gunFillLight = new THREE.PointLight(0xffaa77, 0.4, 15);
        gunFillLight.position.set(0, -0.3, 0.5);
        this.camera.add(gunFillLight);
    }

    createFloor() {
        const concreteTex = TextureFactory.concrete();
        const floorMat = new THREE.MeshStandardMaterial({
            map: concreteTex,
            color: 0xdddddd,
            roughness: 0.8,
            metalness: 0.1,
            bumpMap: concreteTex,
            bumpScale: 0.05
        });

        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(this.MAP_SIZE, this.MAP_SIZE),
            floorMat
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -5;
        floor.receiveShadow = true;
        this.scene.add(floor);
    }

    createCeiling() {
        // Create ceiling texture
        const ceilingTexCanvas = document.createElement('canvas');
        ceilingTexCanvas.width = 256;
        ceilingTexCanvas.height = 256;
        const ceilCtx = ceilingTexCanvas.getContext('2d');

        ceilCtx.fillStyle = '#404045';
        ceilCtx.fillRect(0, 0, 256, 256);

        // Grid pattern
        ceilCtx.strokeStyle = '#353538';
        ceilCtx.lineWidth = 2;
        const tileSize = 64;
        for (let x = 0; x <= 256; x += tileSize) {
            ceilCtx.beginPath();
            ceilCtx.moveTo(x, 0);
            ceilCtx.lineTo(x, 256);
            ceilCtx.stroke();
        }
        for (let y = 0; y <= 256; y += tileSize) {
            ceilCtx.beginPath();
            ceilCtx.moveTo(0, y);
            ceilCtx.lineTo(256, y);
            ceilCtx.stroke();
        }

        const ceilingTex = new THREE.CanvasTexture(ceilingTexCanvas);
        ceilingTex.wrapS = ceilingTex.wrapT = THREE.RepeatWrapping;
        ceilingTex.repeat.set(4, 4);

        const ceilingMat = new THREE.MeshStandardMaterial({
            map: ceilingTex,
            color: 0x555560,
            roughness: 0.9,
            side: THREE.BackSide
        });

        const ceiling = new THREE.Mesh(
            new THREE.PlaneGeometry(this.MAP_SIZE + 10, this.MAP_SIZE + 10),
            ceilingMat
        );
        ceiling.rotation.x = -Math.PI / 2;
        ceiling.position.y = this.ROOF_HEIGHT;
        this.scene.add(ceiling);
    }

    createHill() {
        const hillGeo = new THREE.ConeGeometry(
            this.HILL_RADIUS,
            this.HILL_HEIGHT,
            32
        );
        const concreteTex = TextureFactory.concrete();
        const hillMat = new THREE.MeshStandardMaterial({
            map: concreteTex,
            color: 0xcccccc,
            roughness: 0.8,
            bumpMap: concreteTex,
            bumpScale: 0.15
        });

        const hill = new THREE.Mesh(hillGeo, hillMat);
        hill.position.set(this.HILL_CENTER_X, -5, this.HILL_CENTER_Z);
        hill.receiveShadow = true;
        hill.castShadow = true;
        this.scene.add(hill);
    }

    createWalls() {
        const concreteTex = TextureFactory.concrete();
        const wallMat = new THREE.MeshStandardMaterial({
            map: concreteTex,
            color: 0xbbbbbb,
            roughness: 0.9,
            bumpMap: concreteTex,
            bumpScale: 0.1
        });
        const wallGeo = new THREE.PlaneGeometry(this.MAP_SIZE, 50);

        const wall1 = new THREE.Mesh(wallGeo, wallMat);
        wall1.position.set(0, 20, -this.MAP_HALF);
        wall1.receiveShadow = true;
        this.scene.add(wall1);

        const wall2 = new THREE.Mesh(wallGeo, wallMat);
        wall2.position.set(0, 20, this.MAP_HALF);
        wall2.rotation.y = Math.PI;
        wall2.receiveShadow = true;
        this.scene.add(wall2);

        const wall3 = new THREE.Mesh(wallGeo, wallMat);
        wall3.position.set(-this.MAP_HALF, 20, 0);
        wall3.rotation.y = Math.PI / 2;
        wall3.receiveShadow = true;
        this.scene.add(wall3);

        const wall4 = new THREE.Mesh(wallGeo, wallMat);
        wall4.position.set(this.MAP_HALF, 20, 0);
        wall4.rotation.y = -Math.PI / 2;
        wall4.receiveShadow = true;
        this.scene.add(wall4);
    }

    createDoors() {
        // Simplified door creation - full version has detailed door meshes
        const DOOR_WIDTH = 4;
        const DOOR_HEIGHT = 6;
        const DOOR_DEPTH = 1.5;

        const doorMat = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.8,
            metalness: 0.3
        });

        // Create doors at arena edges
        const doorPositions = [
            { x: 0, z: -this.MAP_HALF, rotY: 0 },
            { x: 0, z: this.MAP_HALF, rotY: Math.PI },
            { x: -this.MAP_HALF, z: 0, rotY: Math.PI / 2 },
            { x: this.MAP_HALF, z: 0, rotY: -Math.PI / 2 }
        ];

        doorPositions.forEach(pos => {
            const door = new THREE.Mesh(
                new THREE.BoxGeometry(DOOR_WIDTH, DOOR_HEIGHT, DOOR_DEPTH),
                doorMat
            );
            door.position.set(pos.x, -2, pos.z);
            door.rotation.y = pos.rotY;
            door.castShadow = true;
            door.receiveShadow = true;
            this.scene.add(door);
        });
    }

    createObstacles() {
        const woodTex = TextureFactory.wood();
        const crateMat = new THREE.MeshStandardMaterial({
            map: woodTex,
            color: 0x886644,
            roughness: 0.7
        });

        const concreteTex = TextureFactory.concrete();
        const barrierMat = new THREE.MeshStandardMaterial({
            map: concreteTex,
            color: 0x888888,
            roughness: 0.9
        });

        const drumMat = new THREE.MeshStandardMaterial({
            color: 0x444444,
            metalness: 0.8,
            roughness: 0.3
        });

        for (let i = 0; i < 30; i++) {
            let mesh;
            const r = Math.random();
            if (r > 0.6) {
                // Wooden Crate
                mesh = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), crateMat);
                mesh.position.y = -3.5;
            } else if (r > 0.3) {
                // Concrete Jersey Barrier
                mesh = new THREE.Mesh(new THREE.BoxGeometry(6, 2.5, 1), barrierMat);
                mesh.position.y = -3.75;
            } else {
                // Steel Drum
                mesh = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 3, 16), drumMat);
                mesh.position.y = -3.5;
            }

            // Find position that's NOT on the hill
            let posX, posZ;
            let attempts = 0;
            do {
                posX = (Math.random() - 0.5) * (this.MAP_SIZE - 10);
                posZ = (Math.random() - 0.5) * (this.MAP_SIZE - 10);
                attempts++;
            } while (this.isOnHill(posX, posZ, 3) && attempts < 50);

            mesh.position.x = posX;
            mesh.position.z = posZ;
            mesh.rotation.y = Math.random() * Math.PI;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
            this.targets.push(mesh);
            this.obstacles.push(mesh);
        }
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

    getObstacles() {
        return this.obstacles;
    }

    getTargets() {
        return this.targets;
    }
}

