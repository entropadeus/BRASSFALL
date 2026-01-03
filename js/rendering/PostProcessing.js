import * as THREE from 'three';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { MotionBlurShader, ChromaticAberrationShader } from './shaders/index.js';

/**
 * PostProcessing - Manages post-processing effects pipeline
 */
export class PostProcessing {
    constructor(composer, renderer, scene, camera) {
        this.composer = composer;
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;

        this.passes = {};
        this.bloomPass = null;
        this.motionBlurPass = null;
        this.chromaticPass = null;
        this.fxaaPass = null;

        this.init();
    }

    init() {
        if (!this.composer) {
            console.warn('Composer not initialized. Post-processing disabled.');
            return;
        }

        // Depth texture for depth-based effects
        const depthTexture = new THREE.DepthTexture(window.innerWidth, window.innerHeight);
        depthTexture.type = THREE.UnsignedShortType;
        const depthRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
            depthTexture: depthTexture
        });

        // Render pass
        try {
            const renderPass = new RenderPass(this.scene, this.camera);
            this.composer.addPass(renderPass);
            this.passes.render = renderPass;
        } catch (error) {
            console.warn('RenderPass not available:', error);
        }

        // Bloom for muzzle flash glow - optimized for performance
        try {
            this.bloomPass = new UnrealBloomPass(
                new THREE.Vector2(window.innerWidth / 4, window.innerHeight / 4), // Quarter resolution
                0.12,  // strength
                0.3,   // radius
                0.9    // threshold
            );
            this.composer.addPass(this.bloomPass);
            this.passes.bloom = this.bloomPass;
        } catch (error) {
            console.warn('UnrealBloomPass not available:', error);
        }

        // Motion Blur
        if (MotionBlurShader) {
            try {
                this.motionBlurPass = new ShaderPass(MotionBlurShader);
                this.composer.addPass(this.motionBlurPass);
                this.passes.motionBlur = this.motionBlurPass;
            } catch (error) {
                console.warn('MotionBlurShader pass failed:', error);
            }
        }

        // Chromatic Aberration
        if (ChromaticAberrationShader) {
            try {
                this.chromaticPass = new ShaderPass(ChromaticAberrationShader);
                this.chromaticPass.uniforms.amount.value = 0.001; // Very subtle base
                this.composer.addPass(this.chromaticPass);
                this.passes.chromatic = this.chromaticPass;
            } catch (error) {
                console.warn('ChromaticAberrationShader pass failed:', error);
            }
        }

        // FXAA - Fast approximate anti-aliasing
        try {
            this.fxaaPass = new ShaderPass(FXAAShader);
            const pixelRatio = this.renderer.getPixelRatio();
            this.fxaaPass.uniforms['resolution'].value.set(
                1 / (window.innerWidth * pixelRatio),
                1 / (window.innerHeight * pixelRatio)
            );
            this.composer.addPass(this.fxaaPass);
            this.passes.fxaa = this.fxaaPass;
        } catch (error) {
            console.warn('FXAAShader not available:', error);
        }
    }

    update(dt, motionBlurX = 0, motionBlurY = 0) {
        // Update motion blur
        if (this.motionBlurPass && this.motionBlurPass.uniforms) {
            if (this.motionBlurPass.uniforms.velocityX) {
                this.motionBlurPass.uniforms.velocityX.value = motionBlurX;
            }
            if (this.motionBlurPass.uniforms.velocityY) {
                this.motionBlurPass.uniforms.velocityY.value = motionBlurY;
            }
        }

        // Update chromatic aberration intensity (can be increased during action)
        if (this.chromaticPass && this.chromaticPass.uniforms) {
            // Can be adjusted dynamically based on game events
        }
    }

    setChromaticAberration(amount) {
        if (this.chromaticPass && this.chromaticPass.uniforms) {
            this.chromaticPass.uniforms.amount.value = amount;
        }
    }

    setBloomIntensity(strength, radius, threshold) {
        if (this.bloomPass) {
            if (strength !== undefined) this.bloomPass.strength = strength;
            if (radius !== undefined) this.bloomPass.radius = radius;
            if (threshold !== undefined) this.bloomPass.threshold = threshold;
        }
    }

    render() {
        if (this.composer) {
            this.composer.render();
        } else if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    handleResize() {
        if (this.composer) {
            this.composer.setSize(window.innerWidth, window.innerHeight);
        }
        if (this.bloomPass) {
            this.bloomPass.setSize(window.innerWidth / 2, window.innerHeight / 2);
        }
        if (this.fxaaPass && this.fxaaPass.uniforms) {
            const pixelRatio = this.renderer.getPixelRatio();
            this.fxaaPass.uniforms['resolution'].value.set(
                1 / (window.innerWidth * pixelRatio),
                1 / (window.innerHeight * pixelRatio)
            );
        }
    }
}

