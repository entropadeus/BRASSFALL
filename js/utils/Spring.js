export class Spring {
    constructor(stiffness, damping, mass) {
        this.stiffness = stiffness;
        this.damping = damping;
        this.mass = mass;
        this.position = 0;
        this.velocity = 0;
        this.target = 0;
    }

    // Semi-implicit Euler for more stable, organic motion
    update(dt) {
        // Sub-step for stability if dt is too large (prevents explosion)
        const MAX_DT = 0.016; 
        let remainingDt = Math.min(dt, 0.1); // Cap input dt at 100ms

        while (remainingDt > 0) {
            const step = Math.min(remainingDt, MAX_DT);
            
            const displacement = this.position - this.target;
            const springForce = -this.stiffness * displacement;
            const dampingForce = -this.damping * this.velocity;
            const acceleration = (springForce + dampingForce) / this.mass;

            this.velocity += acceleration * step;
            this.position += this.velocity * step;
            
            remainingDt -= step;
        }

        // Safety clamp to prevent NaN propagation
        if (!Number.isFinite(this.position)) {
            this.position = this.target || 0;
            this.velocity = 0;
        }

        return this.position;
    }

    impulse(force) {
        this.velocity += force / this.mass;
    }

    // Smooth impulse over time for more organic feel
    softImpulse(force, smoothness = 0.5) {
        this.velocity += (force / this.mass) * smoothness;
        this.target += (force / this.mass) * (1 - smoothness) * 0.1;
    }
}

// Dual-spring system for extra organic lag
export class DualSpring {
    constructor(primaryStiffness, primaryDamping, secondaryStiffness, secondaryDamping, mass) {
        this.primary = new Spring(primaryStiffness, primaryDamping, mass);
        this.secondary = new Spring(secondaryStiffness, secondaryDamping, mass * 1.5);
    }

    update(dt) {
        const primaryPos = this.primary.update(dt);
        this.secondary.target = primaryPos;
        return this.secondary.update(dt);
    }

    set target(val) { this.primary.target = val; }
    get target() { return this.primary.target; }

    impulse(force) {
        this.primary.impulse(force * 0.7);
        this.secondary.impulse(force * 0.3);
    }
}

