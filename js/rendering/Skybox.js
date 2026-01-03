import * as THREE from 'three';
import { skyVertexShader, skyFragmentShader } from './shaders/SkyShader.js';

/**
 * Skybox - Procedural skybox with volumetric clouds
 * 
 * NOTE: Currently disabled for indoor arena, but kept for future use
 */
export class Skybox {
    constructor(scene) {
        this.scene = scene;
        this.sky = null;
        this.cloudGroup = null;
        this.enabled = false; // Disabled for indoor arena
    }

    create() {
        if (!this.enabled) return null;

        // Use sky shaders if available, otherwise create basic sky
        if (skyVertexShader && skyFragmentShader) {
            const skyGeo = new THREE.SphereGeometry(500, 64, 32);
            const skyMat = new THREE.ShaderMaterial({
                vertexShader: skyVertexShader,
                fragmentShader: skyFragmentShader,
                uniforms: {
                    topColor: { value: new THREE.Color(0x0077ff) },
                    midColor: { value: new THREE.Color(0xffffff) },
                    bottomColor: { value: new THREE.Color(0xffffff) },
                    sunColor: { value: new THREE.Color(0xffaa00) },
                    sunDirection: { value: new THREE.Vector3(0, 1, 0) },
                    time: { value: 0 }
                },
                side: THREE.BackSide
            });
            this.sky = new THREE.Mesh(skyGeo, skyMat);
            this.scene.add(this.sky);
        }

        // Create cloud group
        this.cloudGroup = new THREE.Group();
        for (let i = 0; i < 25; i++) {
            const cloudGeo = new THREE.PlaneGeometry(80 + Math.random() * 60, 15 + Math.random() * 20);
            const cloudMat = new THREE.MeshBasicMaterial({
                color: new THREE.Color().lerpColors(
                    new THREE.Color(0xff4020),
                    new THREE.Color(0xff8040),
                    Math.random()
                ),
                transparent: true,
                opacity: 0.3 + Math.random() * 0.3,
                side: THREE.DoubleSide
            });
            const cloud = new THREE.Mesh(cloudGeo, cloudMat);
            const angle = Math.random() * Math.PI * 2;
            const height = 80 + Math.random() * 100;
            const dist = 200 + Math.random() * 200;
            cloud.position.set(
                Math.cos(angle) * dist,
                height,
                Math.sin(angle) * dist
            );
            cloud.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.3;
            cloud.rotation.z = Math.random() * Math.PI;
            cloud.lookAt(0, height, 0);
            this.cloudGroup.add(cloud);
        }

        if (this.enabled) {
            this.scene.add(this.cloudGroup);
        }

        return this.sky;
    }

    update(time) {
        if (!this.enabled || !this.sky) return;

        // Update sky shader time uniform
        if (this.sky.material.uniforms && this.sky.material.uniforms.time) {
            this.sky.material.uniforms.time.value = time;
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (this.sky) {
            this.sky.visible = enabled;
        }
        if (this.cloudGroup) {
            this.cloudGroup.visible = enabled;
        }
    }
}

