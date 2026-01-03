/**
 * HUD - Manages heads-up display updates
 * 
 * NOTE: Requires global references to:
 * - Various game state variables (ammo, health, score, wave, etc.)
 * - DOM elements (ammo-display, health-fill, etc.)
 */
export class HUD {
    constructor(dependencies = {}) {
        const {
            getGameState = () => ({}),
            getWeaponState = () => ({})
        } = dependencies;

        this.getGameState = getGameState;
        this.getWeaponState = getWeaponState;
        this.lastHUDValues = {
            ammo: -1,
            reserve: -1,
            health: -1,
            score: -1,
            wave: -1,
            isReloading: false,
            weapon: 'ak',
            remaining: -1,
            speedSec: 0,
            damageSec: 0,
            rapidSec: 0,
            infiniteSec: 0,
            explosiveSec: 0,
            penetratingSec: 0,
            shieldSec: 0
        };

        // Cache DOM references
        this.cachedDOM = null;
    }

    getCachedDOM() {
        if (!this.cachedDOM) {
            this.cachedDOM = {
                ammoDisplay: document.getElementById('ammo-display'),
                healthFill: document.getElementById('health-fill'),
                healthText: document.getElementById('health-text'),
                healthBar: document.getElementById('health-bar'),
                waveDisplay: document.getElementById('wave-display'),
                zombieCount: document.getElementById('zombie-count'),
                scoreDisplay: document.getElementById('score-display'),
                damageFlash: document.getElementById('damage-flash')
            };
        }
        return this.cachedDOM;
    }

    ensurePowerupsEl() {
        let powerupsEl = document.getElementById('powerups-display');
        if (!powerupsEl) {
            powerupsEl = document.createElement('div');
            powerupsEl.id = 'powerups-display';
            powerupsEl.style.cssText = `
                position: absolute; bottom: 60px; left: 20px;
                display: flex; flex-direction: column; gap: 5px; pointer-events: none;
            `;
            document.body.appendChild(powerupsEl);
        }
        return powerupsEl;
    }

    update(force = false) {
        const gameState = this.getGameState();
        const weaponState = this.getWeaponState();
        const dom = this.getCachedDOM();

        const {
            zombiesThisWave = 0,
            zombiesKilledThisWave = 0,
            playerHealth = 100,
            maxPlayerHealth = 100,
            score = 0,
            currentWave = 0,
            betweenWaves = false,
            isReloading = false,
            currentWeapon = 'ak',
            reserve = 90,
            isRegenerating = false,
            speedBoostTimer = 0,
            damageBoostTimer = 0,
            rapidFireTimer = 0,
            infiniteAmmoTimer = 0,
            explosiveRoundsTimer = 0,
            penetratingRoundsTimer = 0,
            shieldTimer = 0
        } = gameState;

        const {
            ammo = 30,
            sniperAmmo = 5,
            shotgunAmmo = 8,
            sniperMagSize = 5,
            shotgunMagSize = 8
        } = weaponState;

        const remaining = zombiesThisWave - zombiesKilledThisWave;
        const healthPercent = Math.ceil(playerHealth);

        // Get current weapon's ammo
        const currentAmmo = currentWeapon === 'sniper' ? sniperAmmo :
                            (currentWeapon === 'shotgun' ? shotgunAmmo : ammo);
        const currentMagSize = currentWeapon === 'sniper' ? sniperMagSize :
                               (currentWeapon === 'shotgun' ? shotgunMagSize : 30);
        const lowAmmoThreshold = currentWeapon === 'sniper' ? 2 :
                                 (currentWeapon === 'shotgun' ? 3 : 10);

        // Only update if values changed (or forced)
        if (force || this.lastHUDValues.ammo !== currentAmmo || 
            this.lastHUDValues.reserve !== reserve || 
            this.lastHUDValues.isReloading !== isReloading || 
            this.lastHUDValues.weapon !== currentWeapon) {
            
            this.lastHUDValues.ammo = currentAmmo;
            this.lastHUDValues.reserve = reserve;
            this.lastHUDValues.isReloading = isReloading;
            this.lastHUDValues.weapon = currentWeapon;
            
            if (dom.ammoDisplay) {
                if (isReloading) {
                    dom.ammoDisplay.innerText = 'RLD / ∞';
                } else {
                    dom.ammoDisplay.innerText = `${currentAmmo} / ∞`;
                }

                // Micro-animation classes for ammo state
                dom.ammoDisplay.classList.remove('low-ammo', 'empty', 'reloading');
                if (isReloading) {
                    dom.ammoDisplay.classList.add('reloading');
                } else if (currentAmmo === 0) {
                    dom.ammoDisplay.classList.add('empty');
                } else if (currentAmmo <= lowAmmoThreshold) {
                    dom.ammoDisplay.classList.add('low-ammo');
                }
            }
        }

        if (force || this.lastHUDValues.health !== healthPercent) {
            this.lastHUDValues.health = healthPercent;
            const pct = (playerHealth / maxPlayerHealth) * 100;

            if (dom.healthFill) {
                dom.healthFill.style.width = pct + '%';
                dom.healthFill.classList.remove('damaged', 'critical');
                // Only show damage colors when NOT regenerating
                if (!isRegenerating) {
                    if (pct <= 25) {
                        dom.healthFill.classList.add('critical');
                    } else if (pct <= 50) {
                        dom.healthFill.classList.add('damaged');
                    }
                }
            }
            if (dom.healthText) {
                dom.healthText.textContent = healthPercent;
                // Don't show critical during regen
                dom.healthText.classList.toggle('critical', pct <= 25 && !isRegenerating);
            }

            // Health bar border animation
            if (dom.healthBar) {
                dom.healthBar.classList.toggle('critical', pct <= 25 && !isRegenerating);
            }
        }

        if (force || this.lastHUDValues.wave !== currentWave || 
            this.lastHUDValues.remaining !== remaining) {
            
            const prevWave = this.lastHUDValues.wave;
            const prevRemaining = this.lastHUDValues.remaining;
            this.lastHUDValues.wave = currentWave;
            this.lastHUDValues.remaining = remaining;

            if (dom.waveDisplay) {
                if (betweenWaves && currentWave > 0) {
                    dom.waveDisplay.textContent = `BREACH ${currentWave} CONTAINED`;
                } else if (betweenWaves) {
                    dom.waveDisplay.textContent = `BREACH INCOMING...`;
                } else {
                    dom.waveDisplay.textContent = `BREACH ${currentWave}`;
                }

                // New wave animation
                if (currentWave !== prevWave && currentWave > 0) {
                    dom.waveDisplay.classList.remove('new-wave');
                    void dom.waveDisplay.offsetWidth;
                    dom.waveDisplay.classList.add('new-wave');
                }
            }
            if (dom.zombieCount) {
                dom.zombieCount.textContent = `${remaining} HOSTILES`;

                // Kill flash animation
                if (remaining < prevRemaining && remaining >= 0) {
                    dom.zombieCount.classList.remove('kill-flash');
                    void dom.zombieCount.offsetWidth;
                    dom.zombieCount.classList.add('kill-flash');
                }
            }
        }

        if (force || this.lastHUDValues.score !== score) {
            this.lastHUDValues.score = score;
            if (dom.scoreDisplay) {
                dom.scoreDisplay.textContent = score.toString().padStart(8, '0');
            }
        }

        // Power-ups (throttled to whole seconds)
        const speedSec = Math.ceil(speedBoostTimer);
        const damageSec = Math.ceil(damageBoostTimer);
        const rapidSec = Math.ceil(rapidFireTimer);
        const infiniteSec = Math.ceil(infiniteAmmoTimer);
        const explosiveSec = Math.ceil(explosiveRoundsTimer);
        const penetratingSec = Math.ceil(penetratingRoundsTimer);
        const shieldSec = Math.ceil(shieldTimer);

        // Check if any power-up changed
        const powerupsChanged = force ||
            this.lastHUDValues.speedSec !== speedSec ||
            this.lastHUDValues.damageSec !== damageSec ||
            this.lastHUDValues.rapidSec !== rapidSec ||
            this.lastHUDValues.infiniteSec !== infiniteSec ||
            this.lastHUDValues.explosiveSec !== explosiveSec ||
            this.lastHUDValues.penetratingSec !== penetratingSec ||
            this.lastHUDValues.shieldSec !== shieldSec;

        if (powerupsChanged) {
            this.lastHUDValues.speedSec = speedSec;
            this.lastHUDValues.damageSec = damageSec;
            this.lastHUDValues.rapidSec = rapidSec;
            this.lastHUDValues.infiniteSec = infiniteSec;
            this.lastHUDValues.explosiveSec = explosiveSec;
            this.lastHUDValues.penetratingSec = penetratingSec;
            this.lastHUDValues.shieldSec = shieldSec;

            const pEl = this.ensurePowerupsEl();
            let html = '';

            // Active power-ups with icons and colors
            if (shieldSec > 0) html += `<div class="powerup-item shield-active"><span class="powerup-icon">🛡️</span> SHIELD ${shieldSec}s</div>`;
            if (speedSec > 0) html += `<div class="powerup-item speed-active"><span class="powerup-icon">⚡</span> SPEED ${speedSec}s</div>`;
            if (damageSec > 0) html += `<div class="powerup-item damage-active"><span class="powerup-icon">💀</span> 2X DMG ${damageSec}s</div>`;
            if (rapidSec > 0) html += `<div class="powerup-item rapid-active"><span class="powerup-icon">🔥</span> RAPID FIRE ${rapidSec}s</div>`;
            if (infiniteSec > 0) html += `<div class="powerup-item infinite-active"><span class="powerup-icon">∞</span> INFINITE AMMO ${infiniteSec}s</div>`;
            if (explosiveSec > 0) html += `<div class="powerup-item explosive-active"><span class="powerup-icon">💥</span> EXPLOSIVE ${explosiveSec}s</div>`;
            if (penetratingSec > 0) html += `<div class="powerup-item penetrating-active"><span class="powerup-icon">🎯</span> ARMOR PIERCING ${penetratingSec}s</div>`;

            pEl.innerHTML = html;
        }
    }

    updateWeaponIndicator(currentWeapon) {
        const slots = document.querySelectorAll('.weapon-slot');
        slots.forEach(slot => {
            if (slot.dataset.weapon === currentWeapon) {
                slot.classList.add('active');
            } else {
                slot.classList.remove('active');
            }
        });
    }
}

