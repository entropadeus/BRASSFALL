export const VignetteShader = {
    uniforms: {
        tDiffuse: { value: null },
        intensity: { value: 0.4 },
        smoothness: { value: 0.5 }
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
        uniform float intensity;
        uniform float smoothness;
        varying vec2 vUv;
        void main() {
            vec4 color = texture2D(tDiffuse, vUv);
            vec2 center = vUv - 0.5;
            float dist = length(center);
            float vignette = smoothstep(0.5, 0.5 - smoothness, dist * (intensity + 0.5));
            color.rgb *= vignette;
            gl_FragColor = color;
        }
    `
};

