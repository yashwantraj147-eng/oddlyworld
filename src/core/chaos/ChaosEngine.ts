import { ToyboxWorld, Vector3D } from '../world/WorldModel';
import { PhysicsEngine } from '../physics/PhysicsEngine';
import { CreatureEntity } from '../creatures/CreatureModel';

export type ChaosEffectType =
  | 'super_bouncy'
  | 'sideways_gravity'
  | 'spore_bloom_frenzy'
  | 'creature_hyper_curiosity'
  | 'time_dilation'
  | 'magnetic_singularity'
  | 'cosmic_meteor_shower'
  | 'size_shuffle';

export interface ActiveChaosEffect {
  type: ChaosEffectType;
  name: string;
  description: string;
  durationSeconds: number;
  timeRemaining: number;
  intensity: number; // 1 to 5
  icon: string;
  originalWorldGravity?: Vector3D;
  originalTimeSpeed?: number;
}

export class ChaosEngine {
  private activeEffects: Map<ChaosEffectType, ActiveChaosEffect> = new Map();

  public onEffectActivated?: (effect: ActiveChaosEffect) => void;
  public onEffectExpired?: (type: ChaosEffectType) => void;
  public onMeteorSpawn?: (pos: Vector3D) => void;

  public activateEffect(
    type: ChaosEffectType,
    intensity: number = 3,
    durationSeconds: number = 20,
    world: ToyboxWorld,
    physics: PhysicsEngine,
    creatures: CreatureEntity[]
  ): ActiveChaosEffect {
    // If already active, refresh duration
    if (this.activeEffects.has(type)) {
      const existing = this.activeEffects.get(type)!;
      existing.timeRemaining = durationSeconds;
      existing.intensity = intensity;
      return existing;
    }

    const effectDef = CHAOS_EFFECT_DEFINITIONS[type];
    const effect: ActiveChaosEffect = {
      type,
      name: effectDef.name,
      description: effectDef.description,
      durationSeconds,
      timeRemaining: durationSeconds,
      intensity,
      icon: effectDef.icon,
      originalWorldGravity: { ...world.rules.gravity },
      originalTimeSpeed: world.rules.timeSpeedMultiplier,
    };

    // Apply immediate world mutations
    switch (type) {
      case 'super_bouncy':
        physics.setBounciness(2.5 * (intensity / 3));
        world.rules.bouncinessMultiplier = 2.5;
        break;

      case 'sideways_gravity':
        const sidewaysG: Vector3D = { x: 9.81 * (intensity / 3), y: -2.0, z: 0 };
        physics.setGravity(sidewaysG);
        world.rules.gravity = sidewaysG;
        break;

      case 'time_dilation':
        world.rules.timeSpeedMultiplier = 0.25;
        break;

      case 'spore_bloom_frenzy':
        world.weather = 'spore_bloom';
        break;

      case 'cosmic_meteor_shower':
        world.weather = 'meteor_shower';
        break;

      case 'size_shuffle':
        creatures.forEach((c, idx) => {
          c.anatomy.scale = idx % 2 === 0 ? 1.7 : 0.6;
        });
        break;
    }

    this.activeEffects.set(type, effect);
    this.onEffectActivated?.(effect);
    return effect;
  }

  public deactivateEffect(
    type: ChaosEffectType,
    world: ToyboxWorld,
    physics: PhysicsEngine,
    creatures: CreatureEntity[]
  ): void {
    const effect = this.activeEffects.get(type);
    if (!effect) return;

    // Revert state
    switch (type) {
      case 'super_bouncy':
        physics.setBounciness(1.0);
        world.rules.bouncinessMultiplier = 1.0;
        break;

      case 'sideways_gravity':
        if (effect.originalWorldGravity) {
          physics.setGravity(effect.originalWorldGravity);
          world.rules.gravity = { ...effect.originalWorldGravity };
        }
        break;

      case 'time_dilation':
        world.rules.timeSpeedMultiplier = effect.originalTimeSpeed || 1.0;
        break;

      case 'spore_bloom_frenzy':
      case 'cosmic_meteor_shower':
        world.weather = 'clear_sun';
        break;

      case 'size_shuffle':
        creatures.forEach(c => {
          c.anatomy.scale = 1.0;
        });
        break;
    }

    this.activeEffects.delete(type);
    this.onEffectExpired?.(type);
  }

  public update(
    dt: number,
    world: ToyboxWorld,
    physics: PhysicsEngine,
    creatures: CreatureEntity[]
  ): void {
    const expired: ChaosEffectType[] = [];

    this.activeEffects.forEach((effect, type) => {
      effect.timeRemaining -= dt;

      // Ongoing effect behavior
      if (type === 'cosmic_meteor_shower' && Math.random() < 0.15) {
        // Spawn toy meteor
        const rx = (Math.random() - 0.5) * world.bounds.width * 0.7;
        const rz = (Math.random() - 0.5) * world.bounds.depth * 0.7;
        this.onMeteorSpawn?.({ x: rx, y: 10, z: rz });
      }

      if (type === 'magnetic_singularity') {
        // Apply magnetic pull toward center (0, 2, 0)
        physics.world.bodies.forEach(body => {
          if (body.type === 1 /* DYNAMIC */) {
            const dx = -body.position.x;
            const dy = 2.0 - body.position.y;
            const dz = -body.position.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.5;
            const pull = (18.0 * effect.intensity) / (dist * dist);
            body.applyForce(
              new (physics.world as any).constructor.Vec3
                ? new (physics.world.gravity.constructor as any)(dx * pull, dy * pull, dz * pull)
                : { x: dx * pull, y: dy * pull, z: dz * pull },
              body.position
            );
          }
        });
      }

      if (effect.timeRemaining <= 0) {
        expired.push(type);
      }
    });

    expired.forEach(type => this.deactivateEffect(type, world, physics, creatures));
  }

  public isEffectActive(type: ChaosEffectType): boolean {
    return this.activeEffects.has(type);
  }

  public getActiveEffectsList(): ActiveChaosEffect[] {
    return Array.from(this.activeEffects.values());
  }

  public clearAll(world: ToyboxWorld, physics: PhysicsEngine, creatures: CreatureEntity[]): void {
    const types = Array.from(this.activeEffects.keys());
    types.forEach(t => this.deactivateEffect(t, world, physics, creatures));
  }
}

export const CHAOS_EFFECT_DEFINITIONS: Record<ChaosEffectType, { name: string; description: string; icon: string }> = {
  super_bouncy: {
    name: 'Super Bouncy Universe',
    description: 'All restitution limits shattered! Every surface acts like a trampoline.',
    icon: 'Activity'
  },
  sideways_gravity: {
    name: 'Sideways Gravitational Surge',
    description: 'World gravity tilts violently, turning walls into floors and slopes into chutes.',
    icon: 'Compass'
  },
  spore_bloom_frenzy: {
    name: 'Spore Bloom Frenzy',
    description: 'Bioluminescent mushrooms erupt into iridescent cloud blossoms.',
    icon: 'Sparkles'
  },
  creature_hyper_curiosity: {
    name: 'Hyper-Curiosity Overdrive',
    description: 'All creatures drop what they are doing to frantically swarm rolling toys and machines.',
    icon: 'Eye'
  },
  time_dilation: {
    name: 'Temporal Bullet Time',
    description: 'Time slows down to 25% speed for theatrical kinematic observation.',
    icon: 'Clock'
  },
  magnetic_singularity: {
    name: 'Toybox Singularity',
    description: 'An invisible magnetic vortex pulls all loose marbles and props towards world center.',
    icon: 'Radio'
  },
  cosmic_meteor_shower: {
    name: 'Cosmic Toyfall',
    description: 'Sparkling shooting stars rain down and roll across the ground as playable marbles.',
    icon: 'Zap'
  },
  size_shuffle: {
    name: 'Giant & Micro Morph',
    description: 'Creatures randomly swell into friendly behemoths or shrink into pocket sprites.',
    icon: 'Maximize2'
  }
};
