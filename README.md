```
██████╗ ██████╗  █████╗ ███████╗███████╗███████╗ █████╗ ██╗     ██╗
██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝██╔════╝██╔══██╗██║     ██║
██████╔╝██████╔╝███████║███████╗███████╗█████╗  ███████║██║     ██║
██╔══██╗██╔══██╗██╔══██║╚════██║╚════██║██╔══╝  ██╔══██║██║     ██║
██████╔╝██║  ██║██║  ██║███████║███████║██║     ██║  ██║███████╗███████╗
╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝
```

# 🔥 BRASSFALL - Browser-Based Zombie Survival FPS

> *"60 FPS or die. Every bullet counts. Every kill satisfies."*

A hardcore browser-based first-person shooter built entirely in a single HTML file. No build step. No dependencies. Just open and play.

```
                            ___
                           /   \
                          |  O  |     <- You
                          |  |  |
                         /|  |  |\
                        / |     | \
                           |   |
                          /     \
                         /       \

    [============================]
    |  AK-47  |  SNIPER  |  PUMP |
    [============================]
              YOUR ARSENAL
```

---

## 🎮 Features

### ⚔️ Three Devastating Weapons

```
    AK-47                    SNIPER                   SHOTGUN
    ═══════                  ══════                   ═══════

      _____                    _____                  ______
     /     |===|              /     |===============||      |
    |======|   |===]         |======|               ||======|===]
     \_____| | |              \_____|===============||______|
           |_|                       ║                  ║
                                     ║ .50 BMG          ║ 12 GAUGE
    • Full-auto fury          • One-shot headshots    • 8-pellet spread
    • 30 round mag            • Penetrates 3 enemies  • Pump-action
    • Low recoil              • Brutal bolt-action    • Auto-pump
```

### 🧟 Zombie Horde System

```
   NORMAL          RUNNER          BRUTE           CRAWLER
   ══════          ══════          ═════           ═══════

    .-.             .-.            .-==-.            .-.
   (o o)           (@ @)          (O   O)          (x x)
    \_/             \_/           \_____/            |_|
     |               |               |||            /
    /|\             /|\             /|||\          ===
    / \            // \\           // | \\

   Standard        Fast &         THICC BOI        Low &
   fodder          deadly         (immune to       sneaky
                                  headshots!)
```

### 🎯 Satisfying Combat

```
                    ╔═══════════════════════════════╗
                    ║      KILL MULTIPLIER          ║
                    ╠═══════════════════════════════╣
                    ║                               ║
                    ║         ██  ██                ║
                    ║        ██    ██   ██  ██      ║
                    ║       ██      ██   ████       ║
                    ║        ██    ██   ██  ██      ║
                    ║         ██  ██   ██    ██     ║
                    ║                               ║
                    ║     Chain kills for 10x!      ║
                    ╚═══════════════════════════════╝

    • Spring-physics weapon animations
    • Procedural muzzle flash & sparks
    • Screen shake & recoil
    • Headshot explosions (gore!)
    • Cinematic slow-mo on wave clear
    • Kill combo multiplier (up to 10x)
```

### 🎨 Visual Polish

```
    ╭─────────────────────────────────────────╮
    │  POST-PROCESSING PIPELINE               │
    ├─────────────────────────────────────────┤
    │                                         │
    │  [Bloom] ──► [Chromatic Aberration]     │
    │                      │                  │
    │                      ▼                  │
    │            [Film Grain + Vignette]      │
    │                      │                  │
    │                      ▼                  │
    │              [Motion Blur]              │
    │                      │                  │
    │                      ▼                  │
    │               YOUR EYES                 │
    │                                         │
    ╰─────────────────────────────────────────╯
```

### 🔊 Procedural Audio

All sounds generated in real-time using Web Audio API - zero audio files!

```
    ♪ ═══════════════════════════════════════ ♪

      GUNSHOTS      Synthesized from noise + oscillators
      IMPACTS       Metallic pings & thuds
      EXPLOSIONS    Layered bass + noise bursts
      MUSIC         Dynamic pitch in slow-mo
      REGEN         Ascending chimes when healing

    ♪ ═══════════════════════════════════════ ♪
```

---

## 🕹️ Controls

```
    ╔═══════════════════════════════════════════════════════╗
    ║                                                       ║
    ║         [W]              [1] AK-47                    ║
    ║          ▲               [2] Sniper                   ║
    ║     [A] ◄ ► [D]          [3] Shotgun                  ║
    ║          ▼               [Scroll] Cycle weapons       ║
    ║         [S]                                           ║
    ║                                                       ║
    ║     [SHIFT] Sprint       [R] Reload                   ║
    ║     [SPACE] Jump         [ESC] Pause                  ║
    ║                                                       ║
    ║     [LEFT CLICK] ═══════════════► SHOOT               ║
    ║     [RIGHT CLICK] ══════════════► AIM                 ║
    ║                                                       ║
    ╚═══════════════════════════════════════════════════════╝
```

---

## 🚀 Quick Start

```bash
# That's it. Just open the file.
open index.html

# Or serve locally for hot reload
npx serve .
```

No npm install. No webpack. No React. Just raw HTML, CSS, and JavaScript.

---

## 🏗️ Technical Highlights

```
    ┌─────────────────────────────────────────────────────┐
    │                   ARCHITECTURE                       │
    ├─────────────────────────────────────────────────────┤
    │                                                     │
    │   ┌─────────┐    ┌─────────┐    ┌─────────┐        │
    │   │ THREE.js│───►│ Physics │───►│ Render  │        │
    │   │  Scene  │    │ Springs │    │ Pipeline│        │
    │   └─────────┘    └─────────┘    └─────────┘        │
    │        │              │              │              │
    │        ▼              ▼              ▼              │
    │   ┌─────────┐    ┌─────────┐    ┌─────────┐        │
    │   │ Entity  │    │  Audio  │    │  Post   │        │
    │   │  Pools  │    │ Synth   │    │ Effects │        │
    │   └─────────┘    └─────────┘    └─────────┘        │
    │                                                     │
    │   • Object pooling for 60fps                       │
    │   • Procedural texture generation                  │
    │   • Spring-based animations                        │
    │   • Spatial audio system                           │
    │   • Swarm AI with pathfinding                      │
    │                                                     │
    └─────────────────────────────────────────────────────┘
```

### Key Systems

| System | Description |
|--------|-------------|
| **Spring Physics** | Custom spring class for weapon sway, recoil, screen shake |
| **Entity Pools** | Pre-allocated bullets, shells, particles, decals |
| **Procedural Textures** | Wood grain, brushed metal, concrete - all Canvas2D |
| **Procedural Audio** | Gunshots, impacts, music - all Web Audio API |
| **Zombie AI** | Swarm intelligence, flank detection, stuck avoidance |
| **Health Regen** | Regenerate after 5 seconds of no damage |
| **Slow-Mo** | Cinematic effect with pitch-shifted audio |

---

## 📦 What's In The Box

```
shootaz/
│
├── index.html      ← The entire game (11,000+ lines of glory)
├── README.md       ← You are here
└── CLAUDE.md       ← AI development notes
```

Single. File. Game.

---

## 🎖️ Version History

### v2.0 - THE BIG ONE 🔥
- ✅ **Pause Menu** - ESC to pause with blur overlay
- ✅ **Health Regeneration** - Heal after 5s of no damage
- ✅ **Enhanced Score Animations** - Counting effect, floating bonuses
- ✅ **Smooth Slow-Mo Audio** - Music pitch ramps down cinematically
- ✅ **Brute Headshot Immunity** - Big boys have thick skulls
- ✅ **Advanced Zombie AI** - Predictive pathfinding, stuck escape
- ✅ **Kill Multiplier System** - Chain kills up to 10x

### v1.x
- Shotgun with pump-action mechanics
- Sniper rifle with penetration
- Main menu system
- Wave-based survival
- Procedural everything

---

## 🧠 Built With

- **Three.js r128** - 3D rendering
- **TWEEN.js** - Animation sequencing
- **Web Audio API** - Procedural sound
- **Pure JavaScript** - No framework needed
- **Claude Code** - AI-assisted development

---

## 📜 License

Do whatever you want with it. Just have fun.

---

```
    ╔════════════════════════════════════════════════════════════╗
    ║                                                            ║
    ║   "In a world overrun by the undead, one browser tab       ║
    ║    stands between humanity and extinction."                ║
    ║                                                            ║
    ║                    - Loading Screen, probably              ║
    ║                                                            ║
    ╚════════════════════════════════════════════════════════════╝

                         NOW GO KILL SOME ZOMBIES.

                              🔥 BRASSFALL 🔥
```
