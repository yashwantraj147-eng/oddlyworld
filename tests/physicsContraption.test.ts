import { describe, it, expect } from 'vitest';
import { PhysicsEngine } from '../src/core/physics/PhysicsEngine';
import { ContraptionPart } from '../src/core/physics/ContraptionModel';

describe('PhysicsEngine', () => {
  it('accelerates a dropped dynamic marble downward under gravity', () => {
    const physics = new PhysicsEngine({ x: 0, y: -9.81, z: 0 });

    const marble: ContraptionPart = {
      id: 'marble_test_1',
      type: 'marble',
      name: 'Test Marble',
      position: { x: 0, y: 10, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      colorHex: '#ffffff',
      isStatic: false,
      marbleProperties: { material: 'iron', radius: 0.5, bounciness: 0.3, mass: 1 },
    };

    physics.registerPart(marble);

    // Step physics forward 0.5 seconds
    for (let i = 0; i < 30; i++) {
      physics.step(1 / 60);
    }

    const transform = physics.getPartTransform('marble_test_1');
    expect(transform).not.toBeNull();
    // Marble should have fallen down below y=10
    expect(transform!.position.y).toBeLessThan(9.5);
  });

  it('restores initial positions and stops velocities on resetToConstructionState', () => {
    const physics = new PhysicsEngine({ x: 0, y: -9.81, z: 0 });

    const marble: ContraptionPart = {
      id: 'marble_reset_test',
      type: 'marble',
      name: 'Reset Marble',
      position: { x: 2, y: 8, z: 2 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      colorHex: '#ffffff',
      isStatic: false,
    };

    physics.registerPart(marble);

    // Run simulation
    for (let i = 0; i < 20; i++) {
      physics.step(1 / 60);
    }

    // Reset
    physics.resetToConstructionState();

    const transform = physics.getPartTransform('marble_reset_test');
    expect(transform!.position.x).toBeCloseTo(2);
    expect(transform!.position.y).toBeCloseTo(8);
    expect(transform!.position.z).toBeCloseTo(2);
  });
});
