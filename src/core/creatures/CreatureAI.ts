import { CreatureEntity, CreatureActionType, CreatureMemory } from './CreatureModel';
import { Vector3D } from '../world/WorldModel';

export interface CreatureAIContext {
  allCreatures: CreatureEntity[];
  toysAndMarbles: Array<{ id: string; position: Vector3D; name: string; isMoving: boolean }>;
  contraptions: Array<{ id: string; position: Vector3D; type: string }>;
  foodSources: Array<{ id: string; position: Vector3D; type: string }>;
  getHeightAt: (x: number, z: number) => number;
  worldBounds: { width: number; depth: number };
  simulationTime: number;
  chaosModifiers?: {
    hyperCuriosity?: boolean;
    superBouncy?: boolean;
    meteorShower?: boolean;
  };
}

/**
 * Updates a single creature's AI decisions, needs, and spatial movement
 */
export function updateCreatureAI(
  creature: CreatureEntity,
  dt: number,
  ctx: CreatureAIContext
): { actionChanged: boolean; newMemory?: CreatureMemory } {
  let actionChanged = false;
  let newMemory: CreatureMemory | undefined;

  // 1. Update Needs over time
  const hungerRate = 0.5 * creature.traits.appetite * dt;
  const energyRate = 0.4 * (1.1 - creature.traits.energy * 0.3) * dt;
  const funDecay = 0.6 * creature.traits.playfulness * dt;
  const socialDecay = 0.5 * creature.traits.social * dt;

  creature.needs.hunger = Math.max(0, creature.needs.hunger - hungerRate);
  creature.needs.energy = Math.max(0, creature.needs.energy - (creature.currentAction === 'sleep' ? -3.0 * dt : energyRate));
  creature.needs.energy = Math.min(100, creature.needs.energy);
  creature.needs.fun = Math.max(0, creature.needs.fun - funDecay);
  creature.needs.social = Math.max(0, creature.needs.social - socialDecay);

  // Emote decay
  if (creature.emoteTimer > 0) {
    creature.emoteTimer -= dt;
    if (creature.emoteTimer <= 0) {
      creature.recentEmote = null;
    }
  }

  // 2. Action timer tick
  creature.actionTimer -= dt;

  // 3. State transition when action expires or urgent need arises
  if (creature.actionTimer <= 0 || creature.currentAction === 'idle') {
    actionChanged = true;
    const nextDecision = selectNextCreatureAction(creature, ctx);
    creature.currentAction = nextDecision.action;
    creature.actionTimer = nextDecision.duration;
    creature.targetEntityId = nextDecision.targetEntityId || null;
    creature.targetPosition = nextDecision.targetPosition || null;
    creature.currentThought = nextDecision.thought;
    if (nextDecision.emote) {
      creature.recentEmote = nextDecision.emote;
      creature.emoteTimer = 3.0;
    }
    if (nextDecision.memory) {
      newMemory = nextDecision.memory;
      creature.memories.unshift(nextDecision.memory);
      if (creature.memories.length > 10) creature.memories.pop();
    }
  }

  // 4. Execute current action kinematics & steering
  executeCreatureLocomotion(creature, dt, ctx);

  return { actionChanged, newMemory };
}

interface DecisionResult {
  action: CreatureActionType;
  duration: number;
  targetEntityId?: string;
  targetPosition?: Vector3D;
  thought: string;
  emote?: 'heart' | 'bulb' | 'zzz' | 'exclamation' | 'music' | 'question';
  memory?: CreatureMemory;
}

function selectNextCreatureAction(creature: CreatureEntity, ctx: CreatureAIContext): DecisionResult {
  const { allCreatures, toysAndMarbles, foodSources, worldBounds, simulationTime, chaosModifiers } = ctx;

  // Priority 1: Exhaustion -> Sleep
  if (creature.needs.energy < 20) {
    return {
      action: 'sleep',
      duration: 8 + Math.random() * 4,
      thought: `${creature.name} is feeling drowsy and curls into a snug little nap.`,
      emote: 'zzz'
    };
  }

  // Priority 2: Chaos Event -> Flee or hyper-curiosity
  if (chaosModifiers?.hyperCuriosity && toysAndMarbles.length > 0) {
    const closestToy = getClosest(creature.position, toysAndMarbles);
    return {
      action: 'seek_toy',
      duration: 6,
      targetEntityId: closestToy.id,
      targetPosition: closestToy.position,
      thought: `${creature.name} is magnetically obsessed with the moving ${closestToy.name}!`,
      emote: 'bulb'
    };
  }

  // Priority 3: Starving -> Search for Food
  if (creature.needs.hunger < 30 && foodSources.length > 0) {
    const closestFood = getClosest(creature.position, foodSources);
    return {
      action: 'eating',
      duration: 5,
      targetEntityId: closestFood.id,
      targetPosition: closestFood.position,
      thought: `${creature.name} smells tasty spore nectar at ${closestFood.type} and scurries over to feast.`,
      emote: 'heart',
      memory: {
        id: `mem_${Date.now()}_food`,
        type: 'enjoyed_meal',
        description: `Nibbled delicious glowing snacks near ${closestFood.type}.`,
        timestamp: simulationTime,
        sentiment: 'positive',
        location: { ...closestFood.position }
      }
    };
  }

  // Priority 4: High playfulness and nearby toys -> Play!
  if (creature.traits.playfulness > 0.4 && creature.needs.fun < 60 && toysAndMarbles.length > 0) {
    const toy = getClosest(creature.position, toysAndMarbles);
    return {
      action: 'seek_toy',
      duration: 5 + Math.random() * 3,
      targetEntityId: toy.id,
      targetPosition: toy.position,
      thought: `${creature.name} spots a rolling ${toy.name} and bounds eagerly to play with it!`,
      emote: 'music',
      memory: {
        id: `mem_${Date.now()}_play`,
        type: 'discovered_toy',
        description: `Had a playful romp chasing a rolling ${toy.name}!`,
        timestamp: simulationTime,
        sentiment: 'positive',
        location: { ...toy.position }
      }
    };
  }

  // Priority 5: Social tendency -> Greet friendly neighbor
  const otherCreatures = allCreatures.filter(c => c.id !== creature.id);
  if (creature.traits.social > 0.4 && creature.needs.social < 55 && otherCreatures.length > 0) {
    const buddy = getClosest(creature.position, otherCreatures);
    const dist = distance(creature.position, buddy.position);
    if (dist < 10) {
      creature.needs.social += 30;
      return {
        action: 'socialize',
        duration: 4,
        targetEntityId: buddy.id,
        targetPosition: buddy.position,
        thought: `${creature.name} wiggles cheerfully, exchanging happy chirps with ${buddy.name}!`,
        emote: 'heart',
        memory: {
          id: `mem_${Date.now()}_friend`,
          type: 'made_friend',
          description: `Exchanged joyful chirps and bonded with ${buddy.name}.`,
          timestamp: simulationTime,
          sentiment: 'positive',
          location: { ...buddy.position }
        }
      };
    }
  }

  // Priority 6: Curiosity -> Inspect contraptions or props
  if (creature.traits.curiosity > 0.5 && Math.random() < 0.4 && ctx.contraptions.length > 0) {
    const machine = getClosest(creature.position, ctx.contraptions);
    return {
      action: 'inspect',
      duration: 4 + Math.random() * 2,
      targetEntityId: machine.id,
      targetPosition: machine.position,
      thought: `${creature.name} tilts its head, inspecting the curious ${machine.type} mechanism.`,
      emote: 'question'
    };
  }

  // Default: Explore / Wander
  const halfW = worldBounds.width * 0.38;
  const halfD = worldBounds.depth * 0.38;
  const wanderTarget: Vector3D = {
    x: (Math.random() - 0.5) * halfW * 2,
    y: 0,
    z: (Math.random() - 0.5) * halfD * 2
  };

  return {
    action: 'exploring',
    duration: 3 + Math.random() * 4,
    targetPosition: wanderTarget,
    thought: `${creature.name} ambles leisurely through the miniature terrain, soaking in the view.`
  };
}

function executeCreatureLocomotion(creature: CreatureEntity, dt: number, ctx: CreatureAIContext) {
  if (creature.currentAction === 'sleep') {
    // Sleeping creatures do not move horizontally
    creature.velocity.x *= 0.8;
    creature.velocity.z *= 0.8;
    return;
  }

  const speed = (0.8 + creature.traits.mobility * 2.2);

  if (creature.targetPosition) {
    const dx = creature.targetPosition.x - creature.position.x;
    const dz = creature.targetPosition.z - creature.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > 0.4) {
      // Rotate heading toward target smoothly
      const targetHeading = Math.atan2(dx, dz);
      let angleDiff = targetHeading - creature.heading;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      creature.heading += angleDiff * Math.min(1.0, 5.0 * dt);

      // Forward drive
      const moveX = Math.sin(creature.heading) * speed;
      const moveZ = Math.cos(creature.heading) * speed;

      creature.velocity.x = moveX;
      creature.velocity.z = moveZ;
    } else {
      creature.velocity.x *= 0.5;
      creature.velocity.z *= 0.5;
    }
  }

  // Apply position step
  creature.position.x += creature.velocity.x * dt;
  creature.position.z += creature.velocity.z * dt;

  // Clamp within world boundary
  const maxExtent = ctx.worldBounds.width * 0.46;
  creature.position.x = Math.max(-maxExtent, Math.min(maxExtent, creature.position.x));
  creature.position.z = Math.max(-maxExtent, Math.min(maxExtent, creature.position.z));

  // Snap Y to ground height with cute bounce
  const groundY = ctx.getHeightAt(creature.position.x, creature.position.z);
  creature.position.y = groundY;
}

function distance(a: Vector3D, b: Vector3D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function getClosest<T extends { position: Vector3D }>(origin: Vector3D, items: T[]): T {
  let closest = items[0];
  let minD = distance(origin, closest.position);
  for (let i = 1; i < items.length; i++) {
    const d = distance(origin, items[i].position);
    if (d < minD) {
      minD = d;
      closest = items[i];
    }
  }
  return closest;
}
