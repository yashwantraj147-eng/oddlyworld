import { ToyboxWorld, WorldEvent } from '../world/WorldModel';
import { CreatureEntity } from '../creatures/CreatureModel';
import { updateCreatureAI } from '../creatures/CreatureAI';
import { ContraptionPart, SignalWire } from '../physics/ContraptionModel';
import { PhysicsEngine } from '../physics/PhysicsEngine';
import { ChaosEngine } from '../chaos/ChaosEngine';
import { DiscoverySystem } from '../discoveries/DiscoverySystem';
import { ChallengeEngine } from '../challenges/ChallengeEngine';
import { globalAudio } from '../audio/ProceduralAudioEngine';

export interface SimulationEngineOptions {
  world: ToyboxWorld;
  creatures: CreatureEntity[];
  contraptionParts: ContraptionPart[];
  wires: SignalWire[];
  discoverySystem: DiscoverySystem;
  challengeEngine: ChallengeEngine;
}

export class SimulationEngine {
  public world: ToyboxWorld;
  public creatures: CreatureEntity[];
  public contraptionParts: ContraptionPart[];
  public wires: SignalWire[];

  public physics: PhysicsEngine;
  public chaos: ChaosEngine;
  public discoveries: DiscoverySystem;
  public challenges: ChallengeEngine;

  // Simulation Clock state
  public isPaused: boolean = false;
  public speedMultiplier: number = 1.0;
  private accumulator: number = 0;
  private readonly fixedTimeStep: number = 1 / 60; // 60Hz physics & AI logic ticks

  // Event callbacks
  public onEventLogged?: (event: WorldEvent) => void;
  public onCreatureEmote?: (creature: CreatureEntity) => void;

  constructor(options: SimulationEngineOptions) {
    this.world = options.world;
    this.creatures = options.creatures;
    this.contraptionParts = options.contraptionParts;
    this.wires = options.wires;
    this.discoveries = options.discoverySystem;
    this.challenges = options.challengeEngine;

    this.physics = new PhysicsEngine(this.world.rules.gravity);
    this.chaos = new ChaosEngine();

    // Register all initial contraption parts in physics engine
    this.contraptionParts.forEach(p => this.physics.registerPart(p));
    this.physics.setWires(this.wires);

    this.setupPhysicsCallbacks();
  }

  private setupPhysicsCallbacks(): void {
    this.physics.onCollision = (ev) => {
      if (ev.impactVelocity > 1.2) {
        if (!ev.isTrigger) {
          globalAudio.playMarbleClack();
        }
      }
    };

    this.physics.onBellHit = (bellId, marbleId) => {
      globalAudio.playBellChime();
      this.logEvent('machine_success', 'Target Bell Chime!', 'A physics marble struck the target chime!');
      this.discoveries.trigger('BELL_CHIME_MASTER', 'A precision marble run struck the brass bell.');
      this.challenges.evaluateConditions(this.world, this.creatures, this.contraptionParts, this.chaos);
    };

    this.physics.onSwitchTrigger = (switchId, pressed) => {
      if (pressed) {
        globalAudio.playClick();
        this.discoveries.trigger('SIGNAL_CHAIN', 'A pressure plate fired a mechanical signal pulse.');
      }
    };

    this.physics.onPortalTeleport = (entry, exit, bodyId) => {
      globalAudio.playPortalWhoosh();
      this.discoveries.trigger('WORMHOLE_NAVIGATOR', 'An object folded space through a quantum portal.');
      this.challenges.notifyPortalTeleport();
    };

    this.chaos.onEffectActivated = (effect) => {
      this.logEvent('chaos_activated', `Chaos Unleashed: ${effect.name}`, effect.description);
      this.discoveries.trigger('CHAOS_ALCHEMIST', `Activated ${effect.name} in the Chaos Engine.`);
    };

    this.chaos.onMeteorSpawn = (pos) => {
      // Spawn a temporary playful falling toy marble
      const meteorPart: ContraptionPart = {
        id: `meteor_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        type: 'marble',
        name: 'Starlight Meteor',
        position: pos,
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 0.8, y: 0.8, z: 0.8 },
        colorHex: '#fef08a',
        isStatic: false,
        marbleProperties: {
          material: 'rubber',
          radius: 0.45,
          bounciness: 0.9,
          mass: 0.7,
        },
      };
      this.contraptionParts.push(meteorPart);
      this.physics.registerPart(meteorPart);
      this.discoveries.trigger('METEOR_CATCHER', 'A toy meteor fell from the sky and tumbled across the grass.');
    };
  }

  public update(realDeltaTimeSeconds: number): void {
    if (this.isPaused) return;

    // Apply simulation speed multiplier
    const simDt = realDeltaTimeSeconds * this.speedMultiplier * this.world.rules.timeSpeedMultiplier;
    this.accumulator += Math.min(simDt, 0.2); // avoid spiral of death on long lag spikes

    while (this.accumulator >= this.fixedTimeStep) {
      this.stepFixed(this.fixedTimeStep);
      this.accumulator -= this.fixedTimeStep;
    }
  }

  public stepFixed(dt: number): void {
    this.world.simulationTime += dt;

    // Advance Day/Night Cycle
    const cycleDuration = this.world.rules.dayCycleDurationSeconds || 120;
    this.world.dayTimeRatio = (this.world.dayTimeRatio + dt / cycleDuration) % 1.0;

    if (this.world.dayTimeRatio > 0.8 && this.world.dayTimeRatio < 0.85) {
      this.discoveries.trigger('MIDNIGHT_WONDER', 'Observed the toybox in deep midnight.');
    }

    // Step Chaos Engine
    this.chaos.update(dt, this.world, this.physics, this.creatures);

    // Step Physics Engine
    this.physics.step(dt);

    // Build context for Creature AI
    const marbleObjects = this.contraptionParts
      .filter(p => p.type === 'marble')
      .map(p => ({
        id: p.id,
        position: { ...p.position },
        name: p.name,
        isMoving: true,
      }));

    const machineObjects = this.contraptionParts
      .filter(p => p.type !== 'marble')
      .map(p => ({
        id: p.id,
        position: { ...p.position },
        type: p.name,
      }));

    const foodObjects = this.world.props
      .filter(p => p.type === 'mushroom_tree' || p.type === 'gear_flower')
      .map(p => ({
        id: p.id,
        position: { ...p.position },
        type: p.type === 'mushroom_tree' ? 'Nectar Mushroom' : 'Mechanical Blossom',
      }));

    const aiContext = {
      allCreatures: this.creatures,
      toysAndMarbles: marbleObjects,
      contraptions: machineObjects,
      foodSources: foodObjects,
      getHeightAt: (x: number, z: number) => this.getHeightAtWorld(x, z),
      worldBounds: { width: this.world.bounds.width, depth: this.world.bounds.depth },
      simulationTime: this.world.simulationTime,
      chaosModifiers: {
        hyperCuriosity: this.chaos.isEffectActive('creature_hyper_curiosity'),
        superBouncy: this.chaos.isEffectActive('super_bouncy'),
        meteorShower: this.chaos.isEffectActive('cosmic_meteor_shower'),
      },
    };

    // Update each creature
    for (const creature of this.creatures) {
      const result = updateCreatureAI(creature, dt, aiContext);
      if (result.actionChanged && creature.recentEmote) {
        this.onCreatureEmote?.(creature);
      }
      if (result.newMemory) {
        if (result.newMemory.type === 'made_friend') {
          this.discoveries.trigger('FIRST_BOND', 'Two autonomous creatures met and bonded.');
        } else if (result.newMemory.type === 'discovered_toy') {
          this.discoveries.trigger('PLAYFUL_PURSUIT', 'A creature playfully bounded after a rolling marble.');
        }
      }
    }

    if (this.creatures.length >= 5) {
      this.discoveries.trigger('THRIVING_COMMUNITY', '5 thriving creatures inhabited the toybox.');
    }

    if (this.contraptionParts.length >= 8) {
      this.discoveries.trigger('ARCHITECT_MAJESTY', 'Constructed a kinetic contraption with 8+ components.');
    }

    // Evaluate Challenges
    this.challenges.evaluateConditions(this.world, this.creatures, this.contraptionParts, this.chaos);
  }

  public stepOnce(): void {
    this.stepFixed(this.fixedTimeStep);
  }

  public togglePause(): boolean {
    this.isPaused = !this.isPaused;
    return this.isPaused;
  }

  public setSpeed(speed: number): void {
    this.speedMultiplier = Math.max(0.1, Math.min(10.0, speed));
  }

  public addCreature(creature: CreatureEntity): void {
    this.creatures.push(creature);
    this.logEvent('creature_born', `${creature.name} Arrived!`, `A new ${creature.speciesName} entered the world.`);
    globalAudio.playCreatureChirp(creature.vocalPitch, 'happy');
  }

  public removeCreature(id: string): void {
    const idx = this.creatures.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.creatures.splice(idx, 1);
    }
  }

  public addContraptionPart(part: ContraptionPart): void {
    this.contraptionParts.push(part);
    this.physics.registerPart(part);
    globalAudio.playClick();
    if (part.type === 'marble') {
      this.discoveries.trigger('FIRST_KINETIC_ROLL', 'Placed and rolled a physics marble.');
    }
  }

  public removeContraptionPart(partId: string): void {
    const idx = this.contraptionParts.findIndex(p => p.id === partId);
    if (idx !== -1) {
      this.contraptionParts.splice(idx, 1);
      this.physics.removeBody(partId);
    }
  }

  public resetContraptions(): void {
    this.physics.resetToConstructionState();
    globalAudio.playClick();
    this.logEvent('user_action', 'Contraptions Reset', 'All machine components returned to their construction origins.');
  }

  public getHeightAtWorld(wx: number, wz: number): number {
    const { width, depth } = this.world.bounds;
    const res = this.world.terrainResolution;
    const rx = Math.max(0, Math.min(res - 1, Math.round(((wx + width / 2) / width) * (res - 1))));
    const rz = Math.max(0, Math.min(res - 1, Math.round(((wz + depth / 2) / depth) * (res - 1))));
    return this.world.heightMap[rz * res + rx] || 0;
  }

  public logEvent(type: WorldEvent['type'], title: string, description: string): void {
    const ev: WorldEvent = {
      id: `ev_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: Math.round(this.world.simulationTime),
      realTime: Date.now(),
      type,
      title,
      description,
    };
    this.world.eventLog.unshift(ev);
    if (this.world.eventLog.length > 50) this.world.eventLog.pop();
    this.onEventLogged?.(ev);
  }
}
