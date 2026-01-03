import * as THREE from 'three';

export const DepthOfFieldShader = {
    uniforms: {
        tDiffuse: { value: null },
        tDepth: { value: null },
        resolution: { value: new THREE.Vector2(1920, 1080) },
        focusDistance: { value: 10.0 },
        focusRange: { value: 5.0 },
        bokehStrength: { value: 2.0 },
        cameraNear: { value: 0.1 },
        cameraFar: { value: 1000.0 }
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
        uniform sampler2D tDepth;
        uniform vec2 resolution;
        uniform float focusDistance;
        uniform float focusRange;
        uniform float bokehStrength;
        uniform float cameraNear;
        uniform float cameraFar;
        varying vec2 vUv;

        float getDepth(vec2 coord) {
            float fragCoordZ = texture2D(tDepth, coord).x;
            return (2.0 * cameraNear * cameraFar) / (cameraFar + cameraNear - fragCoordZ * (cameraFar - cameraNear));
        }

        void main() {
            float depth = getDepth(vUv);
            float blur = abs(depth - focusDistance) / focusRange;
            blur = clamp(blur * bokehStrength, 0.0, 1.0);

            vec2 texelSize = 1.0 / resolution;
            vec4 color = vec4(0.0);
            float total = 0.0;

            // Hexagonal bokeh pattern
            const int SAMPLES = 36;
            for (int i = 0; i < SAMPLES; i++) {
                float angle = float(i) * 6.28318530718 / float(SAMPLES);
                float dist = blur * 8.0 * (0.5 + 0.5 * fract(float(i) * 0.618));
                vec2 offset = vec2(cos(angle), sin(angle)) * texelSize * dist;
                color += texture2D(tDiffuse, vUv + offset);
                total += 1.0;
            }

            gl_FragColor = color / total;
        }
    `
};

