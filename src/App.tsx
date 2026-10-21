import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import './ui/design-system/DesignSystem.css';

import { ToyboxWorld } from './core/world/WorldModel';
import { generateWorld } from './core/world/WorldGenerator';
import { createCuratedClockworkRube, WorldBundle } from './core/world/CuratedWorlds';
import { CreatureEntity } from './core/creatures/CreatureModel';
import { createRandomCreature } from './core/creatures/CreatureAnatomy';
import { ContraptionPart, ContraptionPartType, SignalWire } from './core/physics/ContraptionModel';
import { SimulationEngine } from './core/engine/SimulationEngine';
import { DiscoverySystem } from './core/discoveries/DiscoverySystem';
import { ChallengeEngine } from './core/challenges/ChallengeEngine';
import { TimeMachine, WorldSnapshot } from './core/timeline/TimeMachine';
import { CommandManager, ICommand } from './core/commands/CommandManager';
import { WorldPersistence } from './core/world/WorldPersistence';
import { globalAudio } from './core/audio/ProceduralAudioEngine';

import { WorldViewport } from './ui/viewport/WorldViewport';
import { WorldRenderer } from './rendering/WorldRenderer';
import { TopNavigation } from './ui/components/TopNavigation';
import { SimulationToolbar } from './ui/components/SimulationToolbar';
import { ToolPalette, ToolMode } from './ui/components/ToolPalette';
import { InspectorPanel } from './ui/components/InspectorPanel';

import { CreatureCreatorModal } from './ui/components/CreatureCreatorModal';
import { ChaosEngineModal } from './ui/components/ChaosEngineModal';
import { FieldJournalModal } from './ui/components/FieldJournalModal';
import { TimeMachineModal } from './ui/components/TimeMachineModal';
import { WorldGalleryModal } from './ui/components/WorldGalleryModal';
import { ChallengesModal } from './ui/components/ChallengesModal';
import { ShortcutHelpModal } from './ui/components/ShortcutHelpModal';

export function App() {
  // 1. Initial State from Curated World
  const [initialData] = useState<WorldBundle>(() => createCuratedClockworkRube());
  const [world, setWorld] = useState<ToyboxWorld>(initialData.world);
  const [creatures, setCreatures] = useState<CreatureEntity[]>(initialData.creatures);
  const [contraptions, setContraptions] = useState<ContraptionPart[]>(initialData.contraptions);
  const [wires, setWires] = useState<SignalWire[]>([]);

  // 2. Core Engines
  const discoverySystemRef = useRef<DiscoverySystem>(new DiscoverySystem());
  const challengeEngineRef = useRef<ChallengeEngine>(new ChallengeEngine());
  const commandManagerRef = useRef<CommandManager>(new CommandManager());
  const timeMachineRef = useRef<TimeMachine>(
    new TimeMachine({
      id: 'snap_init',
      name: 'Initial State',
      description: 'World emergence snapshot',
      timestamp: Date.now(),
      simulationTime: 0,
      worldData: { world: initialData.world, creatures: initialData.creatures, contraptionParts: initialData.contraptions, wires: [] },
    })
  );

  const simEngineRef = useRef<SimulationEngine | null>(null);
  const rendererRef = useRef<WorldRenderer | null>(null);

  // 3. UI States
  const [currentMode, setCurrentMode] = useState<ToolMode>('inspect');
  const [selectedContraptionType, setSelectedContraptionType] = useState<ContraptionPartType>('marble');
  const [sculptMode, setSculptMode] = useState<'raise' | 'lower' | 'smooth'>('raise');

  const [selectedEntity, setSelectedEntity] = useState<{ type: 'creature' | 'contraption' | null; id: string | null }>({ type: null, id: null });
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Modals
  const [isCreatureLabOpen, setCreatureLabOpen] = useState<boolean>(false);
  const [isChaosOpen, setChaosOpen] = useState<boolean>(false);
  const [isJournalOpen, setJournalOpen] = useState<boolean>(false);
  const [isTimeMachineOpen, setTimeMachineOpen] = useState<boolean>(false);
  const [isGalleryOpen, setGalleryOpen] = useState<boolean>(false);
  const [isChallengesOpen, setChallengesOpen] = useState<boolean>(false);
  const [isHelpOpen, setHelpOpen] = useState<boolean>(false);

  // Force re-render ticks for UI updates (e.g. Needs meters, active chaos, undo state)
  const [, setTick] = useState<number>(0);

  // Initialize Simulation Engine
  useEffect(() => {
    const engine = new SimulationEngine({
      world,
      creatures,
      contraptionParts: contraptions,
      wires,
      discoverySystem: discoverySystemRef.current,
      challengeEngine: challengeEngineRef.current,
    });
    simEngineRef.current = engine;

    let animId: number;
    let lastTime = performance.now();
    let lastUiTick = 0;

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      engine.update(dt);

      // Throttle React state re-render tick to ~4 times per second (250ms) to avoid churning React
      if (now - lastUiTick > 250) {
        lastUiTick = now;
        setTick(t => (t + 1) % 1000);
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, [world.id]);

  // Setup Global Keyboard Shortcuts & Electron Menu integration
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === '.') {
        e.preventDefault();
        stepSim();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        resetContraptions();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        rendererRef.current?.cameraController.fitToWorld();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        takePhotoSnapshot();
      } else if (e.key === 'F1') {
        e.preventDefault();
        setHelpOpen(true);
      } else if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          if (e.shiftKey) handleRedo();
          else handleUndo();
        } else if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          handleRedo();
        } else if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          saveCheckpoint();
        } else if (e.key === 'c' || e.key === 'C') {
          e.preventDefault();
          setCreatureLabOpen(true);
        } else if (e.key === 'k' || e.key === 'K') {
          e.preventDefault();
          setChaosOpen(true);
        } else if (e.key === 'j' || e.key === 'J') {
          e.preventDefault();
          setJournalOpen(true);
        } else if (e.key === 't' || e.key === 'T') {
          e.preventDefault();
          setTimeMachineOpen(true);
        } else if (e.key === 'g' || e.key === 'G') {
          e.preventDefault();
          setChallengesOpen(true);
        } else if (e.key === '1') {
          e.preventDefault();
          rendererRef.current?.cameraController.setTopDown();
        } else if (e.key === '2') {
          e.preventDefault();
          rendererRef.current?.cameraController.setIsometric();
        }
      } else {
        // Tool mode shortcuts
        if (e.key === 'v' || e.key === 'V') setCurrentMode('inspect');
        else if (e.key === 'b' || e.key === 'B') setCurrentMode('contraption');
        else if (e.key === 'c' || e.key === 'C') setCurrentMode('creature_spawn');
        else if (e.key === 't' || e.key === 'T') setCurrentMode('sculpt');
        else if (e.key === 'x' || e.key === 'X') setCurrentMode('eraser');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Electron API Menu Bridge
    const electronCleanup = (window as any).electronAPI?.onMenuAction?.((action: string) => {
      if (action === 'new-world') handleGenerateNewWorld();
      else if (action === 'open-gallery') setGalleryOpen(true);
      else if (action === 'save-world') saveCheckpoint();
      else if (action === 'undo') handleUndo();
      else if (action === 'redo') handleRedo();
      else if (action === 'toggle-sim') togglePlay();
      else if (action === 'step-sim') stepSim();
      else if (action === 'reset-contraptions') resetContraptions();
      else if (action === 'fit-world') rendererRef.current?.cameraController.fitToWorld();
      else if (action === 'cam-top') rendererRef.current?.cameraController.setTopDown();
      else if (action === 'cam-iso') rendererRef.current?.cameraController.setIsometric();
      else if (action === 'open-creature-creator') setCreatureLabOpen(true);
      else if (action === 'open-chaos') setChaosOpen(true);
      else if (action === 'open-journal') setJournalOpen(true);
      else if (action === 'open-timemachine') setTimeMachineOpen(true);
      else if (action === 'open-challenges') setChallengesOpen(true);
      else if (action === 'open-help') setHelpOpen(true);
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      electronCleanup?.();
    };
  }, [world, creatures, contraptions]);

  const togglePlay = () => {
    if (!simEngineRef.current) return;
    const paused = simEngineRef.current.togglePause();
    setIsPaused(paused);
  };

  const stepSim = () => {
    simEngineRef.current?.stepOnce();
  };

  const resetContraptions = () => {
    simEngineRef.current?.resetContraptions();
  };

  const saveCheckpoint = () => {
    WorldPersistence.saveWorldBundle(world, creatures, contraptions, wires);
    timeMachineRef.current.createSnapshot(
      `Checkpoint ${new Date().toLocaleTimeString()}`,
      'Manual saved checkpoint',
      world,
      creatures,
      contraptions,
      wires
    );
    globalAudio.playClick();
    setHasUnsavedChanges(false);
  };

  const handleUndo = () => {
    const success = commandManagerRef.current.undo();
    if (success) globalAudio.playClick();
  };

  const handleRedo = () => {
    const success = commandManagerRef.current.redo();
    if (success) globalAudio.playClick();
  };

  const takePhotoSnapshot = () => {
    globalAudio.playClick();
    const renderer = rendererRef.current?.renderer;
    if (renderer) {
      const dataUrl = renderer.domElement.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `oddlyworld_${world.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
      a.click();
    }
  };

  // 4. Creative Editing Actions with Undo/Redo Commands
  const handlePlaceContraption = (pos: THREE.Vector3) => {
    const newPart: ContraptionPart = {
      id: `part_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type: selectedContraptionType,
      name: `${selectedContraptionType.replace('_', ' ')} #${contraptions.length + 1}`,
      position: { x: pos.x, y: pos.y, z: pos.z },
      rotation: { x: 0, y: 0, z: selectedContraptionType === 'ramp' ? -0.3 : 0 },
      scale: { x: 1, y: 1, z: 1 },
      colorHex: selectedContraptionType === 'marble' ? '#f472b6' : '#38bdf8',
      isStatic: selectedContraptionType !== 'marble' && selectedContraptionType !== 'domino',
      marbleProperties: selectedContraptionType === 'marble' ? { material: 'rubber', radius: 0.45, bounciness: 0.85, mass: 1 } : undefined,
      springProperties: selectedContraptionType === 'spring' ? { impulseStrength: 13.0, cooldownSeconds: 0.4 } : undefined,
      fanProperties: selectedContraptionType === 'fan' ? { windStrength: 16.0, windRange: 6.0, active: true } : undefined,
      spinnerProperties: selectedContraptionType === 'spinner' ? { angularSpeed: 2.5, axis: 'y' } : undefined,
      switchProperties: selectedContraptionType === 'switch_plate' ? { isPressed: false, outputSignalId: `sig_${Date.now()}` } : undefined,
      bellProperties: selectedContraptionType === 'target_bell' ? { hitCount: 0, lastHitTime: 0 } : undefined,
      portalProperties: selectedContraptionType === 'portal_entry' ? { linkedPortalId: '' } : undefined,
    };

    const cmd: ICommand = {
      description: `Place ${newPart.name}`,
      execute: () => {
        simEngineRef.current?.addContraptionPart(newPart);
        setContraptions([...simEngineRef.current!.contraptionParts]);
        setHasUnsavedChanges(true);
      },
      undo: () => {
        simEngineRef.current?.removeContraptionPart(newPart.id);
        setContraptions([...simEngineRef.current!.contraptionParts]);
      },
    };

    commandManagerRef.current.execute(cmd);
  };

  const handleSpawnCreature = (creature: CreatureEntity) => {
    const cmd: ICommand = {
      description: `Spawn ${creature.name}`,
      execute: () => {
        simEngineRef.current?.addCreature(creature);
        setCreatures([...simEngineRef.current!.creatures]);
        setHasUnsavedChanges(true);
      },
      undo: () => {
        simEngineRef.current?.removeCreature(creature.id);
        setCreatures([...simEngineRef.current!.creatures]);
      },
    };

    commandManagerRef.current.execute(cmd);
  };

  const handleSculptTerrainAt = (pos: THREE.Vector3, mode: 'raise' | 'lower' | 'smooth') => {
    const { width, depth } = world.bounds;
    const res = world.terrainResolution;
    const centerRx = Math.round(((pos.x + width / 2) / width) * (res - 1));
    const centerRz = Math.round(((pos.z + depth / 2) / depth) * (res - 1));

    const radius = 2;
    const prevMap = [...world.heightMap];
    const newMap = [...world.heightMap];

    for (let dz = -radius; dz <= radius; dz++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const rx = centerRx + dx;
        const rz = centerRz + dz;
        if (rx >= 0 && rx < res && rz >= 0 && rz < res) {
          const idx = rz * res + rx;
          const dist = Math.sqrt(dx * dx + dz * dz);
          const falloff = Math.max(0, 1 - dist / (radius + 0.5));
          if (mode === 'raise') newMap[idx] = Math.min(8.0, newMap[idx] + 0.4 * falloff);
          else if (mode === 'lower') newMap[idx] = Math.max(0.1, newMap[idx] - 0.4 * falloff);
        }
      }
    }

    const cmd: ICommand = {
      description: `Sculpt Terrain (${mode})`,
      execute: () => {
        world.heightMap = newMap;
        setWorld({ ...world });
        rendererRef.current?.rebuildTerrain(world);
        setHasUnsavedChanges(true);
      },
      undo: () => {
        world.heightMap = prevMap;
        setWorld({ ...world });
        rendererRef.current?.rebuildTerrain(world);
      },
    };

    commandManagerRef.current.execute(cmd);
  };

  const handleDeleteEntity = (type: 'creature' | 'contraption', id: string) => {
    if (type === 'creature') {
      const c = creatures.find(x => x.id === id);
      if (!c) return;
      const cmd: ICommand = {
        description: `Delete ${c.name}`,
        execute: () => {
          simEngineRef.current?.removeCreature(id);
          setCreatures([...simEngineRef.current!.creatures]);
          setHasUnsavedChanges(true);
        },
        undo: () => {
          simEngineRef.current?.addCreature(c);
          setCreatures([...simEngineRef.current!.creatures]);
        },
      };
      commandManagerRef.current.execute(cmd);
    } else {
      const p = contraptions.find(x => x.id === id);
      if (!p) return;
      const cmd: ICommand = {
        description: `Delete ${p.name}`,
        execute: () => {
          simEngineRef.current?.removeContraptionPart(id);
          setContraptions([...simEngineRef.current!.contraptionParts]);
          setHasUnsavedChanges(true);
        },
        undo: () => {
          simEngineRef.current?.addContraptionPart(p);
          setContraptions([...simEngineRef.current!.contraptionParts]);
        },
      };
      commandManagerRef.current.execute(cmd);
    }
  };

  const handleGenerateNewWorld = () => {
    if (confirm('Create a new procedurally generated toybox universe?')) {
      globalAudio.playDiscoveryFanfare();
      const freshWorld = generateWorld();
      const c1 = createRandomCreature(freshWorld.id, Date.now(), { x: 0, y: 3, z: 0 });
      setWorld(freshWorld);
      setCreatures([c1]);
      setContraptions([]);
      setSelectedEntity({ type: null, id: null });
    }
  };

  const handleLoadBundle = (bundle: WorldBundle) => {
    setWorld(bundle.world);
    setCreatures(bundle.creatures);
    setContraptions(bundle.contraptions);
    setSelectedEntity({ type: null, id: null });
    setHasUnsavedChanges(false);
  };

  // Selected Entities
  const selectedCreature = selectedEntity.type === 'creature' ? creatures.find(c => c.id === selectedEntity.id) || null : null;
  const selectedContraption = selectedEntity.type === 'contraption' ? contraptions.find(p => p.id === selectedEntity.id) || null : null;

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* 3D World Viewport */}
      <WorldViewport
        world={world}
        creatures={creatures}
        contraptions={contraptions}
        currentMode={currentMode}
        selectedContraptionType={selectedContraptionType}
        sculptMode={sculptMode}
        onSelectEntity={(type, id) => setSelectedEntity({ type, id })}
        onPlaceContraption={handlePlaceContraption}
        onSpawnCreatureAt={pos => handleSpawnCreature(createRandomCreature(world.id, Date.now(), { x: pos.x, y: pos.y, z: pos.z }))}
        onSculptTerrainAt={handleSculptTerrainAt}
        onDeleteEntity={handleDeleteEntity}
        rendererRef={rendererRef}
        simEngineRef={simEngineRef}
      />

      {/* Top Header Navigation */}
      <TopNavigation
        world={world}
        hasUnsavedChanges={hasUnsavedChanges}
        unlockedDiscoveriesCount={discoverySystemRef.current.getUnlockedCount()}
        totalDiscoveriesCount={discoverySystemRef.current.getTotalCount()}
        completedChallengesCount={challengeEngineRef.current.getAll().filter(c => c.isCompleted).length}
        totalChallengesCount={challengeEngineRef.current.getAll().length}
        isChaosActive={simEngineRef.current?.chaos.getActiveEffectsList().length ? true : false}
        onOpenGallery={() => setGalleryOpen(true)}
        onNewWorld={handleGenerateNewWorld}
        onSaveCheckpoint={saveCheckpoint}
        onOpenCreatureLab={() => setCreatureLabOpen(true)}
        onOpenChaos={() => setChaosOpen(true)}
        onOpenJournal={() => setJournalOpen(true)}
        onOpenTimeMachine={() => setTimeMachineOpen(true)}
        onOpenChallenges={() => setChallengesOpen(true)}
        onOpenHelp={() => setHelpOpen(true)}
      />

      {/* Tool Palette (Left) */}
      <ToolPalette
        currentMode={currentMode}
        selectedContraptionType={selectedContraptionType}
        sculptMode={sculptMode}
        canUndo={commandManagerRef.current.canUndo()}
        canRedo={commandManagerRef.current.canRedo()}
        undoDesc={commandManagerRef.current.getUndoDescription()}
        redoDesc={commandManagerRef.current.getRedoDescription()}
        onSelectMode={setCurrentMode}
        onSelectContraptionType={setSelectedContraptionType}
        onSelectSculptMode={setSculptMode}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      {/* Inspector Panel (Right) */}
      <InspectorPanel
        selectedCreature={selectedCreature}
        selectedContraption={selectedContraption}
        allContraptions={contraptions}
        onClose={() => setSelectedEntity({ type: null, id: null })}
        onFollowCreature={c => rendererRef.current?.cameraController.follow(new THREE.Vector3(c.position.x, c.position.y + 1, c.position.z))}
        onDeleteCreature={id => handleDeleteEntity('creature', id)}
        onDeleteContraption={id => handleDeleteEntity('contraption', id)}
        onUpdateContraptionProperty={(partId, updater) => {
          const p = contraptions.find(x => x.id === partId);
          if (p) {
            updater(p);
            setContraptions([...contraptions]);
            simEngineRef.current?.physics.registerPart(p);
          }
        }}
      />

      {/* Simulation Toolbar (Bottom) */}
      <SimulationToolbar
        isPaused={isPaused}
        speedMultiplier={speedMultiplier}
        dayTimeRatio={world.dayTimeRatio}
        weather={world.weather}
        onTogglePlay={togglePlay}
        onStepForward={stepSim}
        onChangeSpeed={s => {
          setSpeedMultiplier(s);
          simEngineRef.current?.setSpeed(s);
        }}
        onResetContraptions={resetContraptions}
        onFitWorld={() => rendererRef.current?.cameraController.fitToWorld()}
        onTopDownView={() => rendererRef.current?.cameraController.setTopDown()}
        onIsoView={() => rendererRef.current?.cameraController.setIsometric()}
        onPhotoMode={takePhotoSnapshot}
      />

      {/* MODALS */}
      {isCreatureLabOpen && (
        <CreatureCreatorModal
          worldId={world.id}
          onClose={() => setCreatureLabOpen(false)}
          onSpawnCreature={handleSpawnCreature}
        />
      )}

      {isChaosOpen && simEngineRef.current && (
        <ChaosEngineModal
          activeEffects={simEngineRef.current.chaos.getActiveEffectsList().map(e => e.type)}
          onActivateEffect={(type, intensity, duration) => {
            simEngineRef.current?.chaos.activateEffect(type, intensity, duration, world, simEngineRef.current.physics, creatures);
            setHasUnsavedChanges(true);
          }}
          onDeactivateEffect={type => {
            simEngineRef.current?.chaos.deactivateEffect(type, world, simEngineRef.current.physics, creatures);
          }}
          onClearAllChaos={() => {
            simEngineRef.current?.chaos.clearAll(world, simEngineRef.current.physics, creatures);
          }}
          onClose={() => setChaosOpen(false)}
        />
      )}

      {isJournalOpen && (
        <FieldJournalModal
          world={world}
          creatures={creatures}
          contraptions={contraptions}
          discoveries={discoverySystemRef.current.getAll()}
          onUpdateNotes={notes => {
            world.playerNotes = notes;
            setWorld({ ...world });
          }}
          onClose={() => setJournalOpen(false)}
        />
      )}

      {isTimeMachineOpen && (
        <TimeMachineModal
          timeMachine={timeMachineRef.current}
          onRestoreSnapshot={snapshot => {
            const data = snapshot.worldData;
            setWorld(data.world);
            setCreatures(data.creatures);
            setContraptions(data.contraptionParts);
            setWires(data.wires);
            setSelectedEntity({ type: null, id: null });
          }}
          onCreateSnapshot={(name, desc) => {
            timeMachineRef.current.createSnapshot(name, desc, world, creatures, contraptions, wires);
          }}
          onClose={() => setTimeMachineOpen(false)}
        />
      )}

      {isGalleryOpen && (
        <WorldGalleryModal
          currentWorldId={world.id}
          onLoadBundle={handleLoadBundle}
          onClose={() => setGalleryOpen(false)}
        />
      )}

      {isChallengesOpen && (
        <ChallengesModal
          challenges={challengeEngineRef.current.getAll()}
          onClose={() => setChallengesOpen(false)}
        />
      )}

      {isHelpOpen && (
        <ShortcutHelpModal onClose={() => setHelpOpen(false)} />
      )}
    </div>
  );
}

export default App;
