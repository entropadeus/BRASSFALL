import * as THREE from 'three';

export const LensFlareShader = {
    uniforms: {
        tDiffuse: { value: null },
        sunPosition: { value: new THREE.Vector2(0.3, 0.7) },
        sunVisible: { value: 1.0 },
        flareStrength: { value: 0.4 },
        ghostStrength: { value: 0.3 },
        haloStrength: { value: 0.2 }
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
        uniform vec2 sunPosition;
        uniform float sunVisible;
        uniform float flareStrength;
        uniform float ghostStrength;
        uniform float haloStrength;
        varying vec2 vUv;

        vec3 flareColor(float t) {
            return mix(vec3(1.0, 0.6, 0.3), vec3(1.0, 0.9, 0.6), t);
        }

        void main() {
            vec4 color = texture2D(tDiffuse, vUv);

            if (sunVisible < 0.01) {
                gl_FragColor = color;
                return;
            }

            vec2 sunToCenter = vec2(0.5) - sunPosition;
            vec2 flareVector = sunToCenter;

            // Main sun glow
            float distToSun = length(vUv - sunPosition);
            float glow = exp(-distToSun * 4.0) * flareStrength * sunVisible;
            color.rgb += flareColor(0.0) * glow;

            // Ghost flares (reflections along the flare vector)
            for (int i = 1; i < 6; i++) {
                float t = float(i) / 6.0;
                vec2 ghostPos = sunPosition + flareVector * (0.3 + t * 1.4);
                float ghostDist = length(vUv - ghostPos);
                float ghostSize = 0.05 + t * 0.03;
                float ghost = smoothstep(ghostSize, 0.0, ghostDist) * ghostStrength * sunVisible;
                ghost *= (1.0 - t * 0.5);
                color.rgb += flareColor(t) * ghost * 0.5;
            }

            // Halo ring
            float haloDist = abs(length(vUv - sunPosition) - 0.25);
            float halo = smoothstep(0.02, 0.0, haloDist) * haloStrength * sunVisible * 0.3;
            color.rgb += vec3(1.0, 0.8, 0.5) * halo;

            // Anamorphic streak
            float streakX = exp(-abs(vUv.y - sunPosition.y) * 30.0) * exp(-abs(vUv.x - sunPosition.x) * 2.0);
            color.rgb += vec3(1.0, 0.7, 0.4) * streakX * flareStrength * sunVisible * 0.3;

            gl_FragColor = color;
        }
    `
};

