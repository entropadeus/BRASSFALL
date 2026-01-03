/**
 * Input - Centralized input handling
 */
export class Input {
    constructor() {
        this.keys = {};
        this.moveState = { f: false, b: false, l: false, r: false, sprint: false };
        this.isFiring = false;
        this.isAiming = false;
        this.pointerLocked = false;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Pointer lock change
        document.addEventListener('pointerlockchange', () => {
            this.pointerLocked = document.pointerLockElement === document.body;
        });

        document.addEventListener('pointerlockerror', () => {
            console.warn('Pointer lock failed');
            this.pointerLocked = false;
        });
    }

    handleKeyDown(e, callbacks = {}) {
        const {
            onPause = () => {},
            onReload = () => {},
            onWeaponSwitch = () => {},
            onMoveStateChange = () => {},
            onJump = () => {}
        } = callbacks;

        // ESC to pause/unpause
        if (e.code === 'Escape') {
            onPause();
            return;
        }

        this.keys[e.code] = true;

        // Movement
        if (e.code === 'KeyW') {
            this.moveState.f = true;
            onMoveStateChange(this.moveState);
        }
        if (e.code === 'KeyS') {
            this.moveState.b = true;
            onMoveStateChange(this.moveState);
        }
        if (e.code === 'KeyA') {
            this.moveState.l = true;
            onMoveStateChange(this.moveState);
        }
        if (e.code === 'KeyD') {
            this.moveState.r = true;
            onMoveStateChange(this.moveState);
        }
        if (e.code === 'ShiftLeft') {
            this.moveState.sprint = true;
            onMoveStateChange(this.moveState);
        }
        if (e.code === 'Space') {
            onJump();
        }

        // Actions
        if (e.code === 'KeyR') {
            onReload();
        }

        // Weapon switching
        if (e.code === 'Digit1') {
            onWeaponSwitch('ak');
        }
        if (e.code === 'Digit2') {
            onWeaponSwitch('sniper');
        }
        if (e.code === 'Digit3') {
            onWeaponSwitch('shotgun');
        }
    }

    handleKeyUp(e, callbacks = {}) {
        const { onMoveStateChange = () => {} } = callbacks;

        this.keys[e.code] = false;

        if (e.code === 'KeyW') {
            this.moveState.f = false;
            onMoveStateChange(this.moveState);
        }
        if (e.code === 'KeyS') {
            this.moveState.b = false;
            onMoveStateChange(this.moveState);
        }
        if (e.code === 'KeyA') {
            this.moveState.l = false;
            onMoveStateChange(this.moveState);
        }
        if (e.code === 'KeyD') {
            this.moveState.r = false;
            onMoveStateChange(this.moveState);
        }
        if (e.code === 'ShiftLeft') {
            this.moveState.sprint = false;
            onMoveStateChange(this.moveState);
        }
    }

    handleMouseDown(e, callbacks = {}) {
        const {
            onRequestPointerLock = () => {},
            onFireStart = () => {},
            onAimStart = () => {}
        } = callbacks;

        // Don't start game if clicking on audio controls
        if (e.target.closest('.audio-settings') || e.target.closest('.audio-slider')) {
            return;
        }

        if (!this.pointerLocked) {
            onRequestPointerLock();
        } else {
            if (e.button === 0) {
                this.isFiring = true;
                onFireStart();
            }
            if (e.button === 2) {
                this.isAiming = true;
                onAimStart();
            }
        }
    }

    handleMouseUp(e, callbacks = {}) {
        const {
            onFireStop = () => {},
            onAimStop = () => {}
        } = callbacks;

        if (e.button === 0) {
            this.isFiring = false;
            onFireStop();
        }
        if (e.button === 2) {
            this.isAiming = false;
            onAimStop();
        }
    }

    handleMouseMove(e, callbacks = {}) {
        const { onMouseMove = () => {} } = callbacks;

        if (this.pointerLocked) {
            onMouseMove(e);
        }
    }

    handleMouseWheel(e, callbacks = {}) {
        const { onWeaponSwitch = () => {} } = callbacks;

        if (!this.pointerLocked) return;

        const weaponOrder = ['ak', 'sniper', 'shotgun'];
        const currentIdx = weaponOrder.indexOf(callbacks.currentWeapon || 'ak');

        if (e.deltaY > 0) {
            // Scroll down - next weapon
            const nextIdx = (currentIdx + 1) % weaponOrder.length;
            onWeaponSwitch(weaponOrder[nextIdx]);
        } else if (e.deltaY < 0) {
            // Scroll up - previous weapon
            const prevIdx = (currentIdx - 1 + weaponOrder.length) % weaponOrder.length;
            onWeaponSwitch(weaponOrder[prevIdx]);
        }
    }

    requestPointerLock() {
        document.body.requestPointerLock();
    }

    getMoveState() {
        return this.moveState;
    }

    getIsFiring() {
        return this.isFiring;
    }

    getIsAiming() {
        return this.isAiming;
    }

    getPointerLocked() {
        return this.pointerLocked;
    }
}

