import { AudioManager } from './AudioManager.js';

function playSound(type) {
    // Check if SFX is muted
    if (AudioManager.sfxMuted) return;

    // Update master volume from global setting
    if (typeof AudioManager.sfxVolume === 'number') {
        AudioManager.masterSfxGain.gain.value = AudioManager.sfxVolume;
    }

    if (AudioManager.actx.state === 'suspended') AudioManager.actx.resume();
    const osc = AudioManager.actx.createOscillator();
    const gain = AudioManager.actx.createGain();
    const filter = AudioManager.actx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(AudioManager.dryGain);
    gain.connect(AudioManager.convolver);

    const now = AudioManager.actx.currentTime;

    if (type === 'shoot') {
        // BEEFY AK-47 SOUND - Maximum oomph

        // Layer 1: DEEP bass thump (chest punch)
        const bassOsc = AudioManager.actx.createOscillator();
        const bassGain = AudioManager.actx.createGain();
        const bassFilter = AudioManager.actx.createBiquadFilter();
        bassOsc.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(AudioManager.dryGain);
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(60, now);
        bassOsc.frequency.exponentialRampToValueAtTime(25, now + 0.12);
        bassFilter.type = 'lowpass';
        bassFilter.frequency.value = 150;
        bassGain.gain.setValueAtTime(1.2, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        bassOsc.start(now); bassOsc.stop(now + 0.2);

        // Layer 2: Mid punch (body of the shot)
        const midOsc = AudioManager.actx.createOscillator();
        const midGain = AudioManager.actx.createGain();
        midOsc.connect(midGain);
        midGain.connect(AudioManager.dryGain);
        midGain.connect(AudioManager.convolver);
        midOsc.type = 'sawtooth';
        midOsc.frequency.setValueAtTime(120, now);
        midOsc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
        midGain.gain.setValueAtTime(0.7, now);
        midGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        midOsc.start(now); midOsc.stop(now + 0.15);

        // Layer 3: Sharp transient crack (the snap)
        const crackBuf = AudioManager.actx.createBuffer(1, AudioManager.actx.sampleRate * 0.05, AudioManager.actx.sampleRate);
        const crackData = crackBuf.getChannelData(0);
        for (let i = 0; i < crackBuf.length; i++) {
            const t = i / AudioManager.actx.sampleRate;
            crackData[i] = (Math.random() * 2 - 1) * Math.exp(-t * 80) * 1.5;
        }
        const crackSrc = AudioManager.actx.createBufferSource();
        crackSrc.buffer = crackBuf;
        const crackFilter = AudioManager.actx.createBiquadFilter();
        crackFilter.type = 'highpass';
        crackFilter.frequency.value = 2000;
        const crackGain = AudioManager.actx.createGain();
        crackGain.gain.value = 0.9;
        crackSrc.connect(crackFilter);
        crackFilter.connect(crackGain);
        crackGain.connect(AudioManager.dryGain);
        crackSrc.start(now);

        // Layer 4: Explosion noise (the boom)
        const boomBuf = AudioManager.actx.createBuffer(1, AudioManager.actx.sampleRate * 0.2, AudioManager.actx.sampleRate);
        const boomData = boomBuf.getChannelData(0);
        for (let i = 0; i < boomBuf.length; i++) {
            const t = i / AudioManager.actx.sampleRate;
            boomData[i] = (Math.random() * 2 - 1) * Math.exp(-t * 15) * 0.8;
        }
        const boomSrc = AudioManager.actx.createBufferSource();
        boomSrc.buffer = boomBuf;
        const boomFilter = AudioManager.actx.createBiquadFilter();
        boomFilter.type = 'bandpass';
        boomFilter.frequency.value = 800;
        boomFilter.Q.value = 0.5;
        const boomGain = AudioManager.actx.createGain();
        boomGain.gain.setValueAtTime(1.0, now);
        boomGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        boomSrc.connect(boomFilter);
        boomFilter.connect(boomGain);
        boomGain.connect(AudioManager.dryGain);
        boomGain.connect(AudioManager.convolver);
        boomSrc.start(now);

        // Layer 5: Mechanical clack (bolt action)
        const clackOsc = AudioManager.actx.createOscillator();
        const clackGain = AudioManager.actx.createGain();
        clackOsc.connect(clackGain);
        clackGain.connect(AudioManager.dryGain);
        clackOsc.type = 'square';
        clackOsc.frequency.setValueAtTime(1500, now + 0.015);
        clackOsc.frequency.exponentialRampToValueAtTime(800, now + 0.03);
        clackGain.gain.setValueAtTime(0.2, now + 0.015);
        clackGain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
        clackOsc.start(now + 0.015); clackOsc.stop(now + 0.05);

        // Layer 6: Sub-bass rumble (feel it in your chest)
        const subOsc = AudioManager.actx.createOscillator();
        const subGain = AudioManager.actx.createGain();
        subOsc.connect(subGain);
        subGain.connect(AudioManager.dryGain);
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(35, now);
        subOsc.frequency.exponentialRampToValueAtTime(20, now + 0.1);
        subGain.gain.setValueAtTime(0.8, now);
        subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        subOsc.start(now); subOsc.stop(now + 0.15);

        return;

    } else if (type === 'targetHit') {
        // Metallic ping/clang for hitting target
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.3);
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.Q.value = 5;
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now); osc.stop(now + 0.35);

        // Add metallic noise
        const hitBuf = AudioManager.actx.createBuffer(1, AudioManager.actx.sampleRate * 0.1, AudioManager.actx.sampleRate);
        const hitOut = hitBuf.getChannelData(0);
        for (let i = 0; i < hitBuf.length; i++) hitOut[i] = (Math.random() * 2 - 1) * Math.exp(-i / (AudioManager.actx.sampleRate * 0.02));
        const hitN = AudioManager.actx.createBufferSource(); hitN.buffer = hitBuf;
        const hitG = AudioManager.actx.createGain();
        hitG.gain.setValueAtTime(0.3, now);
        hitG.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        hitN.connect(hitG); hitG.connect(AudioManager.dryGain);
        hitN.start(now);

    } else if (type === 'zombieHit') {
        // Fleshy impact sound for zombie hits
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now); osc.stop(now + 0.15);

        // Thwack noise layer
        const thwackBuf = AudioManager.actx.createBuffer(1, AudioManager.actx.sampleRate * 0.08, AudioManager.actx.sampleRate);
        const thwackOut = thwackBuf.getChannelData(0);
        for (let i = 0; i < thwackBuf.length; i++) {
            thwackOut[i] = (Math.random() * 2 - 1) * Math.exp(-i / (AudioManager.actx.sampleRate * 0.015));
        }
        const thwackN = AudioManager.actx.createBufferSource(); thwackN.buffer = thwackBuf;
        const thwackFilter = AudioManager.actx.createBiquadFilter();
        thwackFilter.type = 'bandpass'; thwackFilter.frequency.value = 800; thwackFilter.Q.value = 1;
        const thwackG = AudioManager.actx.createGain();
        thwackG.gain.setValueAtTime(0.4, now);
        thwackN.connect(thwackFilter); thwackFilter.connect(thwackG);
        thwackG.connect(AudioManager.dryGain);
        thwackN.start(now);

    } else if (type === 'zombieDeath') {
        // Zombie death groan
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);
        filter.type = 'lowpass';
        filter.frequency.value = 250;
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        osc.start(now); osc.stop(now + 0.5);

        // Body fall thud
        const thudOsc = AudioManager.actx.createOscillator();
        const thudGain = AudioManager.actx.createGain();
        thudOsc.connect(thudGain); thudGain.connect(AudioManager.dryGain); thudGain.connect(AudioManager.convolver);
        thudOsc.type = 'sine';
        thudOsc.frequency.setValueAtTime(80, now + 0.2);
        thudOsc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
        thudGain.gain.setValueAtTime(0.6, now + 0.2);
        thudGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        thudOsc.start(now + 0.2); thudOsc.stop(now + 0.55);

    } else if (type === 'zombieAttack') {
        // Zombie growl/bite sound
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now); osc.stop(now + 0.35);

        // Add snarl noise
        const snarlBuf = AudioManager.actx.createBuffer(1, AudioManager.actx.sampleRate * 0.15, AudioManager.actx.sampleRate);
        const snarlOut = snarlBuf.getChannelData(0);
        for (let i = 0; i < snarlBuf.length; i++) {
            snarlOut[i] = (Math.random() * 2 - 1) * Math.exp(-i / (AudioManager.actx.sampleRate * 0.05)) * 0.5;
        }
        const snarlN = AudioManager.actx.createBufferSource(); snarlN.buffer = snarlBuf;
        const snarlFilter = AudioManager.actx.createBiquadFilter();
        snarlFilter.type = 'bandpass'; snarlFilter.frequency.value = 300; snarlFilter.Q.value = 2;
        const snarlG = AudioManager.actx.createGain();
        snarlG.gain.setValueAtTime(0.3, now);
        snarlN.connect(snarlFilter); snarlFilter.connect(snarlG);
        snarlG.connect(AudioManager.dryGain);
        snarlN.start(now);

    } else if (type === 'headshot') {
        // SATISFYING head explosion sound - wet pop + crunch
        // Initial pop
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now); osc.stop(now + 0.15);

        // Wet splatter noise
        const splatBuf = AudioManager.actx.createBuffer(1, AudioManager.actx.sampleRate * 0.2, AudioManager.actx.sampleRate);
        const splatOut = splatBuf.getChannelData(0);
        for (let i = 0; i < splatBuf.length; i++) {
            const t = i / AudioManager.actx.sampleRate;
            splatOut[i] = (Math.random() * 2 - 1) * Math.exp(-t * 15) * 0.8;
        }
        const splatN = AudioManager.actx.createBufferSource(); splatN.buffer = splatBuf;
        const splatFilter = AudioManager.actx.createBiquadFilter();
        splatFilter.type = 'lowpass'; splatFilter.frequency.value = 1500;
        const splatG = AudioManager.actx.createGain();
        splatG.gain.setValueAtTime(0.7, now);
        splatN.connect(splatFilter); splatFilter.connect(splatG);
        splatG.connect(AudioManager.dryGain); splatG.connect(AudioManager.convolver);
        splatN.start(now);

        // Bone crunch
        const crunchBuf = AudioManager.actx.createBuffer(1, AudioManager.actx.sampleRate * 0.1, AudioManager.actx.sampleRate);
        const crunchOut = crunchBuf.getChannelData(0);
        for (let i = 0; i < crunchBuf.length; i++) {
            const t = i / AudioManager.actx.sampleRate;
            // Crispy crackling sound
            crunchOut[i] = (Math.random() > 0.5 ? 1 : -1) * Math.random() * Math.exp(-t * 20) * 0.5;
        }
        const crunchN = AudioManager.actx.createBufferSource(); crunchN.buffer = crunchBuf;
        const crunchFilter = AudioManager.actx.createBiquadFilter();
        crunchFilter.type = 'highpass'; crunchFilter.frequency.value = 2000;
        const crunchG = AudioManager.actx.createGain();
        crunchG.gain.setValueAtTime(0.4, now + 0.02);
        crunchN.connect(crunchFilter); crunchFilter.connect(crunchG);
        crunchG.connect(AudioManager.dryGain);
        crunchN.start(now + 0.02);

    } else if (type === 'playerHurt') {
        // Pain sound - sharp impact
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
        filter.type = 'lowpass';
        filter.frequency.value = 600;
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now); osc.stop(now + 0.25);

        // Heartbeat thump
        const heartOsc = AudioManager.actx.createOscillator();
        const heartGain = AudioManager.actx.createGain();
        heartOsc.connect(heartGain); heartGain.connect(AudioManager.dryGain);
        heartOsc.type = 'sine';
        heartOsc.frequency.value = 40;
        heartGain.gain.setValueAtTime(0.4, now + 0.1);
        heartGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        heartOsc.start(now + 0.1); heartOsc.stop(now + 0.3);

    } else if (type === 'waveComplete') {
        // Victory fanfare - rising tones
        const freqs = [400, 500, 600, 800];
        freqs.forEach((freq, i) => {
            const victoryOsc = AudioManager.actx.createOscillator();
            const victoryGain = AudioManager.actx.createGain();
            victoryOsc.connect(victoryGain); victoryGain.connect(AudioManager.dryGain); victoryGain.connect(AudioManager.convolver);
            victoryOsc.type = 'sine';
            victoryOsc.frequency.value = freq;
            victoryGain.gain.setValueAtTime(0.2, now + i * 0.1);
            victoryGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
            victoryOsc.start(now + i * 0.1); victoryOsc.stop(now + i * 0.1 + 0.35);
        });
        // Don't start the main osc for this sound type
        return;

    } else if (type === 'doorOpen') {
        // Heavy metal door sliding open - industrial/horror vibe

        // Layer 1: Deep mechanical grind (servo motor)
        const grindOsc = AudioManager.actx.createOscillator();
        const grindGain = AudioManager.actx.createGain();
        const grindFilter = AudioManager.actx.createBiquadFilter();
        grindOsc.connect(grindFilter);
        grindFilter.connect(grindGain);
        grindGain.connect(AudioManager.dryGain);
        grindOsc.type = 'sawtooth';
        grindOsc.frequency.setValueAtTime(50, now);
        grindOsc.frequency.linearRampToValueAtTime(80, now + 0.3);
        grindFilter.type = 'lowpass';
        grindFilter.frequency.value = 200;
        grindGain.gain.setValueAtTime(0.4, now);
        grindGain.gain.linearRampToValueAtTime(0.3, now + 0.15);
        grindGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        grindOsc.start(now); grindOsc.stop(now + 0.4);

        // Layer 2: Metal scraping (high frequency noise)
        const scrapeBuffer = AudioManager.actx.createBuffer(1, AudioManager.actx.sampleRate * 0.3, AudioManager.actx.sampleRate);
        const scrapeData = scrapeBuffer.getChannelData(0);
        for (let i = 0; i < scrapeData.length; i++) {
            scrapeData[i] = (Math.random() * 2 - 1) * (1 - i / scrapeData.length) * 0.5;
        }
        const scrapeSource = AudioManager.actx.createBufferSource();
        scrapeSource.buffer = scrapeBuffer;
        const scrapeFilter = AudioManager.actx.createBiquadFilter();
        scrapeFilter.type = 'bandpass';
        scrapeFilter.frequency.value = 3000;
        scrapeFilter.Q.value = 3;
        const scrapeGain = AudioManager.actx.createGain();
        scrapeSource.connect(scrapeFilter);
        scrapeFilter.connect(scrapeGain);
        scrapeGain.connect(AudioManager.dryGain);
        scrapeGain.gain.setValueAtTime(0.15, now);
        scrapeGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        scrapeSource.start(now);

        // Layer 3: Heavy thunk at the end (door hitting stop)
        const thunkOsc = AudioManager.actx.createOscillator();
        const thunkGain = AudioManager.actx.createGain();
        thunkOsc.connect(thunkGain);
        thunkGain.connect(AudioManager.dryGain);
        thunkGain.connect(AudioManager.convolver);
        thunkOsc.type = 'sine';
        thunkOsc.frequency.setValueAtTime(80, now + 0.25);
        thunkOsc.frequency.exponentialRampToValueAtTime(30, now + 0.35);
        thunkGain.gain.setValueAtTime(0, now);
        thunkGain.gain.setValueAtTime(0.5, now + 0.25);
        thunkGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        thunkOsc.start(now + 0.25); thunkOsc.stop(now + 0.45);

        // Layer 4: Hiss/pneumatic (air escaping)
        const hissBuffer = AudioManager.actx.createBuffer(1, AudioManager.actx.sampleRate * 0.2, AudioManager.actx.sampleRate);
        const hissData = hissBuffer.getChannelData(0);
        for (let i = 0; i < hissData.length; i++) {
            hissData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / hissData.length, 2);
        }
        const hissSource = AudioManager.actx.createBufferSource();
        hissSource.buffer = hissBuffer;
        const hissFilter = AudioManager.actx.createBiquadFilter();
        hissFilter.type = 'highpass';
        hissFilter.frequency.value = 4000;
        const hissGain = AudioManager.actx.createGain();
        hissSource.connect(hissFilter);
        hissFilter.connect(hissGain);
        hissGain.connect(AudioManager.dryGain);
        hissGain.gain.setValueAtTime(0.1, now);
        hissGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        hissSource.start(now);

        return;

    } else if (type === 'empty') {
        osc.type = 'square'; osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now); osc.stop(now + 0.05);
    } else if (type === 'mag_out') {
        // BEEFY MAG RELEASE - Heavy mechanical clunk

        // Layer 1: Deep thunk (weight of mag releasing)
        const thunkOsc = AudioManager.actx.createOscillator();
        const thunkGain = AudioManager.actx.createGain();
        thunkOsc.connect(thunkGain);
        thunkGain.connect(AudioManager.dryGain);
        thunkOsc.type = 'sine';
        thunkOsc.frequency.setValueAtTime(100, now);
        thunkOsc.frequency.exponentialRampToValueAtTime(40, now + 0.08);
        thunkGain.gain.setValueAtTime(0.7, now);
        thunkGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        thunkOsc.start(now); thunkOsc.stop(now + 0.12);

        // Layer 2: Sharp release click
        osc.type = 'square';
        osc.frequency.setValueAtTime(3500, now);
        osc.frequency.exponentialRampToValueAtTime(1000, now + 0.015);
        filter.type = 'highpass';
        filter.frequency.value = 1500;
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.025);
        osc.start(now); osc.stop(now + 0.03);

        // Layer 3: Metal slide/scrape
        const slideOsc = AudioManager.actx.createOscillator();
        const slideGain = AudioManager.actx.createGain();
        const slideFilter = AudioManager.actx.createBiquadFilter();
        slideOsc.connect(slideFilter); slideFilter.connect(slideGain);
        slideGain.connect(AudioManager.dryGain); slideGain.connect(AudioManager.convolver);
        slideOsc.type = 'sawtooth';
        slideOsc.frequency.setValueAtTime(500, now + 0.01);
        slideOsc.frequency.linearRampToValueAtTime(150, now + 0.15);
        slideFilter.type = 'bandpass';
        slideFilter.frequency.value = 1000;
        slideFilter.Q.value = 3;
        slideGain.gain.setValueAtTime(0.4, now + 0.01);
        slideGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        slideOsc.start(now + 0.01); slideOsc.stop(now + 0.18);

        // Layer 4: Metallic rattle (mag sliding out)
        const rattleBuf = AudioManager.actx.createBuffer(1, AudioManager.actx.sampleRate * 0.15, AudioManager.actx.sampleRate);
        const rattleOut = rattleBuf.getChannelData(0);
        for (let i = 0; i < rattleBuf.length; i++) {
            const t = i / AudioManager.actx.sampleRate;
            rattleOut[i] = (Math.random() * 2 - 1) * Math.exp(-t * 12) * Math.sin(i * 0.4) * 0.8;
        }
        const rattleN = AudioManager.actx.createBufferSource(); rattleN.buffer = rattleBuf;
        const rattleFilter = AudioManager.actx.createBiquadFilter();
        rattleFilter.type = 'bandpass';
        rattleFilter.frequency.value = 2500;
        rattleFilter.Q.value = 1;
        const rattleG = AudioManager.actx.createGain();
        rattleG.gain.setValueAtTime(0.35, now + 0.02);
        rattleN.connect(rattleFilter); rattleFilter.connect(rattleG);
        rattleG.connect(AudioManager.dryGain); rattleG.connect(AudioManager.convolver);
        rattleN.start(now + 0.02);

        // Layer 5: Low resonance (gun body vibration)
        const resOsc = AudioManager.actx.createOscillator();
        const resGain = AudioManager.actx.createGain();
        resOsc.connect(resGain);
        resGain.connect(AudioManager.dryGain);
        resOsc.type = 'triangle';
        resOsc.frequency.value = 80;
        resGain.gain.setValueAtTime(0.3, now);
        resGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        resOsc.start(now); resOsc.stop(now + 0.15);
        return;

    } else if (type === 'mag_in') {
        // BEEFY MAG INSERT - Satisfying heavy slam

        // Layer 1: Deep impact thump (mag slamming home)
        const impactOsc = AudioManager.actx.createOscillator();
        const impactGain = AudioManager.actx.createGain();
        const impactFilter = AudioManager.actx.createBiquadFilter();
        impactOsc.connect(impactFilter);
        impactFilter.connect(impactGain);
        impactGain.connect(AudioManager.dryGain);
        impactOsc.type = 'sine';
        impactOsc.frequency.setValueAtTime(80, now);
        impactOsc.frequency.exponentialRampToValueAtTime(30, now + 0.1);
        impactFilter.type = 'lowpass';
        impactFilter.frequency.value = 200;
        impactGain.gain.setValueAtTime(1.0, now);
        impactGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        impactOsc.start(now); impactOsc.stop(now + 0.15);

        // Layer 2: Sharp latch click
        osc.type = 'square';
        osc.frequency.setValueAtTime(4000, now);
        osc.frequency.exponentialRampToValueAtTime(1500, now + 0.01);
        filter.type = 'highpass';
        filter.frequency.value = 2000;
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.02);
        osc.start(now); osc.stop(now + 0.025);

        // Layer 3: Metal-on-metal clunk
        const clunkOsc = AudioManager.actx.createOscillator();
        const clunkGain = AudioManager.actx.createGain();
        clunkOsc.connect(clunkGain);
        clunkGain.connect(AudioManager.dryGain);
        clunkGain.connect(AudioManager.convolver);
        clunkOsc.type = 'sawtooth';
        clunkOsc.frequency.setValueAtTime(200, now);
        clunkOsc.frequency.exponentialRampToValueAtTime(80, now + 0.06);
        clunkGain.gain.setValueAtTime(0.6, now);
        clunkGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        clunkOsc.start(now); clunkOsc.stop(now + 0.1);

        // Layer 4: Metallic ring/resonance
        const ringOsc = AudioManager.actx.createOscillator();
        const ringGain = AudioManager.actx.createGain();
        const ringFilter = AudioManager.actx.createBiquadFilter();
        ringOsc.connect(ringFilter); ringFilter.connect(ringGain);
        ringGain.connect(AudioManager.dryGain); ringGain.connect(AudioManager.convolver);
        ringOsc.type = 'sine';
        ringOsc.frequency.setValueAtTime(600, now);
        ringOsc.frequency.exponentialRampToValueAtTime(400, now + 0.2);
        ringFilter.type = 'bandpass';
        ringFilter.frequency.value = 500;
        ringFilter.Q.value = 12;
        ringGain.gain.setValueAtTime(0.25, now + 0.01);
        ringGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        ringOsc.start(now); ringOsc.stop(now + 0.3);

        // Layer 5: Snap transient
        const snapBuf = AudioManager.actx.createBuffer(1, AudioManager.actx.sampleRate * 0.02, AudioManager.actx.sampleRate);
        const snapOut = snapBuf.getChannelData(0);
        for (let i = 0; i < snapBuf.length; i++) {
            snapOut[i] = (Math.random() * 2 - 1) * Math.exp(-i / (AudioManager.actx.sampleRate * 0.003)) * 1.2;
        }
        const snapN = AudioManager.actx.createBufferSource(); snapN.buffer = snapBuf;
        const snapFilter = AudioManager.actx.createBiquadFilter();
        snapFilter.type = 'highpass'; snapFilter.frequency.value = 3500;
        const snapG = AudioManager.actx.createGain();
        snapG.gain.setValueAtTime(0.5, now);
        snapN.connect(snapFilter); snapFilter.connect(snapG); snapG.connect(AudioManager.dryGain);
        snapN.start(now);

        // Layer 6: Sub-bass punch
        const subOsc = AudioManager.actx.createOscillator();
        const subGain = AudioManager.actx.createGain();
        subOsc.connect(subGain);
        subGain.connect(AudioManager.dryGain);
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(50, now);
        subOsc.frequency.exponentialRampToValueAtTime(25, now + 0.08);
        subGain.gain.setValueAtTime(0.6, now);
        subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        subOsc.start(now); subOsc.stop(now + 0.12);
        return;

    } else if (type === 'rack') {
        // BEEFY BOLT RACK - Aggressive charging handle slam

        // Layer 1: Pull back - heavy metal scrape
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(500, now + 0.1);
        filter.type = 'bandpass';
        filter.frequency.value = 1500;
        filter.Q.value = 2;
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now); osc.stop(now + 0.14);

        // Layer 2: Aggressive scrape noise
        const scrapeBuf = AudioManager.actx.createBuffer(1, AudioManager.actx.sampleRate * 0.12, AudioManager.actx.sampleRate);
        const scrapeOut = scrapeBuf.getChannelData(0);
        for (let i = 0; i < scrapeBuf.length; i++) {
            const t = i / AudioManager.actx.sampleRate;
            const env = Math.exp(-t * 10);
            scrapeOut[i] = (Math.random() * 2 - 1) * env * (0.6 + 0.4 * Math.sin(i * 0.08));
        }
        const scrapeN = AudioManager.actx.createBufferSource(); scrapeN.buffer = scrapeBuf;
        const scrapeFilter = AudioManager.actx.createBiquadFilter();
        scrapeFilter.type = 'bandpass'; scrapeFilter.frequency.value = 3000; scrapeFilter.Q.value = 1.5;
        const scrapeG = AudioManager.actx.createGain();
        scrapeG.gain.setValueAtTime(0.45, now);
        scrapeN.connect(scrapeFilter); scrapeFilter.connect(scrapeG);
        scrapeG.connect(AudioManager.dryGain); scrapeG.connect(AudioManager.convolver);
        scrapeN.start(now);

        // Layer 3: HEAVY bolt slam forward
        const slamOsc = AudioManager.actx.createOscillator();
        const slamGain = AudioManager.actx.createGain();
        slamOsc.connect(slamGain); slamGain.connect(AudioManager.dryGain); slamGain.connect(AudioManager.convolver);
        slamOsc.type = 'sine';
        slamOsc.frequency.setValueAtTime(100, now + 0.12);
        slamOsc.frequency.exponentialRampToValueAtTime(35, now + 0.22);
        slamGain.gain.setValueAtTime(0.9, now + 0.12);
        slamGain.gain.exponentialRampToValueAtTime(0.01, now + 0.24);
        slamOsc.start(now + 0.12); slamOsc.stop(now + 0.28);

        // Layer 4: Sharp metal impact
        const impOsc = AudioManager.actx.createOscillator();
        const impGain = AudioManager.actx.createGain();
        impOsc.connect(impGain); impGain.connect(AudioManager.dryGain);
        impOsc.type = 'square';
        impOsc.frequency.setValueAtTime(5000, now + 0.12);
        impOsc.frequency.exponentialRampToValueAtTime(1200, now + 0.14);
        impGain.gain.setValueAtTime(0.5, now + 0.12);
        impGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        impOsc.start(now + 0.12); impOsc.stop(now + 0.17);

        // Layer 5: Metal clunk body
        const clunkOsc = AudioManager.actx.createOscillator();
        const clunkGain = AudioManager.actx.createGain();
        clunkOsc.connect(clunkGain); clunkGain.connect(AudioManager.dryGain);
        clunkOsc.type = 'sawtooth';
        clunkOsc.frequency.setValueAtTime(150, now + 0.12);
        clunkOsc.frequency.exponentialRampToValueAtTime(60, now + 0.18);
        clunkGain.gain.setValueAtTime(0.5, now + 0.12);
        clunkGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        clunkOsc.start(now + 0.12); clunkOsc.stop(now + 0.22);

        // Layer 6: Resonant metal ring
        const ringOsc = AudioManager.actx.createOscillator();
        const ringGain = AudioManager.actx.createGain();
        const ringFilter = AudioManager.actx.createBiquadFilter();
        ringOsc.connect(ringFilter); ringFilter.connect(ringGain);
        ringGain.connect(AudioManager.dryGain); ringGain.connect(AudioManager.convolver);
        ringOsc.type = 'sine';
        ringOsc.frequency.setValueAtTime(900, now + 0.13);
        ringFilter.type = 'bandpass'; ringFilter.frequency.value = 900; ringFilter.Q.value = 20;
        ringGain.gain.setValueAtTime(0.2, now + 0.13);
        ringGain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        ringOsc.start(now + 0.13); ringOsc.stop(now + 0.5);

        // Layer 7: Sub-bass slam punch
        const subOsc = AudioManager.actx.createOscillator();
        const subGain = AudioManager.actx.createGain();
        subOsc.connect(subGain);
        subGain.connect(AudioManager.dryGain);
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(45, now + 0.12);
        subOsc.frequency.exponentialRampToValueAtTime(20, now + 0.2);
        subGain.gain.setValueAtTime(0.7, now + 0.12);
        subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        subOsc.start(now + 0.12); subOsc.stop(now + 0.25);

        // Layer 8: Spring tension release noise
        const springBuf = AudioManager.actx.createBuffer(1, AudioManager.actx.sampleRate * 0.08, AudioManager.actx.sampleRate);
        const springOut = springBuf.getChannelData(0);
        for (let i = 0; i < springBuf.length; i++) {
            const t = i / AudioManager.actx.sampleRate;
            springOut[i] = Math.sin(i * 0.15) * Math.exp(-t * 30) * 0.4;
        }
        const springN = AudioManager.actx.createBufferSource(); springN.buffer = springBuf;
        const springFilter = AudioManager.actx.createBiquadFilter();
        springFilter.type = 'highpass'; springFilter.frequency.value = 1500;
        const springG = AudioManager.actx.createGain();
        springG.gain.value = 0.3;
        springN.connect(springFilter); springFilter.connect(springG);
        springG.connect(AudioManager.dryGain);
        springN.start(now + 0.12);
        return;

    } else if (type === 'pickup') {
        // Satisfying pickup chime
        const freqs = [600, 800, 1000];
        freqs.forEach((freq, i) => {
            const chimeOsc = AudioManager.actx.createOscillator();
            const chimeGain = AudioManager.actx.createGain();
            chimeOsc.connect(chimeGain); chimeGain.connect(AudioManager.dryGain); chimeGain.connect(AudioManager.convolver);
            chimeOsc.type = 'sine';
            chimeOsc.frequency.value = freq;
            chimeGain.gain.setValueAtTime(0.2, now + i * 0.05);
            chimeGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.2);
            chimeOsc.start(now + i * 0.05); chimeOsc.stop(now + i * 0.05 + 0.25);
        });
        return;

    } else if (type === 'nuke') {
        // Massive explosion
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(60, now);
        osc.frequency.exponentialRampToValueAtTime(15, now + 0.8);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(50, now + 0.5);
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
        osc.start(now); osc.stop(now + 1.2);

        // Massive noise burst
        const nukeBuf = AudioManager.actx.createBuffer(1, AudioManager.actx.sampleRate * 0.5, AudioManager.actx.sampleRate);
        const nukeOut = nukeBuf.getChannelData(0);
        for (let i = 0; i < nukeBuf.length; i++) {
            nukeOut[i] = (Math.random() * 2 - 1) * Math.exp(-i / (AudioManager.actx.sampleRate * 0.2));
        }
        const nukeN = AudioManager.actx.createBufferSource(); nukeN.buffer = nukeBuf;
        const nukeFilter = AudioManager.actx.createBiquadFilter();
        nukeFilter.type = 'lowpass'; nukeFilter.frequency.value = 600;
        const nukeG = AudioManager.actx.createGain();
        nukeG.gain.setValueAtTime(0.7, now);
        nukeG.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        nukeN.connect(nukeFilter); nukeFilter.connect(nukeG);
        nukeG.connect(AudioManager.dryGain); nukeG.connect(AudioManager.convolver);
        nukeN.start(now);

        // High frequency sizzle
        const sizzleOsc = AudioManager.actx.createOscillator();
        const sizzleGain = AudioManager.actx.createGain();
        sizzleOsc.connect(sizzleGain); sizzleGain.connect(AudioManager.dryGain);
        sizzleOsc.type = 'sawtooth';
        sizzleOsc.frequency.setValueAtTime(2000, now);
        sizzleOsc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
        sizzleGain.gain.setValueAtTime(0.3, now);
        sizzleGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        sizzleOsc.start(now); sizzleOsc.stop(now + 0.4);

    } else if (type === 'explosion') {
        // Explosive rounds smaller explosion - punchy but not overwhelming
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.exponentialRampToValueAtTime(25, now + 0.25);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, now);
        filter.frequency.exponentialRampToValueAtTime(80, now + 0.2);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now); osc.stop(now + 0.35);

        // Quick blast noise
        const blastBuf = AudioManager.actx.createBuffer(1, AudioManager.actx.sampleRate * 0.15, AudioManager.actx.sampleRate);
        const blastOut = blastBuf.getChannelData(0);
        for (let i = 0; i < blastBuf.length; i++) {
            blastOut[i] = (Math.random() * 2 - 1) * Math.exp(-i / (AudioManager.actx.sampleRate * 0.04));
        }
        const blastN = AudioManager.actx.createBufferSource(); blastN.buffer = blastBuf;
        const blastFilter = AudioManager.actx.createBiquadFilter();
        blastFilter.type = 'bandpass'; blastFilter.frequency.value = 800; blastFilter.Q.value = 0.8;
        const blastG = AudioManager.actx.createGain();
        blastG.gain.setValueAtTime(0.4, now);
        blastG.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        blastN.connect(blastFilter); blastFilter.connect(blastG);
        blastG.connect(AudioManager.dryGain); blastG.connect(AudioManager.convolver);
        blastN.start(now);

    } else if (type === 'sniperShoot') {
        // === ABSOLUTELY MASSIVE .50 BMG ANTI-MATERIEL RIFLE SOUND ===
        // This needs to SHAKE THE ROOM. 10+ layered audio components.

        // LAYER 1: SUB-BASS EARTHQUAKE (15-30Hz - feel it in your chest)
        const subOsc = AudioManager.actx.createOscillator();
        const subGain = AudioManager.actx.createGain();
        const subFilter = AudioManager.actx.createBiquadFilter();
        subOsc.connect(subFilter);
        subFilter.connect(subGain);
        subGain.connect(AudioManager.dryGain);
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(25, now);
        subOsc.frequency.exponentialRampToValueAtTime(12, now + 0.4);
        subFilter.type = 'lowpass';
        subFilter.frequency.value = 60;
        subFilter.Q.value = 1.5;
        subGain.gain.setValueAtTime(2.0, now); // CRANKED
        subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        subOsc.start(now); subOsc.stop(now + 0.55);

        // LAYER 2: CHEST PUNCH - Low frequency impact
        const chestOsc = AudioManager.actx.createOscillator();
        const chestGain = AudioManager.actx.createGain();
        chestOsc.connect(chestGain);
        chestGain.connect(AudioManager.dryGain);
        chestGain.connect(AudioManager.convolver);
        chestOsc.type = 'sine';
        chestOsc.frequency.setValueAtTime(50, now);
        chestOsc.frequency.exponentialRampToValueAtTime(20, now + 0.25);
        chestGain.gain.setValueAtTime(1.8, now);
        chestGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        chestOsc.start(now); chestOsc.stop(now + 0.4);

        // LAYER 3: CANNON BOOM - The main explosion body
        const boomOsc = AudioManager.actx.createOscillator();
        const boomGain = AudioManager.actx.createGain();
        const boomFilter = AudioManager.actx.createBiquadFilter();
        boomOsc.connect(boomFilter);
        boomFilter.connect(boomGain);
        boomGain.connect(AudioManager.dryGain);
        boomGain.connect(AudioManager.convolver);
        boomOsc.type = 'sawtooth';
        boomOsc.frequency.setValueAtTime(100, now);
        boomOsc.frequency.exponentialRampToValueAtTime(30, now + 0.2);
        boomFilter.type = 'lowpass';
        boomFilter.frequency.setValueAtTime(500, now);
        boomFilter.frequency.exponentialRampToValueAtTime(100, now + 0.3);
        boomGain.gain.setValueAtTime(1.2, now);
        boomGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        boomOsc.start(now); boomOsc.stop(now + 0.4);

        // LAYER 4: SUPERSONIC CRACK - Sharp transient (bullet breaking sound barrier)
        const crackBuf = AudioManager.actx.createBuffer(1, AudioManager.actx.sampleRate * 0.03, AudioManager.actx.sampleRate);
        const crackData = crackBuf.getChannelData(0);
        for (let i = 0; i < crackBuf.length; i++) {
            const t = i / AudioManager.actx.sampleRate;
            // Sharp attack, fast decay
            crackData[i] = (Math.random() * 2 - 1) * Math.exp(-t * 150) * 2.5;
        }
        const crackSrc = AudioManager.actx.createBufferSource();
        crackSrc.buffer = crackBuf;
        const crackFilter = AudioManager.actx.createBiquadFilter();
        crackFilter.type = 'highpass';
        crackFilter.frequency.value = 4000;
        const crackGain = AudioManager.actx.createGain();
        crackGain.gain.value = 1.4;
        crackSrc.connect(crackFilter);
        crackFilter.connect(crackGain);
        crackGain.connect(AudioManager.dryGain);
        crackSrc.start(now);

        // LAYER 5: SECONDARY CRACK - Slightly delayed echo crack
        const crack2Buf = AudioManager.actx.createBuffer(1, AudioManager.actx.sampleRate * 0.025, AudioManager.actx.sampleRate);
        const crack2Data = crack2Buf.getChannelData(0);
        for (let i = 0; i < crack2Buf.length; i++) {
            const t = i / AudioManager.actx.sampleRate;
            crack2Data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 120) * 1.5;
        }
        const crack2Src = AudioManager.actx.createBufferSource();
        crack2Src.buffer = crack2Buf;
        const crack2Filter = AudioManager.actx.createBiquadFilter();
        crack2Filter.type = 'bandpass';
        crack2Filter.frequency.value = 6000;
        crack2Filter.Q.value = 0.5;
        const crack2Gain = AudioManager.actx.createGain();
        crack2Gain.gain.value = 0.8;
        crack2Src.connect(crack2Filter);
        crack2Filter.connect(crack2Gain);
        crack2Gain.connect(AudioManager.dryGain);
        crack2Src.start(now + 0.008); // Slight delay for echo effect

        // LAYER 6: EXPLOSION NOISE - Chaotic burst
        const explosionBuf = AudioManager.actx.createBuffer(1, AudioManager.actx.sampleRate * 0.15, AudioManager.actx.sampleRate);
        const explosionData = explosionBuf.getChannelData(0);
        for (let i = 0; i < explosionBuf.length; i++) {
            const t = i / AudioManager.actx.sampleRate;
            explosionData[i] = (Math.random() * 2 - 1) * Math.exp(-t * 20) * 1.2;
        }
        const explosionSrc = AudioManager.actx.createBufferSource();
        explosionSrc.buffer = explosionBuf;
        const explosionFilter = AudioManager.actx.createBiquadFilter();
        explosionFilter.type = 'bandpass';
        explosionFilter.frequency.value = 400;
        explosionFilter.Q.value = 0.3;
        const explosionGain = AudioManager.actx.createGain();
        explosionGain.gain.setValueAtTime(1.5, now);
        explosionGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        explosionSrc.connect(explosionFilter);
        explosionFilter.connect(explosionGain);
        explosionGain.connect(AudioManager.dryGain);
        explosionGain.connect(AudioManager.convolver);
        explosionSrc.start(now);

        // LAYER 7: MID-RANGE PUNCH - Body of the shot
        const midOsc = AudioManager.actx.createOscillator();
        const midGain = AudioManager.actx.createGain();
        midOsc.connect(midGain);
        midGain.connect(AudioManager.dryGain);
        midOsc.type = 'triangle';
        midOsc.frequency.setValueAtTime(180, now);
        midOsc.frequency.exponentialRampToValueAtTime(60, now + 0.15);
        midGain.gain.setValueAtTime(0.9, now);
        midGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        midOsc.start(now); midOsc.stop(now + 0.25);

        // LAYER 8: MECHANICAL CLUNK - Bolt/action resonance
        const mechOsc = AudioManager.actx.createOscillator();
        const mechGain = AudioManager.actx.createGain();
        mechOsc.connect(mechGain);
        mechGain.connect(AudioManager.dryGain);
        mechOsc.type = 'square';
        mechOsc.frequency.setValueAtTime(800, now + 0.01);
        mechOsc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
        mechGain.gain.setValueAtTime(0.35, now + 0.01);
        mechGain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
        mechOsc.start(now + 0.01); mechOsc.stop(now + 0.08);

        // LAYER 9: AIR DISPLACEMENT WHOOSH
        const whooshBuf = AudioManager.actx.createBuffer(1, AudioManager.actx.sampleRate * 0.1, AudioManager.actx.sampleRate);
        const whooshData = whooshBuf.getChannelData(0);
        for (let i = 0; i < whooshBuf.length; i++) {
            const t = i / AudioManager.actx.sampleRate;
            whooshData[i] = (Math.random() * 2 - 1) * Math.sin(t * 50) * Math.exp(-t * 25) * 0.6;
        }
        const whooshSrc = AudioManager.actx.createBufferSource();
        whooshSrc.buffer = whooshBuf;
        const whooshFilter = AudioManager.actx.createBiquadFilter();
        whooshFilter.type = 'bandpass';
        whooshFilter.frequency.value = 1200;
        whooshFilter.Q.value = 0.8;
        const whooshGain = AudioManager.actx.createGain();
        whooshGain.gain.value = 0.5;
        whooshSrc.connect(whooshFilter);
        whooshFilter.connect(whooshGain);
        whooshGain.connect(AudioManager.dryGain);
        whooshSrc.start(now);

        // LAYER 10: LONG REVERB TAIL - Echoing across the battlefield
        const tailBuf = AudioManager.actx.createBuffer(1, AudioManager.actx.sampleRate * 0.8, AudioManager.actx.sampleRate);
        const tailData = tailBuf.getChannelData(0);
        for (let i = 0; i < tailBuf.length; i++) {
            const t = i / AudioManager.actx.sampleRate;
            // Multiple decay stages for realistic echo
            const decay1 = Math.exp(-t * 4);
            const decay2 = Math.exp(-t * 2) * 0.3;
            tailData[i] = (Math.random() * 2 - 1) * (decay1 + decay2) * 0.7;
        }
        const tailSrc = AudioManager.actx.createBufferSource();
        tailSrc.buffer = tailBuf;
        const tailFilter = AudioManager.actx.createBiquadFilter();
        tailFilter.type = 'lowpass';
        tailFilter.frequency.setValueAtTime(1200, now);
        tailFilter.frequency.exponentialRampToValueAtTime(300, now + 0.6);
        const tailGain = AudioManager.actx.createGain();
        tailGain.gain.setValueAtTime(0.8, now);
        tailGain.gain.exponentialRampToValueAtTime(0.01, now + 0.9);
        tailSrc.connect(tailFilter);
        tailFilter.connect(tailGain);
        tailGain.connect(AudioManager.convolver);
        tailSrc.start(now);

        // LAYER 11: DISTANT THUNDER RUMBLE - The shot echoing off terrain
        const thunderOsc = AudioManager.actx.createOscillator();
        const thunderGain = AudioManager.actx.createGain();
        const thunderFilter = AudioManager.actx.createBiquadFilter();
        thunderOsc.connect(thunderFilter);
        thunderFilter.connect(thunderGain);
        thunderGain.connect(AudioManager.convolver);
        thunderOsc.type = 'sine';
        thunderOsc.frequency.setValueAtTime(35, now + 0.15);
        thunderOsc.frequency.exponentialRampToValueAtTime(18, now + 0.6);
        thunderFilter.type = 'lowpass';
        thunderFilter.frequency.value = 80;
        thunderGain.gain.setValueAtTime(0.01, now);
        thunderGain.gain.linearRampToValueAtTime(0.6, now + 0.2);
        thunderGain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        thunderOsc.start(now + 0.15); thunderOsc.stop(now + 0.85);

        // LAYER 12: MUZZLE BRAKE HISS - High frequency gas escape
        const hissBuf = AudioManager.actx.createBuffer(1, AudioManager.actx.sampleRate * 0.2, AudioManager.actx.sampleRate);
        const hissData = hissBuf.getChannelData(0);
        for (let i = 0; i < hissBuf.length; i++) {
            const t = i / AudioManager.actx.sampleRate;
            hissData[i] = (Math.random() * 2 - 1) * Math.exp(-t * 15) * 0.4;
        }
        const hissSrc = AudioManager.actx.createBufferSource();
        hissSrc.buffer = hissBuf;
        const hissFilter = AudioManager.actx.createBiquadFilter();
        hissFilter.type = 'highpass';
        hissFilter.frequency.value = 5000;
        const hissGain = AudioManager.actx.createGain();
        hissGain.gain.setValueAtTime(0.4, now);
        hissGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        hissSrc.connect(hissFilter);
        hissFilter.connect(hissGain);
        hissGain.connect(AudioManager.dryGain);
        hissSrc.start(now);

        return;

    } else if (type === 'shotgunShoot') {
        // === DEVASTATING 12-GAUGE PUMP SHOTGUN BLAST ===
        // Wide, punchy, room-filling explosion with that iconic shotgun "thump"

        // LAYER 1: DEEP BODY SLAM - The chest-punch low end
        const bodyOsc = AudioManager.actx.createOscillator();
        const bodyGain = AudioManager.actx.createGain();
        const bodyFilter = AudioManager.actx.createBiquadFilter();
        bodyOsc.connect(bodyFilter);
        bodyFilter.connect(bodyGain);
        bodyGain.connect(AudioManager.dryGain);
        bodyGain.connect(AudioManager.convolver);
        bodyOsc.type = 'sine';
        bodyOsc.frequency.setValueAtTime(60, now);
        bodyOsc.frequency.exponentialRampToValueAtTime(25, now + 0.25);
        bodyFilter.type = 'lowpass';
        bodyFilter.frequency.value = 120;
        bodyGain.gain.setValueAtTime(1.4, now);
        bodyGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        bodyOsc.start(now); bodyOsc.stop(now + 0.35);

        // LAYER 2: MID PUNCH - The "thump" signature
        const thumpOsc = AudioManager.actx.createOscillator();
        const thumpGain = AudioManager.actx.createGain();
        thumpOsc.connect(thumpGain);
        thumpGain.connect(AudioManager.dryGain);
        thumpGain.connect(AudioManager.convolver);
        thumpOsc.type = 'triangle';
        thumpOsc.frequency.setValueAtTime(120, now);
        thumpOsc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
        thumpGain.gain.setValueAtTime(1.2, now);
        thumpGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        thumpOsc.start(now); thumpOsc.stop(now + 0.25);

        // LAYER 3: EXPLOSIVE CRACK - Sharp initial transient
        const crackBuf = AudioManager.actx.createBuffer(1, AudioManager.actx.sampleRate * 0.04, AudioManager.actx.sampleRate);
        const crackData = crackBuf.getChannelData(0);
        for (let i = 0; i < crackBuf.length; i++) {
            const t = i / AudioManager.actx.sampleRate;
            crackData[i] = (Math.random() * 2 - 1) * Math.exp(-t * 100) * 2.0;
        }
        const crackSrc = AudioManager.actx.createBufferSource();
        crackSrc.buffer = crackBuf;
        const crackFilter = AudioManager.actx.createBiquadFilter();
        crackFilter.type = 'bandpass';
        crackFilter.frequency.value = 3000;
        crackFilter.Q.value = 0.5;
        const crackGain = AudioManager.actx.createGain();
        crackGain.gain.value = 1.0;
        crackSrc.connect(crackFilter);
        crackFilter.connect(crackGain);
        crackGain.connect(AudioManager.dryGain);
        crackSrc.start(now);

        // LAYER 4: PELLET SPREAD NOISE - Wide frequency scatter
        const spreadBuf = AudioManager.actx.createBuffer(1, AudioManager.actx.sampleRate * 0.08, AudioManager.actx.sampleRate);
        const spreadData = spreadBuf.getChannelData(0);
        for (let i = 0; i < spreadBuf.length; i++) {
            const t = i / AudioManager.actx.sampleRate;
            // Multiple frequency components for pellet scatter feel
            spreadData[i] = (Math.random() * 2 - 1) * Math.exp(-t * 40) * 0.8 +
                           Math.sin(i * 0.3) * Math.exp(-t * 60) * 0.3;
        }
        const spreadSrc = AudioManager.actx.createBufferSource();
        spreadSrc.buffer = spreadBuf;
        const spreadFilter = AudioManager.actx.createBiquadFilter();
        spreadFilter.type = 'bandpass';
        spreadFilter.frequency.value = 2000;
        spreadFilter.Q.value = 0.3;
        const spreadGain = AudioManager.actx.createGain();
        spreadGain.gain.setValueAtTime(0.9, now);
        spreadGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        spreadSrc.connect(spreadFilter);
        spreadFilter.connect(spreadGain);
        spreadGain.connect(AudioManager.dryGain);
        spreadSrc.start(now);

        // LAYER 5: BARREL RESONANCE - Hollow tube sound
        const barrelOsc = AudioManager.actx.createOscillator();
        const barrelGain = AudioManager.actx.createGain();
        const barrelFilter = AudioManager.actx.createBiquadFilter();
        barrelOsc.connect(barrelFilter);
        barrelFilter.connect(barrelGain);
        barrelGain.connect(AudioManager.dryGain);
        barrelOsc.type = 'sawtooth';
        barrelOsc.frequency.setValueAtTime(180, now);
        barrelOsc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
        barrelFilter.type = 'bandpass';
        barrelFilter.frequency.setValueAtTime(600, now);
        barrelFilter.frequency.exponentialRampToValueAtTime(200, now + 0.15);
        barrelFilter.Q.value = 2;
        barrelGain.gain.setValueAtTime(0.6, now);
        barrelGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        barrelOsc.start(now); barrelOsc.stop(now + 0.2);

        // LAYER 6: GAS EXPULSION - Wide "whoosh"
        const gasBuf = AudioManager.actx.createBuffer(1, AudioManager.actx.sampleRate * 0.12, AudioManager.actx.sampleRate);
        const gasData = gasBuf.getChannelData(0);
        for (let i = 0; i < gasBuf.length; i++) {
            const t = i / AudioManager.actx.sampleRate;
            gasData[i] = (Math.random() * 2 - 1) * Math.exp(-t * 25) * 0.5;
        }
        const gasSrc = AudioManager.actx.createBufferSource();
        gasSrc.buffer = gasBuf;
        const gasFilter = AudioManager.actx.createBiquadFilter();
        gasFilter.type = 'lowpass';
        gasFilter.frequency.setValueAtTime(4000, now);
        gasFilter.frequency.exponentialRampToValueAtTime(500, now + 0.15);
        const gasGain = AudioManager.actx.createGain();
        gasGain.gain.setValueAtTime(0.7, now);
        gasGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        gasSrc.connect(gasFilter);
        gasFilter.connect(gasGain);
        gasGain.connect(AudioManager.dryGain);
        gasGain.connect(AudioManager.convolver);
        gasSrc.start(now);

        // LAYER 7: REVERB TAIL - Room echo
        const tailBuf = AudioManager.actx.createBuffer(1, AudioManager.actx.sampleRate * 0.5, AudioManager.actx.sampleRate);
        const tailData = tailBuf.getChannelData(0);
        for (let i = 0; i < tailBuf.length; i++) {
            const t = i / AudioManager.actx.sampleRate;
            tailData[i] = (Math.random() * 2 - 1) * Math.exp(-t * 5) * 0.5;
        }
        const tailSrc = AudioManager.actx.createBufferSource();
        tailSrc.buffer = tailBuf;
        const tailFilter = AudioManager.actx.createBiquadFilter();
        tailFilter.type = 'lowpass';
        tailFilter.frequency.setValueAtTime(800, now);
        tailFilter.frequency.exponentialRampToValueAtTime(200, now + 0.4);
        const tailGain = AudioManager.actx.createGain();
        tailGain.gain.setValueAtTime(0.5, now);
        tailGain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
        tailSrc.connect(tailFilter);
        tailFilter.connect(tailGain);
        tailGain.connect(AudioManager.convolver);
        tailSrc.start(now);

        return;

    } else if (type === 'pumpPull') {
        // Pump pull back - distinctive "chk" sound
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.1);
        filter.type = 'bandpass';
        filter.frequency.value = 1500;
        filter.Q.value = 2;
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now); osc.stop(now + 0.15);

        // Metal slide scrape
        const scrapeBuf = AudioManager.actx.createBuffer(1, AudioManager.actx.sampleRate * 0.1, AudioManager.actx.sampleRate);
        const scrapeOut = scrapeBuf.getChannelData(0);
        for (let i = 0; i < scrapeBuf.length; i++) {
            const t = i / AudioManager.actx.sampleRate;
            scrapeOut[i] = (Math.random() * 2 - 1) * (0.4 + 0.6 * Math.sin(i * 0.15)) * (1 - t * 8);
        }
        const scrapeN = AudioManager.actx.createBufferSource(); scrapeN.buffer = scrapeBuf;
        const scrapeFilter = AudioManager.actx.createBiquadFilter();
        scrapeFilter.type = 'bandpass'; scrapeFilter.frequency.value = 3000; scrapeFilter.Q.value = 1.5;
        const scrapeG = AudioManager.actx.createGain();
        scrapeG.gain.value = 0.45;
        scrapeN.connect(scrapeFilter); scrapeFilter.connect(scrapeG);
        scrapeG.connect(AudioManager.dryGain);
        scrapeN.start(now);

        // Shell eject clatter
        const shellOsc = AudioManager.actx.createOscillator();
        const shellGain = AudioManager.actx.createGain();
        shellOsc.connect(shellGain); shellGain.connect(AudioManager.dryGain);
        shellOsc.type = 'sine';
        shellOsc.frequency.setValueAtTime(2000, now + 0.05);
        shellOsc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        shellGain.gain.setValueAtTime(0.25, now + 0.05);
        shellGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        shellOsc.start(now + 0.05); shellOsc.stop(now + 0.15);

    } else if (type === 'pumpPush') {
        // Pump push forward - "chak" chambering sound
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.linearRampToValueAtTime(300, now + 0.08);
        filter.type = 'bandpass';
        filter.frequency.value = 1200;
        filter.Q.value = 1.5;
        gain.gain.setValueAtTime(0.55, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now); osc.stop(now + 0.12);

        // Heavy slam at end - shell locks in
        const slamOsc = AudioManager.actx.createOscillator();
        const slamGain = AudioManager.actx.createGain();
        slamOsc.connect(slamGain); slamGain.connect(AudioManager.dryGain); slamGain.connect(AudioManager.convolver);
        slamOsc.type = 'sine';
        slamOsc.frequency.setValueAtTime(150, now + 0.06);
        slamOsc.frequency.exponentialRampToValueAtTime(60, now + 0.12);
        slamGain.gain.setValueAtTime(0.7, now + 0.06);
        slamGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        slamOsc.start(now + 0.06); slamOsc.stop(now + 0.18);

        // Metallic click lock
        const lockOsc = AudioManager.actx.createOscillator();
        const lockGain = AudioManager.actx.createGain();
        lockOsc.connect(lockGain); lockGain.connect(AudioManager.dryGain);
        lockOsc.type = 'square';
        lockOsc.frequency.setValueAtTime(2200, now + 0.08);
        lockOsc.frequency.exponentialRampToValueAtTime(1600, now + 0.1);
        lockGain.gain.setValueAtTime(0.35, now + 0.08);
        lockGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        lockOsc.start(now + 0.08); lockOsc.stop(now + 0.14);

    } else if (type === 'shellLoad') {
        // Single shell being loaded into tube
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);
        filter.type = 'bandpass';
        filter.frequency.value = 2000;
        filter.Q.value = 2;
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now); osc.stop(now + 0.1);

        // Click of shell seating
        const clickOsc = AudioManager.actx.createOscillator();
        const clickGain = AudioManager.actx.createGain();
        clickOsc.connect(clickGain); clickGain.connect(AudioManager.dryGain);
        clickOsc.type = 'square';
        clickOsc.frequency.setValueAtTime(1800, now + 0.03);
        clickOsc.frequency.exponentialRampToValueAtTime(1200, now + 0.06);
        clickGain.gain.setValueAtTime(0.3, now + 0.03);
        clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        clickOsc.start(now + 0.03); clickOsc.stop(now + 0.1);

    } else if (type === 'boltLift') {
        // Bolt handle lift - metallic click up
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);
        filter.type = 'bandpass';
        filter.frequency.value = 2000;
        filter.Q.value = 3;
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now); osc.stop(now + 0.1);

        // Metallic click
        const clickOsc = AudioManager.actx.createOscillator();
        const clickGain = AudioManager.actx.createGain();
        clickOsc.connect(clickGain); clickGain.connect(AudioManager.dryGain);
        clickOsc.type = 'square';
        clickOsc.frequency.setValueAtTime(3000, now);
        clickOsc.frequency.exponentialRampToValueAtTime(1500, now + 0.02);
        clickGain.gain.setValueAtTime(0.25, now);
        clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
        clickOsc.start(now); clickOsc.stop(now + 0.04);

    } else if (type === 'boltPull') {
        // Bolt pull back - heavy scrape
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.15);
        filter.type = 'bandpass';
        filter.frequency.value = 1200;
        filter.Q.value = 2;
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.start(now); osc.stop(now + 0.2);

        // Metal scrape noise
        const scrapeBuf = AudioManager.actx.createBuffer(1, AudioManager.actx.sampleRate * 0.15, AudioManager.actx.sampleRate);
        const scrapeOut = scrapeBuf.getChannelData(0);
        for (let i = 0; i < scrapeBuf.length; i++) {
            const t = i / AudioManager.actx.sampleRate;
            scrapeOut[i] = (Math.random() * 2 - 1) * (0.3 + 0.7 * Math.sin(i * 0.1)) * (1 - t * 4);
        }
        const scrapeN = AudioManager.actx.createBufferSource(); scrapeN.buffer = scrapeBuf;
        const scrapeFilter = AudioManager.actx.createBiquadFilter();
        scrapeFilter.type = 'bandpass'; scrapeFilter.frequency.value = 2500; scrapeFilter.Q.value = 2;
        const scrapeG = AudioManager.actx.createGain();
        scrapeG.gain.value = 0.4;
        scrapeN.connect(scrapeFilter); scrapeFilter.connect(scrapeG);
        scrapeG.connect(AudioManager.dryGain);
        scrapeN.start(now);

    } else if (type === 'boltPush') {
        // Bolt push forward - chamber round, heavy slam
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(200, now + 0.12);
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        filter.Q.value = 1.5;
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now); osc.stop(now + 0.18);

        // Heavy thunk at end
        const thunkOsc = AudioManager.actx.createOscillator();
        const thunkGain = AudioManager.actx.createGain();
        thunkOsc.connect(thunkGain); thunkGain.connect(AudioManager.dryGain); thunkGain.connect(AudioManager.convolver);
        thunkOsc.type = 'sine';
        thunkOsc.frequency.setValueAtTime(120, now + 0.1);
        thunkOsc.frequency.exponentialRampToValueAtTime(50, now + 0.18);
        thunkGain.gain.setValueAtTime(0.6, now + 0.1);
        thunkGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        thunkOsc.start(now + 0.1); thunkOsc.stop(now + 0.22);

    } else if (type === 'boltDown') {
        // Bolt handle lock down - solid click
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.03);
        filter.type = 'highpass';
        filter.frequency.value = 800;
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
        osc.start(now); osc.stop(now + 0.08);

        // Locking click
        const lockOsc = AudioManager.actx.createOscillator();
        const lockGain = AudioManager.actx.createGain();
        lockOsc.connect(lockGain); lockGain.connect(AudioManager.dryGain);
        lockOsc.type = 'square';
        lockOsc.frequency.setValueAtTime(2500, now + 0.02);
        lockOsc.frequency.exponentialRampToValueAtTime(1800, now + 0.04);
        lockGain.gain.setValueAtTime(0.3, now + 0.02);
        lockGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        lockOsc.start(now + 0.02); lockOsc.stop(now + 0.06);

    } else if (type === 'weaponSwitch') {
        // Quick weapon swap sound
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
        filter.type = 'bandpass';
        filter.frequency.value = 1500;
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now); osc.stop(now + 0.12);

        // Cloth/strap rustle
        const rustleBuf = AudioManager.actx.createBuffer(1, AudioManager.actx.sampleRate * 0.1, AudioManager.actx.sampleRate);
        const rustleOut = rustleBuf.getChannelData(0);
        for (let i = 0; i < rustleBuf.length; i++) {
            rustleOut[i] = (Math.random() * 2 - 1) * Math.exp(-i / (AudioManager.actx.sampleRate * 0.03)) * 0.3;
        }
        const rustleN = AudioManager.actx.createBufferSource(); rustleN.buffer = rustleBuf;
        const rustleFilter = AudioManager.actx.createBiquadFilter();
        rustleFilter.type = 'highpass'; rustleFilter.frequency.value = 2000;
        const rustleG = AudioManager.actx.createGain();
        rustleG.gain.value = 0.25;
        rustleN.connect(rustleFilter); rustleFilter.connect(rustleG);
        rustleG.connect(AudioManager.dryGain);
        rustleN.start(now);

    } else if (type === 'collateral') {
        // Satisfying multi-kill sound - rising chime with bass punch
        // Bass punch
        const punchOsc = AudioManager.actx.createOscillator();
        const punchGain = AudioManager.actx.createGain();
        punchOsc.connect(punchGain); punchGain.connect(AudioManager.dryGain);
        punchOsc.type = 'sine';
        punchOsc.frequency.setValueAtTime(100, now);
        punchOsc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
        punchGain.gain.setValueAtTime(0.6, now);
        punchGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        punchOsc.start(now); punchOsc.stop(now + 0.25);

        // Rising chime (satisfying ding)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
        filter.type = 'bandpass';
        filter.frequency.value = 1500;
        filter.Q.value = 2;
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now); osc.stop(now + 0.45);

        // Harmonic overtone
        const harmOsc = AudioManager.actx.createOscillator();
        const harmGain = AudioManager.actx.createGain();
        harmOsc.connect(harmGain); harmGain.connect(AudioManager.dryGain);
        harmOsc.type = 'sine';
        harmOsc.frequency.setValueAtTime(1200, now + 0.05);
        harmOsc.frequency.exponentialRampToValueAtTime(2000, now + 0.2);
        harmGain.gain.setValueAtTime(0.2, now + 0.05);
        harmGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        harmOsc.start(now + 0.05); harmOsc.stop(now + 0.4);
    }
}


export { playSound };