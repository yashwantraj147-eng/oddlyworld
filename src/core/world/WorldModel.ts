/**
 * ODDLYWORLD: Core World Data Models
 * Defines the persistent state of a miniature toybox universe.
 */

export type WorldThemeId =
  | 'floating_islands'
  | 'clockwork_gardens'
  | 'enchanted_spore_valley'
  | 'azure_micro_lagoon'
  | 'crystal_caverns';

export type WeatherType = 'clear_sun' | 'spore_bloom' | 'meteor_shower' | 'gentle_breeze' | 'cosmic_mist';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface TerrainVertex {
  x: number;
  y: number;
  z: number;
  height: number;
  biome: string;
  colorHex: string;
}

export interface WorldRules {
  gravity: Vector3D;
  airResistance: number;
  bouncinessMultiplier: number;
  timeSpeedMultiplier: number;
  creatureMetabolism: number;
  dayCycleDurationSeconds: number;
  allowChaosStacking: boolean;
}

export interface WorldProp {
  id: string;
  type: 'mushroom_tree' | 'crystal_shard' | 'gear_flower' | 'stone_spire' | 'lantern_post' | 'coral_bush' | 'toy_block';
  position: Vector3D;
  rotation: Vector3D;
  scale: Vector3D;
  colorHex: string;
  interactive: boolean;
}

export interface WorldEvent {
  id: string;
  timestamp: number; // in simulation seconds
  realTime: number; // Date.now()
  type: 'discovery' | 'creature_born' | 'machine_success' | 'chaos_activated' | 'weather_change' | 'user_action';
  title: string;
  description: string;
  icon?: string;
  metadata?: Record<string, unknown>;
}

export interface ToyboxWorld {
  id: string;
  name: string;
  description: string;
  version: number;
  seed: number;
  themeId: WorldThemeId;
  createdAt: number;
  updatedAt: number;
  
  // Dimensions
  bounds: {
    width: number;
    depth: number;
    maxHeight: number;
  };

  // Terrain grid (e.g. 24x24 height points)
  terrainResolution: number;
  heightMap: number[]; // Flat array of height points [x * resolution + z]
  waterLevel: number;

  // Rules and environment
  rules: WorldRules;
  simulationTime: number; // accumulated elapsed simulation seconds
  dayTimeRatio: number; // 0 to 1 representing 24h cycle
  weather: WeatherType;

  // Props & scenery
  props: WorldProp[];

  // Entities and contraptions are stored with their full models
  creatureIds: string[];
  contraptionPartIds: string[];

  // Event history
  eventLog: WorldEvent[];

  // User tags and notes
  tags: string[];
  playerNotes: string;
  isFavorite: boolean;
  thumbnailDataUrl?: string;
}
