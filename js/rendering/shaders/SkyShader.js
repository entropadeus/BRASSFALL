export const skyVertexShader = `
varying vec3 vWorldPosition;
varying vec3 vDirection;
void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vDirection = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

export const skyFragmentShader = `
uniform vec3 topColor;
uniform vec3 midColor;
uniform vec3 bottomColor;
uniform vec3 sunColor;
uniform vec3 sunDirection;
uniform float time;
varying vec3 vWorldPosition;
varying vec3 vDirection;

// Simplex noise functions for procedural clouds
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float fbm(vec3 p) {
    float f = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
        f += amplitude * snoise(p);
        p *= 2.0;
        amplitude *= 0.5;
    }
    return f;
}

void main() {
    vec3 dir = normalize(vDirection);
    float h = dir.y;

    // More natural sunset gradient
    vec3 horizonColor = vec3(0.95, 0.5, 0.2);   // Warm orange at horizon
    vec3 lowerSkyColor = vec3(0.6, 0.35, 0.25); // Muted pink-orange

    vec3 skyColor;
    if (h < 0.0) {
        // Below horizon - dark
        skyColor = mix(vec3(0.03, 0.02, 0.02), bottomColor * 0.3, smoothstep(-0.2, 0.0, h));
    } else if (h < 0.15) {
        // Horizon band
        skyColor = mix(horizonColor, lowerSkyColor, smoothstep(0.0, 0.15, h));
    } else if (h < 0.4) {
        // Lower sky
        skyColor = mix(lowerSkyColor, midColor, smoothstep(0.15, 0.4, h));
    } else {
        // Upper sky fading to darker blue-purple
        skyColor = mix(midColor, topColor, smoothstep(0.4, 0.85, h));
    }

    // Sun glow - more natural
    float sunDot = dot(dir, normalize(sunDirection));
    float sunGlow = pow(max(sunDot, 0.0), 80.0);
    float sunHalo = pow(max(sunDot, 0.0), 12.0) * 0.3;
    float sunDisk = smoothstep(0.997, 0.999, sunDot);

    skyColor += sunColor * sunGlow * 1.5;
    skyColor += sunColor * sunHalo * 0.4;
    skyColor += sunColor * sunDisk * 2.0;

    // Subtle procedural clouds
    if (h > 0.0 && h < 0.5) {
        vec3 cloudPos = dir * 2.0 + vec3(time * 0.005, 0.0, time * 0.003);
        float cloud = fbm(cloudPos * 1.5);
        cloud = smoothstep(0.1, 0.5, cloud);

        // Clouds lit by sunset - muted colors
        vec3 cloudColor = mix(vec3(0.8, 0.5, 0.35), vec3(0.5, 0.3, 0.25), 1.0 - h * 2.0);

        // Light the clouds from sun direction
        float cloudLight = max(0.0, dot(dir, normalize(sunDirection)));
        cloudColor = mix(cloudColor * 0.5, cloudColor * 1.2, cloudLight);

        // Cloud density varies by height - less dense overall
        float cloudMask = smoothstep(0.0, 0.1, h) * smoothstep(0.5, 0.2, h);
        cloud *= cloudMask * 0.4; // Much less cloud coverage

        skyColor = mix(skyColor, cloudColor, cloud);
    }

    // Subtle atmospheric scattering
    float scatter = 1.0 - abs(h);
    scatter = pow(scatter, 4.0);
    skyColor = mix(skyColor, horizonColor * 0.8, scatter * 0.15);

    gl_FragColor = vec4(skyColor, 1.0);
}`;

