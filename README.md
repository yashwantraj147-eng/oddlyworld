# ODDLYWORLD: The Infinite Toybox
*An extraordinary, whimsical, endlessly explorable digital desktop playground.*

[![Vitest Tests](https://img.shields.io/badge/tests-12%20passed-brightgreen.svg)](#test-suite)
[![Platform](https://img.shields.io/badge/platform-Windows%2011%20%7C%20Web-blue.svg)](#platform-support)
[![Engine](https://img.shields.io/badge/engine-Three.js%20%2B%20Cannon--es-orange.svg)](#3d--physics-architecture)

---

## 🌟 The Big Idea
**ODDLYWORLD** is a handcrafted digital toybox containing miniature living universes. Inside this workshop, users step into whimsical dioramas populated by autonomous creatures, kinetic Rube Goldberg machines, dynamic weather, and physical forces. 

You can zoom into these worlds, sculpt terrain, invent strange organisms with modular anatomy, construct elaborate marble-run contraptions, alter physical laws in the **Chaos Engine**, and observe emergent consequences.

---

## 🚀 Quick Launch Instructions

### 1. Run in Development Mode
To launch the Vite development server with hot-module reloading:
```powershell
npm run dev
```
Open your browser at `http://localhost:5173/` (or the port indicated in terminal).

### 2. Launch Native Desktop Application (Electron)
ODDLYWORLD features a first-class desktop integration with custom Windows application menus and native window framing:
```powershell
npm run electron:dev
```

### 3. Run Automated Test Suite
To execute the comprehensive automated tests for world generation, creature AI, physics simulation, chaos mutations, and undo/redo logic:
```powershell
npm test
```

### 4. Build Production Bundle
To compile TypeScript and produce an optimized production distribution:
```powershell
npm run build
```

---

## 🏗️ Technical Architecture & Core Subsystems

ODDLYWORLD is engineered with a strict decoupling between domain simulation logic, 3D rendering, audio synthesis, and the user interface.

```
e:/actually a fun app/
├── electron/
│   ├── main.cjs               # Native Electron window process & application menus
│   └── preload.cjs            # Safe context bridge for desktop APIs
├── src/
│   ├── core/
│   │   ├── world/
│   │   │   ├── WorldModel.ts          # Core persistent universe data structures
│   │   │   ├── WorldThemes.ts         # 5 Distinct diorama biome configurations
│   │   │   ├── WorldGenerator.ts      # Seeded PRNG procedural terrain & prop scattering
│   │   │   ├── CuratedWorlds.ts       # Starter dioramas (Clockwork Rube, Jelly Sanctuary, etc.)
│   │   │   └── WorldPersistence.ts    # LocalStorage & .oddlyworld file export/import
│   │   ├── creatures/
│   │   │   ├── CreatureModel.ts       # Anatomy, traits, needs, thoughts, and memories
│   │   │   ├── CreatureAnatomy.ts     # Procedural morphology & color palettes
│   │   │   └── CreatureAI.ts          # Utility-based state machine, needs & locomotion
│   │   ├── physics/
│   │   │   ├── ContraptionModel.ts    # Ramps, marbles, springs, fans, bells, portals
│   │   │   └── PhysicsEngine.ts       # Cannon-es integration & reset-to-construction state
│   │   ├── chaos/
│   │   │   └── ChaosEngine.ts         # World modifier levers & reversible physics mutations
│   │   ├── discoveries/
│   │   │   └── DiscoverySystem.ts     # 13+ condition-based unlocks, lore & evidence records
│   │   ├── timeline/
│   │   │   └── TimeMachine.ts         # Deep snapshots, reality forking & branch comparison
│   │   ├── challenges/
│   │   │   └── ChallengeEngine.ts     # Kinetic & ecological objective evaluators
│   │   ├── audio/
│   │   │   └── ProceduralAudioEngine.ts # 100% offline Web Audio synthesizer
│   │   ├── commands/
│   │   │   └── CommandManager.ts      # Command pattern for multi-level Undo & Redo
│   │   └── engine/
│   │       └── SimulationEngine.ts    # Fixed-timestep loop (60Hz) decoupled from rendering
│   ├── rendering/
│   │   ├── WorldRenderer.ts           # Three.js scene, dynamic Day/Night lighting, shadows
│   │   ├── CameraController.ts        # Smooth orbit, pan, zoom, follow mode & presets
│   │   ├── TerrainMeshBuilder.ts      # Heightmap plane with diorama pedestal base
│   │   ├── CreatureMeshBuilder.ts     # Modular procedural 3D creatures & waddle animation
│   │   ├── ContraptionMeshBuilder.ts  # 3D models for ramps, springs, spinners, fans, bells
│   │   └── ParticleSystem.ts          # Floating ambient spores, fireflies, and dust motes
│   ├── ui/
│   │   ├── design-system/             # Handcrafted Digital Toybox styling
│   │   ├── components/                # Navbars, toolbars, inspector, and modals
│   │   └── viewport/                  # Interactive 3D Canvas Raycast Viewport
│   ├── App.tsx                        # Master container orchestrating state & UI
│   └── main.tsx                       # React 19 entry point
└── tests/                             # Vitest domain & simulation test suite
```

---

## 🎨 Curated Dioramas Included
1. **The Clockwork Rube**: A pre-assembled, functioning Rube Goldberg machine featuring an elevated ramp chute, rolling golden marble, brass trampoline spring, motorized spinner gate, pressure switch, toppling dominoes, and a victory gong bell.
2. **Sanctuary of the Bouncing Jelly**: Lush floating islands under sunlit clouds with ponds, cloud trampolines, and 3 playful jellypod creatures.
3. **Luminescent Spore Grove**: Fungal valley in perpetual twilight with glowing neon mushroom caps, anti-gravity levitating spore gems, and linked quantum wormhole portals.

---

## 🕹️ Keyboard Shortcuts Reference

| Shortcut | Action |
| :--- | :--- |
| `Space` | Play / Pause Simulation Clock |
| `.` | Step Forward 1 Tick (when paused) |
| `1` / `2` / `3` | Set Speed Multiplier (0.5x, 1x, 2x, 5x) |
| `R` | Reset All Contraptions to Construction State |
| `F` | Focus & Fit World to Viewport |
| `Ctrl + 1` | Top-Down Tactical Camera |
| `Ctrl + 2` | 45° Isometric Camera |
| `P` | Photo Studio Snapshot (PNG capture) |
| `Ctrl + C` | Open Creature Creator Laboratory |
| `Ctrl + K` | Open The Chaos Engine |
| `Ctrl + J` | Open Field Naturalist Journal |
| `Ctrl + T` | Open Temporal Time Machine |
| `Ctrl + G` | Open Curated Challenges |
| `Ctrl + Z` | Undo Creative Action |
| `Ctrl + Y` | Redo Creative Action |
| `Ctrl + S` | Save Checkpoint |
| `V` / `B` / `C` / `T` / `X` | Switch Tools (Inspect / Build / Spawn / Sculpt / Erase) |
| `F1` | Open Shortcut & Controls Cheatsheet |

---

## 🔬 Test Suite Verification
All 12 automated unit tests run and pass cleanly via Vitest:
- `tests/worldGenerator.test.ts`: Seed repeatability, heightmap boundary constraints, prop spatial clearance.
- `tests/creatureAI.test.ts`: Needs degradation, state machine transitions (exhaustion -> sleep, hunger -> eat), bounds clamping.
- `tests/physicsContraption.test.ts`: Rigid-body gravity acceleration, reset-to-construction state.
- `tests/chaosEngine.test.ts`: Modifier activation, physics restitution mutation, and clean state restoration.
- `tests/commandUndoRedo.test.ts`: Command execution, undo stack reversal, redo stack reapplication.
