import { ToyboxWorld } from '../world/WorldModel';
import { CreatureEntity } from '../creatures/CreatureModel';
import { ContraptionPart, SignalWire } from '../physics/ContraptionModel';

export interface WorldSnapshot {
  id: string;
  name: string;
  description: string;
  timestamp: number;
  simulationTime: number;
  worldData: {
    world: ToyboxWorld;
    creatures: CreatureEntity[];
    contraptionParts: ContraptionPart[];
    wires: SignalWire[];
  };
}

export interface TimelineBranch {
  id: string;
  name: string;
  parentBranchId: string | null;
  baseSnapshotId: string;
  createdAt: number;
  currentSnapshot: WorldSnapshot;
}

export interface BranchComparisonMetrics {
  branchAName: string;
  branchBName: string;
  populationDiff: number; // A - B
  creatureCountA: number;
  creatureCountB: number;
  contraptionCountA: number;
  contraptionCountB: number;
  averageHappinessA: number;
  averageHappinessB: number;
  ruleDifferences: string[];
}

export class TimeMachine {
  private snapshots: Map<string, WorldSnapshot> = new Map();
  private branches: Map<string, TimelineBranch> = new Map();
  private activeBranchId: string;

  constructor(initialSnapshot: WorldSnapshot) {
    this.snapshots.set(initialSnapshot.id, initialSnapshot);
    const mainBranch: TimelineBranch = {
      id: 'branch_main',
      name: 'Main Timeline',
      parentBranchId: null,
      baseSnapshotId: initialSnapshot.id,
      createdAt: Date.now(),
      currentSnapshot: initialSnapshot,
    };
    this.branches.set(mainBranch.id, mainBranch);
    this.activeBranchId = mainBranch.id;
  }

  public createSnapshot(
    name: string,
    description: string,
    world: ToyboxWorld,
    creatures: CreatureEntity[],
    contraptionParts: ContraptionPart[],
    wires: SignalWire[]
  ): WorldSnapshot {
    const snapshot: WorldSnapshot = {
      id: `snap_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name,
      description,
      timestamp: Date.now(),
      simulationTime: world.simulationTime,
      worldData: {
        world: JSON.parse(JSON.stringify(world)),
        creatures: JSON.parse(JSON.stringify(creatures)),
        contraptionParts: JSON.parse(JSON.stringify(contraptionParts)),
        wires: JSON.parse(JSON.stringify(wires)),
      },
    };

    this.snapshots.set(snapshot.id, snapshot);

    // Update active branch current snapshot
    const active = this.branches.get(this.activeBranchId);
    if (active) {
      active.currentSnapshot = snapshot;
    }

    return snapshot;
  }

  public branch(snapshotId: string, branchName: string): TimelineBranch | null {
    const baseSnap = this.snapshots.get(snapshotId);
    if (!baseSnap) return null;

    const newBranch: TimelineBranch = {
      id: `branch_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: branchName,
      parentBranchId: this.activeBranchId,
      baseSnapshotId: snapshotId,
      createdAt: Date.now(),
      currentSnapshot: JSON.parse(JSON.stringify(baseSnap)),
    };

    this.branches.set(newBranch.id, newBranch);
    this.activeBranchId = newBranch.id;
    return newBranch;
  }

  public switchBranch(branchId: string): WorldSnapshot | null {
    const branch = this.branches.get(branchId);
    if (!branch) return null;
    this.activeBranchId = branchId;
    return branch.currentSnapshot;
  }

  public getActiveBranch(): TimelineBranch | undefined {
    return this.branches.get(this.activeBranchId);
  }

  public getAllBranches(): TimelineBranch[] {
    return Array.from(this.branches.values());
  }

  public getAllSnapshots(): WorldSnapshot[] {
    return Array.from(this.snapshots.values());
  }

  public compareBranches(branchAId: string, branchBId: string): BranchComparisonMetrics | null {
    const bA = this.branches.get(branchAId);
    const bB = this.branches.get(branchBId);
    if (!bA || !bB) return null;

    const snapA = bA.currentSnapshot.worldData;
    const snapB = bB.currentSnapshot.worldData;

    const countA = snapA.creatures.length;
    const countB = snapB.creatures.length;

    const happyA = countA > 0 ? snapA.creatures.reduce((acc, c) => acc + c.needs.fun, 0) / countA : 0;
    const happyB = countB > 0 ? snapB.creatures.reduce((acc, c) => acc + c.needs.fun, 0) / countB : 0;

    const ruleDiffs: string[] = [];
    if (snapA.world.rules.gravity.y !== snapB.world.rules.gravity.y) {
      ruleDiffs.push(`Gravity: A (${snapA.world.rules.gravity.y}m/s²) vs B (${snapB.world.rules.gravity.y}m/s²)`);
    }
    if (snapA.world.rules.bouncinessMultiplier !== snapB.world.rules.bouncinessMultiplier) {
      ruleDiffs.push(`Bounciness: A (${snapA.world.rules.bouncinessMultiplier}x) vs B (${snapB.world.rules.bouncinessMultiplier}x)`);
    }
    if (snapA.world.weather !== snapB.world.weather) {
      ruleDiffs.push(`Weather: A (${snapA.world.weather}) vs B (${snapB.world.weather})`);
    }

    return {
      branchAName: bA.name,
      branchBName: bB.name,
      populationDiff: countA - countB,
      creatureCountA: countA,
      creatureCountB: countB,
      contraptionCountA: snapA.contraptionParts.length,
      contraptionCountB: snapB.contraptionParts.length,
      averageHappinessA: Math.round(happyA),
      averageHappinessB: Math.round(happyB),
      ruleDifferences: ruleDiffs,
    };
  }
}
