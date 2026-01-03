/**
 * Notifications - Manages hitmarkers, collateral notifications, and other UI notifications
 */
export class Notifications {
    constructor() {
        this.hitmarker = document.getElementById('hitmarker');
        this.hitmarkerTimeout = null;
        this.collateralNotification = null;
        this.collateralTimeout = null;
    }

    showHitmarker(isHeadshot = false) {
        if (!this.hitmarker) return;

        this.hitmarker.classList.add('show');
        if (isHeadshot) {
            this.hitmarker.classList.add('headshot');
        }
        if (this.hitmarkerTimeout) clearTimeout(this.hitmarkerTimeout);
        this.hitmarkerTimeout = setTimeout(() => {
            this.hitmarker.classList.remove('show');
            this.hitmarker.classList.remove('headshot');
        }, isHeadshot ? 200 : 100);
    }

    showCollateralNotification(killCount, playSound = () => {}) {
        if (!this.collateralNotification) {
            this.collateralNotification = document.createElement('div');
            this.collateralNotification.style.cssText = `
                position: fixed;
                top: 35%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-family: 'Segoe UI', sans-serif;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 4px;
                text-align: center;
                pointer-events: none;
                z-index: 200;
                opacity: 0;
                transition: opacity 0.15s ease;
            `;
            document.body.appendChild(this.collateralNotification);
        }

        const messages = {
            2: { text: 'DOUBLE KILL', color: '#ffcc00' },
            3: { text: 'TRIPLE KILL', color: '#ff6600' },
            4: { text: 'COLLATERAL!', color: '#ff0000' }
        };
        const msg = messages[Math.min(killCount, 4)];

        this.collateralNotification.innerHTML = `
            <div style="font-size: 32px; color: ${msg.color}; text-shadow: 0 0 20px ${msg.color}, 0 2px 4px rgba(0,0,0,0.8);">
                ${msg.text}
            </div>
            <div style="font-size: 16px; color: #fff; margin-top: 5px; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">
                +${killCount * 50} BONUS
            </div>
        `;
        this.collateralNotification.style.opacity = '1';

        // Play satisfying collateral sound
        playSound('collateral');

        if (this.collateralTimeout) clearTimeout(this.collateralTimeout);
        this.collateralTimeout = setTimeout(() => {
            this.collateralNotification.style.opacity = '0';
        }, 1500);
    }
}

