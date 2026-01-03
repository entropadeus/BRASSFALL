import * as THREE from 'three';

export const SSAOShader = {
    uniforms: {
        tDiffuse: { value: null },
        tDepth: { value: null },
        resolution: { value: new THREE.Vector2(1920, 1080) },
        cameraNear: { value: 0.1 },
        cameraFar: { value: 1000.0 },
        radius: { value: 0.5 },
        aoStrength: { value: 1.2 },
        falloff: { value: 0.5 }
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
        uniform float cameraNear;
        uniform float cameraFar;
        uniform float radius;
        uniform float aoStrength;
        uniform float falloff;
        varying vec2 vUv;

        float readDepth(vec2 coord) {
            float fragCoordZ = texture2D(tDepth, coord).x;
            float viewZ = (cameraNear * cameraFar) / ((cameraFar - cameraNear) * fragCoordZ - cameraFar);
            return viewZ;
        }

        float random(vec2 co) {
            return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
            vec4 color = texture2D(tDiffuse, vUv);
            float depth = readDepth(vUv);

            if (depth > -1.0) {
                gl_FragColor = color;
                return;
            }

            float ao = 0.0;
            float sampleRadius = radius / abs(depth);

            const int samples = 16;
            for (int i = 0; i < samples; i++) {
                float angle = float(i) * 2.39996322973;
                float r = sampleRadius * (float(i + 1) / float(samples));
                vec2 offset = vec2(cos(angle), sin(angle)) * r;
                offset += (vec2(random(vUv + float(i)), random(vUv - float(i))) - 0.5) * sampleRadius * 0.25;

                float sampleDepth = readDepth(vUv + offset);
                float rangeCheck = smoothstep(0.0, 1.0, falloff / abs(depth - sampleDepth));
                ao += (sampleDepth > depth + 0.01 ? 1.0 : 0.0) * rangeCheck;
            }

            ao = 1.0 - (ao / float(samples)) * aoStrength;
            ao = clamp(ao, 0.0, 1.0);

            color.rgb *= ao;
            gl_FragColor = color;
        }
    `
};

