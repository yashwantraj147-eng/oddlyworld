import { Vector3D } from '../world/WorldModel';

export type BodyShape = 'blob' | 'pill' | 'cube' | 'pear' | 'slug' | 'star';
export type HeadStyle = 'cyclops' | 'trinocular' | 'googly' | 'snout' | 'antenna_crown' | 'beak';
export type LimbStyle = 'stubby_paws' | 'spring_foot' | 'insect_legs' | 'hover_fins' | 'crawler';
export type AccessoryStyle = 'sprout' | 'wings' | 'propeller' | 'shell' | 'horns' | 'halo' | 'none';

export interface CreatureAnatomy {
  bodyShape: BodyShape;
  headStyle: HeadStyle;
  limbStyle: LimbStyle;
  accessory: AccessoryStyle;
  primaryColor: string;
  secondaryColor: string;
  bellyColor: string;
  eyeColor: string;
  scale: number; // 0.6 to 1.8
  roughness: number;
  squishiness: number;
}

export interface CreatureTraits {
  mobility: number; // 0.0 - 1.0 (speed & agility)
  curiosity: number; // 0.0 - 1.0 (attracted to toys, contraptions, props)
  energy: number; // 0.0 - 1.0 (stamina & waking duration)
  social: number; // 0.0 - 1.0 (flocking & greeting companions)
  caution: number; // 0.0 - 1.0 (avoiding drops & fast moving objects)
  playfulness: number; // 0.0 - 1.0 (enthusiasm for kicking marbles & trampolines)
  appetite: number; // 0.0 - 1.0 (hunger depletion speed)
  preferredElevation: 'lowlands' | 'midlands' | 'peaks' | 'water';
}

export interface CreatureNeeds {
  hunger: number; // 0 = starving, 100 = full
  energy: number; // 0 = exhausted, 100 = wide awake
  fun: number; // 0 = bored, 100 = overjoyed
  social: number; // 0 = lonely, 100 = fulfilled
}

export type CreatureActionType =
  | 'idle'
  | 'exploring'
  | 'seek_toy'
  | 'playing'
  | 'eating'
  | 'socialize'
  | 'sleep'
  | 'flee'
  | 'inspect';

export interface CreatureMemory {
  id: string;
  type: 'discovered_toy' | 'enjoyed_meal' | 'made_friend' | 'bounced_high' | 'startled_by_chaos';
  description: string;
  timestamp: number;
  sentiment: 'positive' | 'neutral' | 'fear';
  location: Vector3D;
}

export interface CreatureEntity {
  id: string;
  name: string;
  speciesName: string;
  worldId: string;
  createdAt: number;
  
  // Anatomy and visuals
  anatomy: CreatureAnatomy;
  traits: CreatureTraits;

  // Spatial state
  position: Vector3D;
  velocity: Vector3D;
  heading: number; // Y-axis rotation in radians
  isGrounded: boolean;

  // AI & simulation state
  currentAction: CreatureActionType;
  actionTimer: number; // seconds left for current action
  targetEntityId: string | null;
  targetPosition: Vector3D | null;
  needs: CreatureNeeds;
  currentThought: string;
  recentEmote: 'heart' | 'bulb' | 'zzz' | 'exclamation' | 'music' | 'question' | null;
  emoteTimer: number;

  // Bounded memory (max 10 recent key experiences)
  memories: CreatureMemory[];

  // Vocal acoustics
  vocalPitch: number; // base frequency in Hz (e.g. 350 to 900 Hz)
}
