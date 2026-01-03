import * as THREE from 'three';
import { Spring } from '../utils/Spring.js';

/**
 * WeaponBase - Base class for all weapons
 * This is a simplified base class that weapons can extend
 */
class WeaponBase {
    constructor(name, config) {
        this.name = name;
        this.ammo = config.ammo || 30;
        this.reserve = config.reserve || 90;
        this.magSize = config.magSize || 30;
        this.fireRate = config.fireRate || 0.1;
        this.damageMultiplier = config.damageMultiplier || 1.0;
        this.isReloading = false;
        this.lastShotTime = 0;
        this.weaponGroup = null;
        this.recoilGroup = null;
    }

    canFire() {
        return !this.isReloading && this.ammo > 0;
    }

    fire() {
        if (!this.canFire()) return false;
        const now = performance.now() / 1000;
        if (now - this.lastShotTime < this.fireRate) return false;
        this.lastShotTime = now;
        this.ammo--;
        return true;
    }

    reload() {
        // Override in subclasses
        return false;
    }
}

export { WeaponBase };

