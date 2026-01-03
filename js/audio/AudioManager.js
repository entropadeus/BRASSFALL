const AudioContext = window.AudioContext || window.webkitAudioContext;

// Create singleton AudioContext
export const actx = new AudioContext();

// Master SFX volume control
export const masterSfxGain = actx.createGain();
masterSfxGain.gain.value = 0.7; // Default 70%
masterSfxGain.connect(actx.destination);

// Improved Reverb
export const convolver = actx.createConvolver();
export const dryGain = actx.createGain();
export const wetGain = actx.createGain();
dryGain.connect(masterSfxGain);
wetGain.connect(masterSfxGain);
wetGain.gain.value = 0.3; // Tighter reverb

// Setup reverb impulse
const sampleRate = actx.sampleRate;
const length = sampleRate * 1.0; // Short, slap-back reverb
const impulse = actx.createBuffer(2, length, sampleRate);
for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
        // Exponential decay for metallic room sound
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 6);
    }
}
convolver.buffer = impulse;
convolver.connect(wetGain);

/**
 * AudioManager - Manages global audio context, volume, and mute settings
 */
export class AudioManager {
    constructor() {
        this.actx = actx;
        this.masterSfxGain = masterSfxGain;
        this.convolver = convolver;
        this.dryGain = dryGain;
        this.wetGain = wetGain;
        
        this.sfxVolume = 0.7;
        this.musicVolume = 0.5;
        this.sfxMuted = false;
        this.musicMuted = false;
    }

    updateSfxVolume(volume, muted = false) {
        this.sfxVolume = volume;
        this.sfxMuted = muted;
        this.masterSfxGain.gain.value = muted ? 0 : volume;
    }

    updateMusicVolume(volume, muted = false) {
        this.musicVolume = volume;
        this.musicMuted = muted;
        if (typeof window.updateMusicVolume === 'function') {
            window.updateMusicVolume(volume, muted);
        }
    }

    setSfxMuted(muted) {
        this.sfxMuted = muted;
        this.masterSfxGain.gain.value = muted ? 0 : this.sfxVolume;
    }

    setMusicMuted(muted) {
        this.musicMuted = muted;
        if (typeof window.updateMusicVolume === 'function') {
            window.updateMusicVolume(this.musicVolume, muted);
        }
    }

    getActx() {
        return this.actx;
    }
}

// Legacy exports for backward compatibility
export let sfxVolume = 0.7;
export let musicVolume = 0.5;
export let sfxMuted = false;
export let musicMuted = false;

export function setSfxVolume(volume) {
    sfxVolume = volume;
    masterSfxGain.gain.value = sfxMuted ? 0 : volume;
}

export function setMusicVolume(volume) {
    musicVolume = volume;
    if (typeof window.updateMusicVolume === 'function') {
        window.updateMusicVolume(volume, musicMuted);
    }
}

export function setSfxMuted(muted) {
    sfxMuted = muted;
    masterSfxGain.gain.value = muted ? 0 : sfxVolume;
}

export function setMusicMuted(muted) {
    musicMuted = muted;
    if (typeof window.updateMusicVolume === 'function') {
        window.updateMusicVolume(musicVolume, muted);
    }
}

