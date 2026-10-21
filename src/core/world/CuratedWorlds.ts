import { ToyboxWorld } from './WorldModel';
import { generateWorld } from './WorldGenerator';
import { CreatureEntity } from '../creatures/CreatureModel';
import { createRandomCreature } from '../creatures/CreatureAnatomy';
import { ContraptionPart } from '../physics/ContraptionModel';

export interface WorldBundle {
  world: ToyboxWorld;
  creatures: CreatureEntity[];
  contraptions: ContraptionPart[];
}

export function createCuratedClockworkRube(): WorldBundle {
  const world = generateWorld({
    seed: 42077,
    themeId: 'clockwork_gardens',
    name: 'The Clockwork Rube',
    description: 'A pre-assembled Rube Goldberg marble machine ready to test and expand!',
  });

  const c1 = createRandomCreature(world.id, 101, { x: -4, y: 3, z: 2 });
  c1.name = 'Cogsworth';
  c1.speciesName = 'Clockcricket';
  c1.traits.curiosity = 0.95;
  c1.traits.playfulness = 0.9;

  const c2 = createRandomCreature(world.id, 102, { x: 4, y: 3, z: -2 });
  c2.name = 'Piston';
  c2.speciesName = 'Brasshopper';

  const contraptions: ContraptionPart[] = [
    // Elevated starting ramp
    {
      id: 'ramp_start',
      type: 'ramp',
      name: 'Launch Chute',
      position: { x: -5, y: 5.5, z: 0 },
      rotation: { x: 0, y: 0, z: -0.35 },
      scale: { x: 1.8, y: 1, z: 1.2 },
      colorHex: '#ca8a04',
      isStatic: true,
    },
    // Marble at top of ramp
    {
      id: 'golden_marble',
      type: 'marble',
      name: 'Golden Sphere',
      position: { x: -7, y: 7.2, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      colorHex: '#facc15',
      isStatic: false,
      marbleProperties: {
        material: 'iron',
        radius: 0.45,
        bounciness: 0.4,
        mass: 1.5,
      },
    },
    // Trampoline spring at the ramp drop
    {
      id: 'spring_catch',
      type: 'spring',
      name: 'Brass Bouncer',
      position: { x: -2, y: 3.2, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1.2, y: 1, z: 1.2 },
      colorHex: '#fb923c',
      isStatic: true,
      springProperties: {
        impulseStrength: 10.5,
        cooldownSeconds: 0.5,
      },
    },
    // Motorized spinner paddle
    {
      id: 'spinner_paddle',
      type: 'spinner',
      name: 'Revolving Gate',
      position: { x: 1, y: 4.8, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1.4, y: 1, z: 1 },
      colorHex: '#b45309',
      isStatic: false,
      spinnerProperties: {
        angularSpeed: 2.2,
        axis: 'y',
      },
    },
    // Pressure switch plate
    {
      id: 'pressure_plate_1',
      type: 'switch_plate',
      name: 'Trigger Pedestal',
      position: { x: 3.5, y: 3.0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1.2, y: 1, z: 1.2 },
      colorHex: '#e11d48',
      isStatic: true,
      switchProperties: {
        isPressed: false,
        outputSignalId: 'sig_1',
      },
    },
    // Target bell
    {
      id: 'target_bell_goal',
      type: 'target_bell',
      name: 'Victory Gong',
      position: { x: 6, y: 3.6, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1.2, y: 1.2, z: 1.2 },
      colorHex: '#f59e0b',
      isStatic: true,
      bellProperties: {
        hitCount: 0,
        lastHitTime: 0,
      },
    },
    // Domino sequence
    {
      id: 'domino_1',
      type: 'domino',
      name: 'Domino Alpha',
      position: { x: 4.5, y: 3.8, z: 0.2 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      colorHex: '#78350f',
      isStatic: false,
    },
    {
      id: 'domino_2',
      type: 'domino',
      name: 'Domino Beta',
      position: { x: 5.2, y: 3.8, z: 0.2 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      colorHex: '#78350f',
      isStatic: false,
    },
  ];

  return { world, creatures: [c1, c2], contraptions };
}

export function createCuratedBouncingSanctuary(): WorldBundle {
  const world = generateWorld({
    seed: 88123,
    themeId: 'floating_islands',
    name: 'Sanctuary of the Bouncing Jelly',
    description: 'Mossy stepped isles, playful jellyblobs, and trampolines in the sky.',
  });

  const c1 = createRandomCreature(world.id, 201, { x: -2, y: 3, z: -1 });
  c1.name = 'Mochi';
  c1.speciesName = 'Jellypod';
  c1.traits.playfulness = 0.95;

  const c2 = createRandomCreature(world.id, 202, { x: 2, y: 3, z: 1 });
  c2.name = 'Waffles';
  c2.speciesName = 'Pebblewobble';

  const c3 = createRandomCreature(world.id, 203, { x: 0, y: 4, z: 3 });
  c3.name = 'Pip';
  c3.speciesName = 'Glowpuff';

  const contraptions: ContraptionPart[] = [
    {
      id: 'trampoline_central',
      type: 'spring',
      name: 'Cloud Trampoline',
      position: { x: 0, y: 2.8, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1.6, y: 1, z: 1.6 },
      colorHex: '#ec4899',
      isStatic: true,
      springProperties: { impulseStrength: 14.0, cooldownSeconds: 0.4 },
    },
    {
      id: 'bouncy_ball_1',
      type: 'marble',
      name: 'Bubblegum Orb',
      position: { x: 0, y: 5.5, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1.2, y: 1.2, z: 1.2 },
      colorHex: '#f472b6',
      isStatic: false,
      marbleProperties: { material: 'rubber', radius: 0.5, bounciness: 0.95, mass: 0.6 },
    },
  ];

  return { world, creatures: [c1, c2, c3], contraptions };
}

export function createCuratedSporeValley(): WorldBundle {
  const world = generateWorld({
    seed: 55432,
    themeId: 'enchanted_spore_valley',
    name: 'Luminescent Spore Grove',
    description: 'Bioluminescent mushrooms, crystal pools, and anti-gravity orbs under twilight.',
  });

  const c1 = createRandomCreature(world.id, 301, { x: -3, y: 2.5, z: -2 });
  c1.name = 'Truffle';
  c1.speciesName = 'Sporehopper';

  const c2 = createRandomCreature(world.id, 302, { x: 3, y: 2.5, z: 2 });
  c2.name = 'Nori';
  c2.speciesName = 'Mossling';

  const contraptions: ContraptionPart[] = [
    {
      id: 'antigrav_orb',
      type: 'marble',
      name: 'Levitating Spore Gem',
      position: { x: 0, y: 4, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      colorHex: '#c084fc',
      isStatic: false,
      marbleProperties: { material: 'anti_grav', radius: 0.45, bounciness: 0.7, mass: 0.5 },
    },
    {
      id: 'portal_in',
      type: 'portal_entry',
      name: 'Spore Wormhole Alpha',
      position: { x: -3, y: 3, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1.2, y: 1.5, z: 1.2 },
      colorHex: '#9333ea',
      isStatic: true,
      portalProperties: { linkedPortalId: 'portal_out' },
    },
    {
      id: 'portal_out',
      type: 'portal_exit',
      name: 'Spore Wormhole Beta',
      position: { x: 3, y: 5, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1.2, y: 1.5, z: 1.2 },
      colorHex: '#38bdf8',
      isStatic: true,
      portalProperties: { linkedPortalId: 'portal_in' },
    },
  ];

  return { world, creatures: [c1, c2], contraptions };
}
