import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';

/**
 * Scene - Manages Three.js scene, camera, and renderer initialization
 */
export class Scene {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = null;
        this.composer = null;

        // Indoor haze/dust fog (subtle)
        this.scene.fog = new THREE.FogExp2(0x222225, 0.006);
    }

    initCamera(fov = 75, near = 0.1, far = 500) {
        this.camera = new THREE.PerspectiveCamera(
            fov,
            window.innerWidth / window.innerHeight,
            near,
            far
        );
        return this.camera;
    }

    initRenderer(options = {}) {
        const {
            antialias = true,
            powerPreference = "high-performance",
            precision = "highp"
        } = options;

        this.renderer = new THREE.WebGLRenderer({
            antialias,
            powerPreference,
            precision
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.shadowMap.autoUpdate = false; // Manual shadow update
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
        this.renderer.physicallyCorrectLights = true;

        document.body.appendChild(this.renderer.domElement);

        return this.renderer;
    }

    initComposer(renderer) {
        if (!renderer) renderer = this.renderer;
        if (!renderer) {
            throw new Error('Renderer must be initialized before composer');
        }

        // EffectComposer imported as ES module
        try {
            this.composer = new EffectComposer(renderer);
            return this.composer;
        } catch (error) {
            console.warn('EffectComposer not available. Post-processing disabled.', error);
            return null;
        }
    }

    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }

    getRenderer() {
        return this.renderer;
    }

    getComposer() {
        return this.composer;
    }

    handleResize() {
        if (this.camera) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        }
        if (this.renderer) {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
        if (this.composer) {
            this.composer.setSize(window.innerWidth, window.innerHeight);
        }
    }
}

