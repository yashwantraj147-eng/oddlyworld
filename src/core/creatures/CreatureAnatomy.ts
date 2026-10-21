import { CreatureAnatomy, CreatureTraits, CreatureEntity } from './CreatureModel';
import { SeededRandom } from '../world/WorldGenerator';

export const COLOR_PALETTES = [
  { name: 'Bubblegum Dream', primary: '#f472b6', secondary: '#fb7185', belly: '#fed7aa', eye: '#1e1b4b' },
  { name: 'Moss Sprout', primary: '#4ade80', secondary: '#22c55e', belly: '#bbf7d0', eye: '#064e3b' },
  { name: 'Electric Sky', primary: '#38bdf8', secondary: '#0284c7', belly: '#e0f2fe', eye: '#0f172a' },
  { name: 'Spore Lavender', primary: '#c084fc', secondary: '#9333ea', belly: '#f3e8ff', eye: '#3b0764' },
  { name: 'Honey Amber', primary: '#fbbf24', secondary: '#f59e0b', belly: '#fef3c7', eye: '#78350f' },
  { name: 'Coral Blossom', primary: '#fb7185', secondary: '#e11d48', belly: '#ffe4e6', eye: '#111827' },
  { name: 'Obsidian Opal', primary: '#334155', secondary: '#64748b', belly: '#94a3b8', eye: '#38bdf8' },
  { name: 'Sunny Citrus', primary: '#facc15', secondary: '#eab308', belly: '#fef9c3', eye: '#713f12' }
];

const SPECIES_NAMES = [
  'Jellypod',
  'Mossling',
  'Pebblewobble',
  'Sporehopper',
  'Glowpuff',
  'Bramblebum',
  'Clockcricket',
  'Snoutlet',
  'Pipgloop',
  'Trufflemunch'
];

const FIRST_NAMES = [
  'Barnaby', 'Pip', 'Mochi', 'Sprout', 'Bumble', 'Nori', 'Waffles', 'Truffle',
  'Lulu', 'Gimble', 'Pippin', 'Ziggy', 'Mallow', 'Boba', 'Pebble', 'Clover',
  'Ollie', 'Fizzy', 'Pogo', 'Kiki', 'Nimbus', 'Basil', 'Button', 'Twinkle'
];

export function createRandomCreature(worldId: string, seed: number = Date.now(), initialPos = { x: 0, y: 3, z: 0 }): CreatureEntity {
  const rng = new SeededRandom(seed);
  const palette = rng.choice(COLOR_PALETTES);

  const anatomy: CreatureAnatomy = {
    bodyShape: rng.choice(['blob', 'pill', 'cube', 'pear', 'slug', 'star']),
    headStyle: rng.choice(['cyclops', 'trinocular', 'googly', 'snout', 'antenna_crown', 'beak']),
    limbStyle: rng.choice(['stubby_paws', 'spring_foot', 'insect_legs', 'hover_fins', 'crawler']),
    accessory: rng.choice(['sprout', 'wings', 'propeller', 'shell', 'horns', 'halo', 'none']),
    primaryColor: palette.primary,
    secondaryColor: palette.secondary,
    bellyColor: palette.belly,
    eyeColor: palette.eye,
    scale: parseFloat(rng.range(0.7, 1.4).toFixed(2)),
    roughness: parseFloat(rng.range(0.2, 0.7).toFixed(2)),
    squishiness: parseFloat(rng.range(0.3, 0.9).toFixed(2))
  };

  const traits: CreatureTraits = {
    mobility: parseFloat(rng.range(0.3, 0.95).toFixed(2)),
    curiosity: parseFloat(rng.range(0.4, 0.95).toFixed(2)),
    energy: parseFloat(rng.range(0.4, 0.9).toFixed(2)),
    social: parseFloat(rng.range(0.2, 0.9).toFixed(2)),
    caution: parseFloat(rng.range(0.1, 0.75).toFixed(2)),
    playfulness: parseFloat(rng.range(0.3, 0.95).toFixed(2)),
    appetite: parseFloat(rng.range(0.4, 0.85).toFixed(2)),
    preferredElevation: rng.choice(['lowlands', 'midlands', 'peaks', 'water'])
  };

  const name = rng.choice(FIRST_NAMES);
  const species = rng.choice(SPECIES_NAMES);

  return {
    id: `creature_${Date.now()}_${rng.rangeInt(1000, 9999)}`,
    name,
    speciesName: species,
    worldId,
    createdAt: Date.now(),
    anatomy,
    traits,
    position: { ...initialPos },
    velocity: { x: 0, y: 0, z: 0 },
    heading: rng.range(0, Math.PI * 2),
    isGrounded: true,
    currentAction: 'idle',
    actionTimer: rng.range(2, 4),
    targetEntityId: null,
    targetPosition: null,
    needs: {
      hunger: rng.rangeInt(60, 90),
      energy: rng.rangeInt(70, 95),
      fun: rng.rangeInt(50, 80),
      social: rng.rangeInt(40, 75)
    },
    currentThought: `${name} gazes up at the miniature sky with wide wonder.`,
    recentEmote: null,
    emoteTimer: 0,
    memories: [
      {
        id: `mem_${Date.now()}_born`,
        type: 'discovered_toy',
        description: `Awakened into the toybox world for the very first time.`,
        timestamp: 0,
        sentiment: 'positive',
        location: { ...initialPos }
      }
    ],
    vocalPitch: rng.range(380, 850)
  };
}
