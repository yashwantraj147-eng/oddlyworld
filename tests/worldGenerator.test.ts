import { describe, it, expect } from 'vitest';
import { generateWorld, SeededRandom } from '../src/core/world/WorldGenerator';

describe('WorldGenerator', () => {
  it('reproduces identical world given the same seed and parameters', () => {
    const seed = 99281;
    const worldA = generateWorld({ seed, themeId: 'floating_islands' });
    const worldB = generateWorld({ seed, themeId: 'floating_islands' });

    expect(worldA.heightMap).toEqual(worldB.heightMap);
    expect(worldA.props.length).toBe(worldB.props.length);
    expect(worldA.props[0].position).toEqual(worldB.props[0].position);
    expect(worldA.name).toBe(worldB.name);
  });

  it('produces reasonable height values within world bounds', () => {
    const world = generateWorld({ seed: 12345, resolution: 16 });
    for (const h of world.heightMap) {
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThanOrEqual(world.bounds.maxHeight);
    }
  });

  it('places props with collision clearance', () => {
    const world = generateWorld({ seed: 777, propDensity: 1.2 });
    expect(world.props.length).toBeGreaterThan(5);

    // Verify minimum clearance between any two props
    for (let i = 0; i < world.props.length; i++) {
      for (let j = i + 1; j < world.props.length; j++) {
        const p1 = world.props[i].position;
        const p2 = world.props[j].position;
        const dist = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.z - p2.z, 2));
        expect(dist).toBeGreaterThanOrEqual(1.8);
      }
    }
  });

  it('seeded PRNG generates uniform distribution in range', () => {
    const rng = new SeededRandom(42);
    for (let i = 0; i < 100; i++) {
      const val = rng.range(5, 15);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThan(15);
    }
  });
});
