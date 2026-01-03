import * as THREE from 'three';

export const GodRaysShader = {
    uniforms: {
        tDiffuse: { value: null },
        lightPositionOnScreen: { value: new THREE.Vector2(0.3, 0.7) },
        exposure: { value: 0.35 },
        decay: { value: 0.96 },
        density: { value: 0.8 },
        weight: { value: 0.6 },
        samples: { value: 60 }
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
        uniform vec2 lightPositionOnScreen;
        uniform float exposure;
        uniform float decay;
        uniform float density;
        uniform float weight;
        uniform float samples;
        varying vec2 vUv;

        void main() {
            vec2 texCoord = vUv;
            vec2 deltaTexCoord = texCoord - lightPositionOnScreen;
            deltaTexCoord *= 1.0 / samples * density;

            vec4 color = texture2D(tDiffuse, texCoord);
            float illuminationDecay = 1.0;
            vec4 accumulatedColor = vec4(0.0);

            for (int i = 0; i < 100; i++) {
                if (float(i) >= samples) break;
                texCoord -= deltaTexCoord;
                vec4 sampleColor = texture2D(tDiffuse, texCoord);
                float luminance = dot(sampleColor.rgb, vec3(0.299, 0.587, 0.114));
                sampleColor *= illuminationDecay * weight * luminance;
                accumulatedColor += sampleColor;
                illuminationDecay *= decay;
            }

            accumulatedColor *= exposure;
            accumulatedColor.rgb = clamp(accumulatedColor.rgb, 0.0, 1.0);

            gl_FragColor = color + accumulatedColor * vec4(1.0, 0.9, 0.7, 1.0);
        }
    `
};

