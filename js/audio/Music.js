import { AudioManager } from './AudioManager.js';

const Music = {
    bgMusicElement: null,
    audioStarted: false,

    init() {
        this.bgMusicElement = document.getElementById('bg-music');
        if (!this.bgMusicElement) {
            console.warn('bg-music element not found');
            return;
        }

        // Initial volume
        this.bgMusicElement.volume = AudioManager.musicVolume;

        // Try to initialize spatial audio
        if (!AudioManager.spatialInitialized) {
            AudioManager.initSpatialAudio(this.bgMusicElement);
        }

        // Try to start immediately
        this.start();

        // Also try on any user interaction
        const onFirstInteraction = () => {
            this.start();
        };
        document.addEventListener('click', onFirstInteraction, { once: true });
        document.addEventListener('keydown', onFirstInteraction, { once: true });

        // Debug: log audio element state
        this.bgMusicElement.addEventListener('error', (e) => {
            console.error('Audio error:', this.bgMusicElement.error);
        });
        this.bgMusicElement.addEventListener('canplay', () => {
            console.log('Audio can play');
        });
    },

    start() {
        if (this.audioStarted || !this.bgMusicElement) return;

        // Try spatial audio first
        if (!AudioManager.spatialInitialized) {
            try {
                AudioManager.initSpatialAudio(this.bgMusicElement);
            } catch (e) {
                console.error('Spatial audio failed:', e);
            }
        }

        // Resume audio context if needed
        if (AudioManager.musicAudioCtx && AudioManager.musicAudioCtx.state === 'suspended') {
            AudioManager.musicAudioCtx.resume().catch(e => console.log('Resume failed:', e));
        }

        // Set volume based on whether spatial audio is active
        if (AudioManager.spatialInitialized && AudioManager.musicGainNode) {
            this.bgMusicElement.volume = 1.0; // Full volume to spatial processor
            AudioManager.musicGainNode.gain.value = AudioManager.musicMuted ? 0 : AudioManager.musicVolume;
        } else {
            this.bgMusicElement.volume = AudioManager.musicMuted ? 0 : AudioManager.musicVolume;
        }

        // Play the music
        this.bgMusicElement.play().then(() => {
            this.audioStarted = true;
            console.log('Music playing, spatial audio:', AudioManager.spatialInitialized);
        }).catch(e => {
            console.log('Music autoplay blocked, waiting for interaction');
        });
    },

    stop() {
        if (this.bgMusicElement) {
            this.bgMusicElement.pause();
            this.bgMusicElement.currentTime = 0;
        }
        this.audioStarted = false;
    },

    pause() {
        if (this.bgMusicElement) {
            this.bgMusicElement.pause();
        }
    },

    resume() {
        if (this.bgMusicElement) {
            this.bgMusicElement.play().catch(e => {
                console.log('Music resume failed:', e);
            });
        }
    },

    updateVolume(vol, muted) {
        AudioManager.updateMusicVolume(vol, muted);
    }
};

export { Music };

