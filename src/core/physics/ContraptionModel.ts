import { Vector3D } from '../world/WorldModel';

export type ContraptionPartType =
  | 'ramp'
  | 'platform'
  | 'marble'
  | 'spring'
  | 'fan'
  | 'spinner'
  | 'conveyor'
  | 'domino'
  | 'switch_plate'
  | 'launcher'
  | 'portal_entry'
  | 'portal_exit'
  | 'target_bell'
  | 'magnet';

export type MarbleMaterialType = 'glass' | 'rubber' | 'iron' | 'anti_grav';

export interface ContraptionPart {
  id: string;
  type: ContraptionPartType;
  name: string;
  position: Vector3D;
  rotation: Vector3D; // Euler angles in radians
  scale: Vector3D;
  colorHex: string;
  isStatic: boolean; // static vs dynamic body

  // Specific parameters based on part type
  marbleProperties?: {
    material: MarbleMaterialType;
    radius: number;
    bounciness: number;
    mass: number;
  };
  springProperties?: {
    impulseStrength: number;
    cooldownSeconds: number;
  };
  fanProperties?: {
    windStrength: number;
    windRange: number;
    active: boolean;
  };
  conveyorProperties?: {
    speed: number;
    direction: Vector3D;
  };
  spinnerProperties?: {
    angularSpeed: number; // radians per second
    axis: 'x' | 'y' | 'z';
  };
  switchProperties?: {
    isPressed: boolean;
    outputSignalId: string;
  };
  launcherProperties?: {
    launchForce: number;
    launchAngle: number;
    triggered: boolean;
  };
  portalProperties?: {
    linkedPortalId: string;
  };
  bellProperties?: {
    hitCount: number;
    lastHitTime: number;
  };
}

export interface SignalWire {
  id: string;
  sourcePartId: string;
  targetPartId: string;
  active: boolean;
  pulseTimeRemaining: number;
}

export interface ContraptionDesign {
  id: string;
  name: string;
  description: string;
  parts: ContraptionPart[];
  wires: SignalWire[];
  createdAt: number;
}
