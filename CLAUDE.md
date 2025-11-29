# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**BRASSFALL** - a browser-based AK-47 shooting simulation built as a single-file HTML application. It uses Three.js (r128) for 3D rendering and TWEEN.js for animations, both loaded from CDN.

## Running the Project

Open `index.html` directly in a browser - no build step or server required.

## Architecture

### Core Systems (all in `index.html`)

**Physics & Animation**
- `Spring` class: Custom spring physics for procedural weapon motion (stiffness, damping, mass)
- `Springs` object: Pre-configured springs for different motion axes (swayX/Y, recoilZ/X/Y, bobY, roll)
- TWEEN.js handles reload animation sequences

**Procedural Generation**
- `TextureFactory`: Generates all textures at runtime via Canvas2D (wood grain, metal brushed, concrete, brick, bullet holes)
- No external texture assets - everything is procedurally created

**Audio Engine**
- Web Audio API with convolution reverb
- `playSound(type)`: Synthesizes sounds ('shoot', 'empty', 'mag_out', 'mag_in', 'rack')
- No audio files - all sounds generated via oscillators and noise

**Rendering & Post-Processing**
- Custom procedural skybox shader (gradient sky)
- Shadow mapping with PCF soft shadows
- ACES filmic tone mapping
- EffectComposer pipeline: Bloom, Chromatic Aberration, Vignette, Film Grain
- Dynamic bloom intensity on muzzle flash
- Environment mapping for metallic reflections

**Game Systems**
- Raycast hitscan ballistics
- Entity pools: `shells[]`, `mags[]`, `tracers[]`, `decals[]`, `smokeParticles[]`, `sparks[]`, `debris[]`
- Atmospheric dust particle system
- Spring-based screen shake
- State: `ammo`, `reserve`, `isReloading`, `isFiring`, `isAiming`

### Controls
- WASD: Movement
- Mouse: Look
- LMB: Fire (full-auto)
- RMB: Aim down sights
- R: Reload

### Key Functions
- `shoot()`: Handles firing, spring impulses, raycast, tracer/decal spawning
- `reload()`: Complex tween-based animation sequence with mag drop physics
- `animate()`: Main loop - updates springs, entities, renders frame
