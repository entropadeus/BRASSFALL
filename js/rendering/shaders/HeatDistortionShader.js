export const HeatDistortionShader = {
    uniforms: {
        tDiffuse: { value: null },
        time: { value: 0.0 },
        distortionStrength: { value: 0.003 },
        heatLine: { value: 0.2 }
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
        uniform float time;
        uniform float distortionStrength;
        uniform float heatLine;
        varying vec2 vUv;

        float noise(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float smoothNoise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);

            float a = noise(i);
            float b = noise(i + vec2(1.0, 0.0));
            float c = noise(i + vec2(0.0, 1.0));
            float d = noise(i + vec2(1.0, 1.0));

            return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        void main() {
            // Heat distortion strongest near bottom of screen (ground level)
            float heatMask = smoothstep(heatLine + 0.15, heatLine, vUv.y);

            // Multi-octave noise for realistic heat waves
            float n1 = smoothNoise(vUv * 20.0 + vec2(time * 0.5, time * 0.3));
            float n2 = smoothNoise(vUv * 40.0 + vec2(-time * 0.3, time * 0.5));
            float n3 = smoothNoise(vUv * 80.0 + vec2(time * 0.4, -time * 0.2));

            float distortion = (n1 * 0.5 + n2 * 0.3 + n3 * 0.2) * 2.0 - 1.0;

            vec2 offset = vec2(distortion, distortion * 0.5) * distortionStrength * heatMask;

            vec4 color = texture2D(tDiffuse, vUv + offset);

            gl_FragColor = color;
        }
    `
};

