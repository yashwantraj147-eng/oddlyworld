import { describe, it, expect } from 'vitest';
import { ChaosEngine } from '../src/core/chaos/ChaosEngine';
import { generateWorld } from '../src/core/world/WorldGenerator';
import { PhysicsEngine } from '../src/core/physics/PhysicsEngine';
import { createRandomCreature } from '../src/core/creatures/CreatureAnatomy';

describe('ChaosEngine', () => {
  it('activates and cleanly reverts super_bouncy world modifier', () => {
    const world = generateWorld({ seed: 100 });
    const physics = new PhysicsEngine(world.rules.gravity);
    const creatures = [createRandomCreature(world.id, 1)];
    const chaos = new ChaosEngine();

    const originalBounciness = world.rules.bouncinessMultiplier;

    // Activate
    chaos.activateEffect('super_bouncy', 3, 10, world, physics, creatures);
    expect(chaos.isEffectActive('super_bouncy')).toBe(true);
    expect(world.rules.bouncinessMultiplier).toBeGreaterThan(originalBounciness);

    // Deactivate
    chaos.deactivateEffect('super_bouncy', world, physics, creatures);
    expect(chaos.isEffectActive('super_bouncy')).toBe(false);
    expect(world.rules.bouncinessMultiplier).toBe(1.0);
  });

  it('mutates gravity on sideways_gravity and restores original on expiration', () => {
    const world = generateWorld({ seed: 200 });
    const physics = new PhysicsEngine(world.rules.gravity);
    const creatures = [createRandomCreature(world.id, 2)];
    const chaos = new ChaosEngine();

    const originalGravityY = world.rules.gravity.y;

    chaos.activateEffect('sideways_gravity', 4, 1.0, world, physics, creatures);
    expect(world.rules.gravity.x).toBeGreaterThan(5);

    // Update time past duration (1.0s)
    chaos.update(1.5, world, physics, creatures);
    expect(chaos.isEffectActive('sideways_gravity')).toBe(false);
    expect(world.rules.gravity.y).toBe(originalGravityY);
  });
});
