import * as THREE from 'three';

export const SSRShader = {
    uniforms: {
        tDiffuse: { value: null },
        tDepth: { value: null },
        resolution: { value: new THREE.Vector2(1920, 1080) },
        cameraNear: { value: 0.1 },
        cameraFar: { value: 1000.0 },
        reflectionStrength: { value: 0.3 },
        groundLevel: { value: 0.25 }
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
        uniform float reflectionStrength;
        uniform float groundLevel;
        varying vec2 vUv;

        float getDepth(vec2 coord) {
            float fragCoordZ = texture2D(tDepth, coord).x;
            return (2.0 * cameraNear * cameraFar) / (cameraFar + cameraNear - fragCoordZ * (cameraFar - cameraNear));
        }

        void main() {
            vec4 color = texture2D(tDiffuse, vUv);

            // Only apply reflections near ground level (bottom portion of screen)
            float reflectionMask = smoothstep(groundLevel + 0.1, groundLevel, vUv.y);

            if (reflectionMask > 0.01) {
                // Mirror UV for reflection
                vec2 reflectedUv = vec2(vUv.x, groundLevel + (groundLevel - vUv.y));

                if (reflectedUv.y >= 0.0 && reflectedUv.y <= 1.0) {
                    vec4 reflectedColor = texture2D(tDiffuse, reflectedUv);

                    // Fade reflection based on distance from ground
                    float fadeFactor = 1.0 - abs(vUv.y - groundLevel) * 4.0;
                    fadeFactor = clamp(fadeFactor, 0.0, 1.0);

                    // Blend with roughness simulation (blur)
                    float blur = (groundLevel - vUv.y) * 0.05;
                    vec4 blurredReflection = vec4(0.0);
                    float total = 0.0;
                    for (int i = -2; i <= 2; i++) {
                        for (int j = -2; j <= 2; j++) {
                            vec2 offset = vec2(float(i), float(j)) * blur;
                            blurredReflection += texture2D(tDiffuse, reflectedUv + offset);
                            total += 1.0;
                        }
                    }
                    reflectedColor = blurredReflection / total;

                    color.rgb = mix(color.rgb, reflectedColor.rgb, reflectionMask * reflectionStrength * fadeFactor);
                }
            }

            gl_FragColor = color;
        }
    `
};

