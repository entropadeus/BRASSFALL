/**
 * ScreenEffects - Manages screen-space effects like damage flash, vignette, etc.
 * 
 * NOTE: This is a placeholder for screen effects that may be added later.
 * Current screen effects are handled directly in the HTML/CSS.
 */
export class ScreenEffects {
    constructor(dependencies = {}) {
        // Placeholder for future screen effects
    }

    // Damage flash effect
    triggerDamageFlash(intensity = 1.0) {
        const damageFlash = document.getElementById('damage-flash');
        if (damageFlash) {
            damageFlash.style.opacity = intensity;
            setTimeout(() => {
                damageFlash.style.opacity = 0;
            }, 100);
        }
    }

    // Damage direction indicator
    showDamageDirection(direction) {
        const damageDirection = document.getElementById('damage-direction');
        if (!damageDirection) return;

        // Clear existing arrows
        const existingArrows = damageDirection.querySelectorAll('.damage-arrow');
        existingArrows.forEach(arrow => arrow.remove());

        // Determine which arrow to show based on direction
        // direction is a normalized Vector3
        const angle = Math.atan2(direction.x, direction.z);
        const angleDeg = (angle * 180 / Math.PI + 360) % 360;

        let arrowClass = '';
        if (angleDeg >= 337.5 || angleDeg < 22.5) arrowClass = 'top';
        else if (angleDeg >= 22.5 && angleDeg < 67.5) arrowClass = 'top-right';
        else if (angleDeg >= 67.5 && angleDeg < 112.5) arrowClass = 'right';
        else if (angleDeg >= 112.5 && angleDeg < 157.5) arrowClass = 'bottom-right';
        else if (angleDeg >= 157.5 && angleDeg < 202.5) arrowClass = 'bottom';
        else if (angleDeg >= 202.5 && angleDeg < 247.5) arrowClass = 'bottom-left';
        else if (angleDeg >= 247.5 && angleDeg < 292.5) arrowClass = 'left';
        else arrowClass = 'top-left';

        const arrow = document.createElement('div');
        arrow.className = `damage-arrow ${arrowClass}`;
        arrow.style.opacity = '1';
        damageDirection.appendChild(arrow);

        setTimeout(() => {
            arrow.style.opacity = '0';
            setTimeout(() => arrow.remove(), 100);
        }, 200);
    }

    // Low health vignette
    updateLowHealthVignette(healthPercent) {
        const vignette = document.getElementById('low-health-vignette');
        if (!vignette) return;

        if (healthPercent < 0.3) {
            vignette.style.opacity = (0.3 - healthPercent) / 0.3;
            if (healthPercent < 0.15) {
                vignette.classList.add('pulse');
            } else {
                vignette.classList.remove('pulse');
            }
        } else {
            vignette.style.opacity = 0;
            vignette.classList.remove('pulse');
        }
    }
}

