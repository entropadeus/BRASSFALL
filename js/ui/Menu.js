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

        // Spawn floating debris (Moon Gravity)
        const debrisContainer = document.getElementById('menu-debris');
        if (debrisContainer) {
            // Spawn standard debris (dust/rocks)
            for (let i = 0; i < 40; i++) {
                const debris = document.createElement('div');
                const isRock = Math.random() > 0.8;
                debris.className = isRock ? 'debris rock' : 'debris';
                
                // Random properties
                const size = isRock ? (Math.random() * 10 + 4) + 'px' : (Math.random() * 3 + 1) + 'px';
                debris.style.width = size;
                debris.style.height = size;
                debris.style.left = Math.random() * 100 + '%';
                
                // Randomize animation
                const duration = (isRock ? 20 : 10) + Math.random() * 15 + 's';
                const delay = Math.random() * -20 + 's'; // Start at random times
                debris.style.animationDuration = duration;
                debris.style.animationDelay = delay;
                
                if (isRock) {
                    debris.style.borderRadius = Math.random() * 50 + '%';
                    debris.style.opacity = Math.random() * 0.5 + 0.3;
                }

                debrisContainer.appendChild(debris);
            }

            // Spawn floating zombies
            for (let i = 0; i < 3; i++) {
                const zombie = document.createElement('div');
                zombie.className = 'zombie-floater';
                // Use a simple shape or text for now, could be an SVG or image
                zombie.style.width = '50px';
                zombie.style.height = '80px';
                zombie.style.background = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 50 100\'><rect x=\'15\' y=\'0\' width=\'20\' height=\'20\' fill=\'%23555\'/><rect x=\'10\' y=\'25\' width=\'30\' height=\'40\' fill=\'%23444\'/><rect x=\'5\' y=\'25\' width=\'10\' height=\'30\' fill=\'%23444\' transform=\'rotate(20 5 25)\'/><rect x=\'35\' y=\'25\' width=\'10\' height=\'30\' fill=\'%23444\' transform=\'rotate(-20 35 25)\'/><rect x=\'12\' y=\'70\' width=\'10\' height=\'30\' fill=\'%23333\'/><rect x=\'28\' y=\'70\' width=\'10\' height=\'30\' fill=\'%23333\'/></svg>") no-repeat center center';
                zombie.style.opacity = '0.3';
                zombie.style.left = (Math.random() * 80 + 10) + '%';
                zombie.style.animationDuration = (25 + Math.random() * 10) + 's';
                zombie.style.animationDelay = (Math.random() * -30) + 's';
                
                debrisContainer.appendChild(zombie);
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
                // Don't start if clicking interactions
                if (e.target.closest('.audio-settings')) return;
                if (e.target.closest('.menu-btn')) return;
                if (e.target.closest('.ui-panel')) return; // Don't start when clicking the panel background
                
                // Start if clicking the general background layers
                if (e.target === mainMenu || 
                    e.target.closest('.menu-vignette') || 
                    e.target.closest('.lab-grid') || 
                    e.target.closest('.moon-surface') ||
                    e.target.closest('.menu-debris-container')) {
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

