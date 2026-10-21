import { WorldThemeId, Vector3D } from './WorldModel';

export interface WorldThemeConfig {
  id: WorldThemeId;
  name: string;
  tagline: string;
  description: string;
  groundColors: string[];
  waterColor: string;
  waterOpacity: number;
  skyColors: {
    dawn: [string, string];
    day: [string, string];
    twilight: [string, string];
    night: [string, string];
  };
  ambientLight: {
    color: string;
    intensity: number;
  };
  sunLight: {
    color: string;
    intensity: number;
  };
  defaultGravity: Vector3D;
  signatureProps: Array<'mushroom_tree' | 'crystal_shard' | 'gear_flower' | 'stone_spire' | 'lantern_post' | 'coral_bush'>;
  musicMood: 'playful' | 'mystical' | 'mechanical' | 'tranquil' | 'crystalline';
}

export const WORLD_THEMES: Record<WorldThemeId, WorldThemeConfig> = {
  floating_islands: {
    id: 'floating_islands',
    name: 'Floating Islands',
    tagline: 'Lush aerial archipelago with floating plinths and cloud waterfalls',
    description: 'Mossy stepped isles floating suspended above the clouds, dotted with bouncy mushrooms and gentle winds.',
    groundColors: ['#4ade80', '#22c55e', '#16a34a', '#86efac'],
    waterColor: '#38bdf8',
    waterOpacity: 0.6,
    skyColors: {
      dawn: ['#fed7aa', '#f472b6'],
      day: ['#bae6fd', '#38bdf8'],
      twilight: ['#c084fc', '#f43f5e'],
      night: ['#0f172a', '#1e1b4b']
    },
    ambientLight: { color: '#e0f2fe', intensity: 0.75 },
    sunLight: { color: '#fef08a', intensity: 1.2 },
    defaultGravity: { x: 0, y: -9.81, z: 0 },
    signatureProps: ['mushroom_tree', 'stone_spire', 'lantern_post'],
    musicMood: 'playful'
  },
  clockwork_gardens: {
    id: 'clockwork_gardens',
    name: 'Clockwork Gardens',
    tagline: 'Gilded brass pathways, turning cogs, and mechanical fauna',
    description: 'An intricate miniature landscape crafted from polished copper, steam-powered vents, and clicking clockwork blossoms.',
    groundColors: ['#ca8a04', '#a16207', '#78350f', '#fde047'],
    waterColor: '#0284c7',
    waterOpacity: 0.75,
    skyColors: {
      dawn: ['#fef3c7', '#fb923c'],
      day: ['#fed7aa', '#fdba74'],
      twilight: ['#ea580c', '#7c2d12'],
      night: ['#1c1917', '#292524']
    },
    ambientLight: { color: '#fed7aa', intensity: 0.7 },
    sunLight: { color: '#ffedd5', intensity: 1.3 },
    defaultGravity: { x: 0, y: -9.81, z: 0 },
    signatureProps: ['gear_flower', 'lantern_post', 'stone_spire'],
    musicMood: 'mechanical'
  },
  enchanted_spore_valley: {
    id: 'enchanted_spore_valley',
    name: 'Enchanted Spore Valley',
    tagline: 'Bioluminescent fungal kingdom of glowing spores and crystal ponds',
    description: 'A deeply magical valley under perpetual twilight where oversized mushrooms pulse with soft neon colors.',
    groundColors: ['#047857', '#065f46', '#064e3b', '#10b981'],
    waterColor: '#a855f7',
    waterOpacity: 0.7,
    skyColors: {
      dawn: ['#581c87', '#9333ea'],
      day: ['#3b0764', '#7e22ce'],
      twilight: ['#2e1065', '#6b21a8'],
      night: ['#090514', '#1e0836']
    },
    ambientLight: { color: '#c084fc', intensity: 0.8 },
    sunLight: { color: '#f472b6', intensity: 0.9 },
    defaultGravity: { x: 0, y: -7.5, z: 0 },
    signatureProps: ['mushroom_tree', 'crystal_shard', 'lantern_post'],
    musicMood: 'mystical'
  },
  azure_micro_lagoon: {
    id: 'azure_micro_lagoon',
    name: 'Azure Micro-Lagoon',
    tagline: 'Warm seaside tidepools, pearlescent shells, and turquoise shallows',
    description: 'A sunny beach terrarium where gentle waves lap against pastel sea-glass shores and anemone bouncers.',
    groundColors: ['#fef08a', '#fde047', '#eab308', '#fef9c3'],
    waterColor: '#06b6d4',
    waterOpacity: 0.55,
    skyColors: {
      dawn: ['#fbcfe8', '#f472b6'],
      day: ['#a5f3fc', '#38bdf8'],
      twilight: ['#fb923c', '#e11d48'],
      night: ['#082f49', '#0c4a6e']
    },
    ambientLight: { color: '#e0f2fe', intensity: 0.8 },
    sunLight: { color: '#fef08a', intensity: 1.3 },
    defaultGravity: { x: 0, y: -9.81, z: 0 },
    signatureProps: ['coral_bush', 'lantern_post', 'stone_spire'],
    musicMood: 'tranquil'
  },
  crystal_caverns: {
    id: 'crystal_caverns',
    name: 'Crystal Caverns',
    tagline: 'Resonant gem spires, basalt columns, and shimmering prism light',
    description: 'A subterranean geological jewel box with towering geometric crystals that ring like chimes when struck.',
    groundColors: ['#475569', '#334155', '#1e293b', '#64748b'],
    waterColor: '#ec4899',
    waterOpacity: 0.65,
    skyColors: {
      dawn: ['#1e1b4b', '#312e81'],
      day: ['#172554', '#1e3a8a'],
      twilight: ['#311042', '#4a044e'],
      night: ['#020617', '#0f172a']
    },
    ambientLight: { color: '#e2e8f0', intensity: 0.65 },
    sunLight: { color: '#fbcfe8', intensity: 1.1 },
    defaultGravity: { x: 0, y: -8.8, z: 0 },
    signatureProps: ['crystal_shard', 'stone_spire', 'lantern_post'],
    musicMood: 'crystalline'
  }
};
