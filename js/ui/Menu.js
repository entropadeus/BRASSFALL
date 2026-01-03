/**
 * Menu - Manages main menu, pause menu, and game over screen
 * 
 * NOTE: Requires global references to:
 * - restartGame function
 * - AudioManager for music control
 */
export class Menu {
    constructor(dependencies = {}) {
        const {
            restartGame = () => {},
            AudioManager
        } = dependencies;

        this.restartGame = restartGame;
        this.AudioManager = AudioManager;
        this.isPaused = false;
        this.mainMenuVisible = true;

        this.init();
    }

    init() {
        // Audio elements
        const bgMusic = document.getElementById('bg-music');
        const musicSlider = document.getElementById('music-volume');
        const sfxSlider = document.getElementById('sfx-volume');
        const musicValueDisplay = document.getElementById('music-value');
        const sfxValueDisplay = document.getElementById('sfx-value');
        const toggleMusicBtn = document.getElementById('toggle-music');
        const toggleSfxBtn = document.getElementById('toggle-sfx');

        // Audio state
        let musicVol = 0.5;
        let sfxVol = 0.7;
        let isMusicMuted = false;
        let isSfxMuted = false;

        // Music volume slider
        if (musicSlider) {
            musicSlider.addEventListener('input', (e) => {
                e.stopPropagation();
                musicVol = e.target.value / 100;
                if (this.AudioManager) {
                    this.AudioManager.updateMusicVolume(musicVol, isMusicMuted);
                }
                if (musicValueDisplay) musicValueDisplay.textContent = e.target.value + '%';
            });
            musicSlider.addEventListener('mousedown', (e) => e.stopPropagation());
            musicSlider.addEventListener('click', (e) => e.stopPropagation());
        }

        // SFX volume slider
        if (sfxSlider) {
            sfxSlider.addEventListener('input', (e) => {
                e.stopPropagation();
                sfxVol = e.target.value / 100;
                if (this.AudioManager) {
                    this.AudioManager.updateSfxVolume(sfxVol, isSfxMuted);
                }
                if (sfxValueDisplay) sfxValueDisplay.textContent = e.target.value + '%';
            });
            sfxSlider.addEventListener('mousedown', (e) => e.stopPropagation());
            sfxSlider.addEventListener('click', (e) => e.stopPropagation());
        }

        // Stop propagation on entire audio settings panel
        const audioSettings = document.getElementById('audio-settings');
        if (audioSettings) {
            audioSettings.addEventListener('mousedown', (e) => e.stopPropagation());
            audioSettings.addEventListener('click', (e) => e.stopPropagation());
        }

        // In-game toggle buttons
        if (toggleMusicBtn) {
            toggleMusicBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                isMusicMuted = !isMusicMuted;
                if (this.AudioManager) {
                    this.AudioManager.updateMusicVolume(musicVol, isMusicMuted);
                }
                toggleMusicBtn.classList.toggle('muted', isMusicMuted);
                toggleMusicBtn.innerHTML = isMusicMuted ? '&#128263;' : '&#9835;';
            });
        }

        if (toggleSfxBtn) {
            toggleSfxBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                isSfxMuted = !isSfxMuted;
                if (this.AudioManager) {
                    this.AudioManager.updateSfxVolume(sfxVol, isSfxMuted);
                }
                toggleSfxBtn.classList.toggle('muted', isSfxMuted);
                toggleSfxBtn.innerHTML = isSfxMuted ? '&#128263;' : '&#128266;';
            });
        }

        // Spawn floating particles
        const particleContainer = document.getElementById('menu-particles');
        if (particleContainer) {
            for (let i = 0; i < 30; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 8 + 's';
                particle.style.animationDuration = (6 + Math.random() * 4) + 's';
                particleContainer.appendChild(particle);
            }
        }

        // Play button handler
        const playBtn = document.getElementById('play-btn');
        const mainMenu = document.getElementById('main-menu');

        if (playBtn) {
            playBtn.addEventListener('click', () => this.startGame());
        }

        // Also start on any click when menu is visible (but not on controls)
        if (mainMenu) {
            mainMenu.addEventListener('click', (e) => {
                // Don't start if clicking audio controls
                if (e.target.closest('.audio-settings')) return;
                if (e.target.closest('.menu-btn')) return;
                if (e.target === mainMenu || e.target.closest('.menu-vignette') || e.target.closest('.menu-grid')) {
                    this.startGame();
                }
            });
        }

        // Pause menu button handlers
        const resumeBtn = document.getElementById('resume-btn');
        const restartBtn = document.getElementById('restart-btn');

        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => this.resumeGame());
        }

        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.resumeGame();
                this.restartGame();
            });
        }
    }

    startGame() {
        const mainMenu = document.getElementById('main-menu');
        if (mainMenu) {
            mainMenu.style.opacity = '0';
            mainMenu.style.transition = 'opacity 0.5s ease-out';
            setTimeout(() => {
                mainMenu.style.display = 'none';
            }, 500);
        }
        this.mainMenuVisible = false;

        // Make sure music is playing
        const bgMusic = document.getElementById('bg-music');
        if (bgMusic) bgMusic.play();

        document.body.requestPointerLock();
    }

    pauseGame() {
        this.isPaused = true;
        const pauseOverlay = document.getElementById('pause-overlay');
        if (pauseOverlay) {
            pauseOverlay.classList.add('active');
        }
        document.exitPointerLock();
    }

    resumeGame() {
        this.isPaused = false;
        const pauseOverlay = document.getElementById('pause-overlay');
        if (pauseOverlay) {
            pauseOverlay.classList.remove('active');
        }
        document.body.requestPointerLock();
    }

    togglePause() {
        if (this.isPaused) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }

    showGameOver(finalScore, finalWave) {
        const gameOverScreen = document.getElementById('game-over');
        const finalScoreEl = document.getElementById('final-score');
        const finalWaveEl = document.getElementById('final-wave');

        if (gameOverScreen) {
            gameOverScreen.style.display = 'flex';
        }
        if (finalScoreEl) {
            finalScoreEl.textContent = finalScore;
        }
        if (finalWaveEl) {
            finalWaveEl.textContent = finalWave;
        }
        document.exitPointerLock();
    }

    hideGameOver() {
        const gameOverScreen = document.getElementById('game-over');
        if (gameOverScreen) {
            gameOverScreen.style.display = 'none';
        }
    }
}

