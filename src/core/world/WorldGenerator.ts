import { ToyboxWorld, WorldThemeId, WorldProp, Vector3D } from './WorldModel';
import { WORLD_THEMES } from './WorldThemes';

/**
 * Seeded PRNG using Mulberry32 algorithm
 */
export class SeededRandom {
  private s: number;

  constructor(seed: number) {
    this.s = Math.floor(Math.abs(seed)) || 1337;
  }

  /** Returns float in range [0, 1) */
  next(): number {
    this.s = (this.s + 0x6d2b79f5) | 0;
    let t = Math.imul(this.s ^ (this.s >>> 15), 1 | this.s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Returns float in range [min, max) */
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /** Returns integer in range [min, max] */
  rangeInt(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  /** Pick random item from array */
  choice<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
}

export interface GeneratorOptions {
  seed?: number;
  themeId?: WorldThemeId;
  name?: string;
  description?: string;
  resolution?: number; // e.g. 24 for 24x24 grid
  width?: number; // physical world size (e.g. 24)
  depth?: number; // physical world size (e.g. 24)
  islandStyle?: 'stepped_archipelago' | 'crater_lagoon' | 'plateau' | 'rolling_hills';
  propDensity?: number; // 0.5 to 2.0
}

/**
 * Procedural world generation pipeline
 */
export function generateWorld(options: GeneratorOptions = {}): ToyboxWorld {
  const seed = options.seed !== undefined ? Math.floor(options.seed) : Math.floor(Math.random() * 1000000);
  const rng = new SeededRandom(seed);

  const themeId = options.themeId || rng.choice<WorldThemeId>([
    'floating_islands',
    'clockwork_gardens',
    'enchanted_spore_valley',
    'azure_micro_lagoon',
    'crystal_caverns'
  ]);

  const themeConfig = WORLD_THEMES[themeId];
  const resolution = options.resolution || 24;
  const width = options.width || 24;
  const depth = options.depth || 24;
  const propDensity = options.propDensity || 1.0;

  // Generate heightmap
  const heightMap: number[] = new Array(resolution * resolution).fill(0);
  const halfRes = resolution / 2;

  // Frequency and amplitude
  const freq1 = rng.range(0.12, 0.22);
  const freq2 = rng.range(0.28, 0.45);
  const phaseX = rng.range(0, 100);
  const phaseZ = rng.range(0, 100);

  const waterLevel = themeId === 'azure_micro_lagoon' ? 1.6 : (themeId === 'floating_islands' ? 1.2 : 0.8);

  for (let z = 0; z < resolution; z++) {
    for (let x = 0; x < resolution; x++) {
      const idx = z * resolution + x;

      // Radial falloff so islands taper gracefully towards edges
      const dx = (x - halfRes) / halfRes;
      const dz = (z - halfRes) / halfRes;
      const distFromCenter = Math.sqrt(dx * dx + dz * dz);
      const islandFalloff = Math.max(0, 1.0 - Math.pow(distFromCenter, 2.2));

      // Layered sine harmonic waves as fast, smooth pseudo-noise
      const wave1 = Math.sin((x + phaseX) * freq1) * Math.cos((z + phaseZ) * freq1);
      const wave2 = Math.sin((x + phaseX * 1.5) * freq2 + 1.2) * Math.cos((z - phaseZ) * freq2 + 0.8) * 0.5;
      const microDetail = Math.sin((x + z) * 0.8) * 0.15;

      let h = (wave1 + wave2 + microDetail + 1.2) * 2.2 * islandFalloff;

      // Stepped terraces for cute diorama look
      if (themeId === 'floating_islands' || themeId === 'clockwork_gardens') {
        const stepSize = 0.75;
        h = Math.round(h / stepSize) * stepSize;
      }

      // Base pedestal
      h = Math.max(0.15, h);
      heightMap[idx] = parseFloat(h.toFixed(3));
    }
  }

  // Generate Scenery Props
  const props: WorldProp[] = [];
  const numProps = Math.floor(rng.range(14, 28) * propDensity);
  const minDistance = 2.0;

  function getHeightAtWorldPos(wx: number, wz: number): number {
    const rx = Math.max(0, Math.min(resolution - 1, Math.round(((wx + width / 2) / width) * (resolution - 1))));
    const rz = Math.max(0, Math.min(resolution - 1, Math.round(((wz + depth / 2) / depth) * (resolution - 1))));
    return heightMap[rz * resolution + rx] || 0;
  }

  let attempts = 0;
  while (props.length < numProps && attempts < 300) {
    attempts++;
    const wx = rng.range(-width * 0.42, width * 0.42);
    const wz = rng.range(-depth * 0.42, depth * 0.42);
    const wy = getHeightAtWorldPos(wx, wz);

    // Don't submerge props deeply underwater unless lagoon coral
    if (wy < waterLevel - 0.2 && themeId !== 'azure_micro_lagoon') continue;

    // Check distance to existing props
    const tooClose = props.some(p => {
      const ddx = p.position.x - wx;
      const ddz = p.position.z - wz;
      return Math.sqrt(ddx * ddx + ddz * ddz) < minDistance;
    });

    if (tooClose) continue;

    const propType = rng.choice(themeConfig.signatureProps);
    const scaleFactor = rng.range(0.8, 1.4);
    const rotY = rng.range(0, Math.PI * 2);

    // Select color from theme palette
    const colorHex = rng.choice(themeConfig.groundColors);

    props.push({
      id: `prop_${seed}_${props.length + 1}`,
      type: propType,
      position: { x: parseFloat(wx.toFixed(2)), y: parseFloat(wy.toFixed(2)), z: parseFloat(wz.toFixed(2)) },
      rotation: { x: 0, y: parseFloat(rotY.toFixed(2)), z: 0 },
      scale: { x: parseFloat(scaleFactor.toFixed(2)), y: parseFloat(scaleFactor.toFixed(2)), z: parseFloat(scaleFactor.toFixed(2)) },
      colorHex,
      interactive: true
    });
  }

  const generatedWorld: ToyboxWorld = {
    id: `world_${Date.now()}_${seed}`,
    name: options.name || generateWorldName(themeId, rng),
    description: options.description || themeConfig.tagline,
    version: 1,
    seed,
    themeId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    bounds: {
      width,
      depth,
      maxHeight: 12
    },
    terrainResolution: resolution,
    heightMap,
    waterLevel,
    rules: {
      gravity: { ...themeConfig.defaultGravity },
      airResistance: 0.05,
      bouncinessMultiplier: 1.0,
      timeSpeedMultiplier: 1.0,
      creatureMetabolism: 1.0,
      dayCycleDurationSeconds: 120, // 2 minutes for complete day/night loop
      allowChaosStacking: false
    },
    simulationTime: 0,
    dayTimeRatio: 0.25, // start at mid-morning
    weather: 'clear_sun',
    props,
    creatureIds: [],
    contraptionPartIds: [],
    eventLog: [
      {
        id: `ev_${Date.now()}_init`,
        timestamp: 0,
        realTime: Date.now(),
        type: 'discovery',
        title: 'Toybox Universe Unfolded',
        description: `Procedurally generated ${themeConfig.name} from seed #${seed}.`
      }
    ],
    tags: [themeConfig.name, 'Miniature Diorama'],
    playerNotes: 'A fresh, untouched pocket universe awaiting discoveries and absurd contraptions.',
    isFavorite: false
  };

  return generatedWorld;
}

function generateWorldName(themeId: WorldThemeId, rng: SeededRandom): string {
  const prefixes = {
    floating_islands: ['Cloudtop', 'Aether', 'Whispering', 'Breezy', 'Skyfall', 'Nimble', 'Zephyr'],
    clockwork_gardens: ['Brass', 'Cogsworth', 'Gilded', 'Ticktock', 'Copper', 'Steamvalve', 'Pendulum'],
    enchanted_spore_valley: ['Luminescent', 'Spore', 'Fungal', 'Twilight', 'Biolume', 'Glimmer', 'Myco'],
    azure_micro_lagoon: ['Seaglass', 'Tidepool', 'Coral', 'Sunken', 'Pebble', 'Pearlescent', 'Shallows'],
    crystal_caverns: ['Amethyst', 'Prismatic', 'Obsidian', 'Chime', 'Geode', 'Facet', 'Echoing']
  };

  const suffixes = ['Haven', 'Sanctuary', 'Atoll', 'Meadow', 'Isle', 'Terrarium', 'Grove', 'Diorama', 'Plateau'];

  const p = rng.choice(prefixes[themeId]);
  const s = rng.choice(suffixes);
  return `${p} ${s}`;
}
