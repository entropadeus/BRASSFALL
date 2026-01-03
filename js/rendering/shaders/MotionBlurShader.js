export const MotionBlurShader = {
    uniforms: {
        tDiffuse: { value: null },
        velocityX: { value: 0.0 },
        velocityY: { value: 0.0 },
        samples: { value: 4 }
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
        uniform float velocityX;
        uniform float velocityY;
        uniform float samples;
        varying vec2 vUv;

        void main() {
            vec2 velocity = vec2(velocityX, velocityY);
            float speed = length(velocity);

            if (speed < 0.001) {
                gl_FragColor = texture2D(tDiffuse, vUv);
                return;
            }

            vec2 dir = velocity / speed;
            vec4 color = vec4(0.0);
            float total = 0.0;

            for (float i = 0.0; i < 16.0; i++) {
                if (i >= samples) break;
                float t = (i / (samples - 1.0)) - 0.5;
                vec2 offset = dir * t * speed;
                float weight = 1.0 - abs(t * 2.0);
                color += texture2D(tDiffuse, vUv + offset) * weight;
                total += weight;
            }

            gl_FragColor = color / total;
        }
    `
};

