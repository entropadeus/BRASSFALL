/**
 * Multiplier - Manages kill multiplier system with UI and sounds
 * 
 * NOTE: Requires global references to:
 * - AudioManager.actx (AudioContext) for procedural sounds
 * - playSound function for multiplier sounds
 */
export class Multiplier {
    constructor(dependencies = {}) {
        const {
            AudioManager,
            playSound = () => {}
        } = dependencies;

        this.AudioManager = AudioManager;
        this.playSound = playSound;

        this.killMultiplier = 1;
        this.killMultiplierMax = 10;
        this.killMultiplierDecayTime = 3.0; // Seconds before multiplier decays
        this.killMultiplierTimer = 0;
        this.lastMultiplierLevel = 1;
    }

    update(dt) {
        if (this.killMultiplierTimer > 0) {
            this.killMultiplierTimer -= dt;
            this.updateUI();

            if (this.killMultiplierTimer <= 0) {
                this.reset();
            }
        }
    }

    addKill(basePoints, isHeadshot = false) {
        // Apply multiplier
        const multipliedPoints = Math.floor(basePoints * this.killMultiplier);

        // Increase multiplier (caps at max)
        const oldMultiplier = this.killMultiplier;
        this.killMultiplier = Math.min(this.killMultiplier + 1, this.killMultiplierMax);

        // Reset decay timer
        this.killMultiplierTimer = this.killMultiplierDecayTime;

        // Update UI
        this.updateUI();

        // Play feedback if multiplier increased
        if (this.killMultiplier > oldMultiplier) {
            this.playMultiplierSound(this.killMultiplier);
            this.bumpUI();
        }

        // Show floating score with multiplier info
        if (this.killMultiplier > 1) {
            this.showMultiplierScore(multipliedPoints, this.killMultiplier);
        }

        return multipliedPoints;
    }

    updateUI() {
        const container = document.getElementById('multiplier-container');
        const valueEl = document.getElementById('multiplier-value');
        const timerFill = document.getElementById('multiplier-timer-fill');

        if (!container || !valueEl || !timerFill) return;

        // Show/hide based on multiplier
        if (this.killMultiplier > 1) {
            container.classList.add('active');
            container.classList.remove('lost');
        }

        // Update value text
        valueEl.textContent = this.killMultiplier + 'x';

        // Update timer bar
        const timerPercent = (this.killMultiplierTimer / this.killMultiplierDecayTime) * 100;
        timerFill.style.width = timerPercent + '%';

        // Update color tier (1-2: white, 3-4: yellow, 5-6: orange, 7-8: dark orange, 9-10: red)
        let tier = 1;
        if (this.killMultiplier >= 9) tier = 5;
        else if (this.killMultiplier >= 7) tier = 4;
        else if (this.killMultiplier >= 5) tier = 3;
        else if (this.killMultiplier >= 3) tier = 2;
        container.setAttribute('data-tier', tier);

        // Warning pulse when timer is low
        if (this.killMultiplierTimer < 1.0 && this.killMultiplier > 1) {
            container.classList.add('warning');
        } else {
            container.classList.remove('warning');
        }
    }

    bumpUI() {
        const valueEl = document.getElementById('multiplier-value');
        if (!valueEl) return;

        valueEl.classList.remove('bump');
        void valueEl.offsetWidth;
        valueEl.classList.add('bump');
    }

    reset() {
        if (this.killMultiplier <= 1) return;

        const container = document.getElementById('multiplier-container');
        if (container) {
            container.classList.add('lost');
            container.classList.remove('active', 'warning');
        }

        // Play lost sound
        this.playMultiplierLostSound();

        // Reset state
        this.killMultiplier = 1;
        this.killMultiplierTimer = 0;
        this.lastMultiplierLevel = 1;
    }

    playMultiplierSound(level) {
        if (!this.AudioManager || !this.AudioManager.actx) return;

        const actx = this.AudioManager.actx;
        const now = actx.currentTime;

        // Rising pitch based on multiplier level
        const baseFreq = 400 + (level - 1) * 80;

        // Quick ascending tone
        const osc = actx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq * 0.8, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.2, now + 0.08);

        const gain = actx.createGain();
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        // Add harmonics for richness at higher levels
        if (level >= 5) {
            const osc2 = actx.createOscillator();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(baseFreq * 1.5, now);
            osc2.frequency.exponentialRampToValueAtTime(baseFreq * 2, now + 0.1);

            const gain2 = actx.createGain();
            gain2.gain.setValueAtTime(0.08, now);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            osc2.connect(gain2);
            gain2.connect(actx.destination);
            osc2.start(now);
            osc2.stop(now + 0.15);
        }

        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
    }

    playMultiplierLostSound() {
        if (!this.AudioManager || !this.AudioManager.actx) return;

        const actx = this.AudioManager.actx;
        const now = actx.currentTime;

        // Descending sad tone
        const osc = actx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);

        const gain = actx.createGain();
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
    }

    showMultiplierScore(points, mult) {
        const popup = document.createElement('div');
        popup.className = 'multiplier-popup';
        popup.innerHTML = `+${points} <span style="color: #ffcc00; font-size: 0.7em;">(${mult}x)</span>`;
        popup.style.cssText = `
            position: fixed;
            top: 45%;
            left: 50%;
            transform: translateX(-50%);
            font-size: 24px;
            font-weight: bold;
            color: #fff;
            text-shadow: 0 0 10px rgba(255, 200, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.8);
            pointer-events: none;
            z-index: 150;
            animation: multiplier-score-float 0.8s ease forwards;
        `;

        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 800);
    }

    getMultiplier() {
        return this.killMultiplier;
    }

    getTimer() {
        return this.killMultiplierTimer;
    }
}

