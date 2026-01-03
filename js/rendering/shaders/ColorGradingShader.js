import * as THREE from 'three';

export const ColorGradingShader = {
    uniforms: {
        tDiffuse: { value: null },
        contrast: { value: 1.15 },
        saturation: { value: 1.2 },
        brightness: { value: 1.0 },
        shadowColor: { value: new THREE.Vector3(0.1, 0.05, 0.15) },
        midtoneColor: { value: new THREE.Vector3(1.0, 0.95, 0.9) },
        highlightColor: { value: new THREE.Vector3(1.0, 0.9, 0.8) },
        lift: { value: new THREE.Vector3(0.0, 0.0, 0.02) },
        gamma: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
        gain: { value: new THREE.Vector3(1.0, 0.98, 0.95) }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float contrast;
        uniform float saturation;
        uniform float brightness;
        uniform vec3 shadowColor;
        uniform vec3 midtoneColor;
        uniform vec3 highlightColor;
        uniform vec3 lift;
        uniform vec3 gamma;
        uniform vec3 gain;
        varying vec2 vUv;

        vec3 adjustSaturation(vec3 color, float sat) {
            float luma = dot(color, vec3(0.299, 0.587, 0.114));
            return mix(vec3(luma), color, sat);
        }

        vec3 adjustContrast(vec3 color, float con) {
            return (color - 0.5) * con + 0.5;
        }

        vec3 liftGammaGain(vec3 color, vec3 lift, vec3 gamma, vec3 gain) {
            vec3 lerpV = clamp(pow(color, 1.0 / gamma), 0.0, 1.0);
            return gain * lerpV + lift * (1.0 - lerpV);
        }

        void main() {
            vec4 texel = texture2D(tDiffuse, vUv);
            vec3 color = texel.rgb;

            // Brightness
            color *= brightness;

            // Contrast
            color = adjustContrast(color, contrast);

            // Saturation
            color = adjustSaturation(color, saturation);

            // Lift/Gamma/Gain
            color = liftGammaGain(color, lift, gamma, gain);

            // Color tinting based on luminance
            float luma = dot(color, vec3(0.299, 0.587, 0.114));

            // Shadow tint (dark areas get cool/purple tint)
            float shadowMask = 1.0 - smoothstep(0.0, 0.3, luma);
            color = mix(color, color * shadowColor * 3.0, shadowMask * 0.3);

            // Highlight tint (bright areas get warm tint)
            float highlightMask = smoothstep(0.6, 1.0, luma);
            color = mix(color, color * highlightColor, highlightMask * 0.4);

            // Midtone tint
            float midtoneMask = 1.0 - abs(luma - 0.5) * 2.0;
            color *= mix(vec3(1.0), midtoneColor, midtoneMask * 0.2);

            gl_FragColor = vec4(clamp(color, 0.0, 1.0), texel.a);
        }
    `
};

