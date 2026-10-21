import { describe, it, expect } from 'vitest';
import { createRandomCreature } from '../src/core/creatures/CreatureAnatomy';
import { updateCreatureAI, CreatureAIContext } from '../src/core/creatures/CreatureAI';

describe('CreatureAI', () => {
  const dummyContext: CreatureAIContext = {
    allCreatures: [],
    toysAndMarbles: [],
    contraptions: [],
    foodSources: [],
    getHeightAt: () => 1.5,
    worldBounds: { width: 24, depth: 24 },
    simulationTime: 10,
  };

  it('triggers sleep when energy falls critically low', () => {
    const creature = createRandomCreature('test_world', 1);
    creature.needs.energy = 10; // critical exhaustion
    creature.actionTimer = 0; // force action evaluation

    updateCreatureAI(creature, 0.1, dummyContext);

    expect(creature.currentAction).toBe('sleep');
    expect(creature.recentEmote).toBe('zzz');
  });

  it('pursues food when starving and food sources exist', () => {
    const creature = createRandomCreature('test_world', 2);
    creature.needs.hunger = 15; // starving
    creature.needs.energy = 90;
    creature.actionTimer = 0;

    const ctxWithFood: CreatureAIContext = {
      ...dummyContext,
      foodSources: [
        { id: 'mushroom_1', position: { x: 3, y: 1, z: 2 }, type: 'Luminescent Cap' },
      ],
    };

    updateCreatureAI(creature, 0.1, ctxWithFood);

    expect(creature.currentAction).toBe('eating');
    expect(creature.targetEntityId).toBe('mushroom_1');
    expect(creature.memories.length).toBeGreaterThan(1);
    expect(creature.memories[0].type).toBe('enjoyed_meal');
  });

  it('clamps creature position within world bounds', () => {
    const creature = createRandomCreature('test_world', 3);
    creature.position.x = 999;
    creature.position.z = 999;

    updateCreatureAI(creature, 0.1, dummyContext);

    const maxExtent = dummyContext.worldBounds.width * 0.46;
    expect(creature.position.x).toBeLessThanOrEqual(maxExtent);
    expect(creature.position.z).toBeLessThanOrEqual(maxExtent);
  });
});
