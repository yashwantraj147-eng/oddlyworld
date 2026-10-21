import { ToyboxWorld } from './WorldModel';
import { CreatureEntity } from '../creatures/CreatureModel';
import { ContraptionPart, SignalWire } from '../physics/ContraptionModel';

export interface SerializedToyboxFile {
  app: 'ODDLYWORLD';
  fileVersion: number;
  exportedAt: number;
  world: ToyboxWorld;
  creatures: CreatureEntity[];
  contraptions: ContraptionPart[];
  wires: SignalWire[];
}

const STORAGE_PREFIX = 'oddlyworld_save_';
const WORLD_INDEX_KEY = 'oddlyworld_world_index';

export class WorldPersistence {
  public static saveWorldBundle(
    world: ToyboxWorld,
    creatures: CreatureEntity[],
    contraptions: ContraptionPart[],
    wires: SignalWire[] = []
  ): void {
    world.updatedAt = Date.now();
    const data: SerializedToyboxFile = {
      app: 'ODDLYWORLD',
      fileVersion: 1,
      exportedAt: Date.now(),
      world,
      creatures,
      contraptions,
      wires,
    };

    try {
      localStorage.setItem(`${STORAGE_PREFIX}${world.id}`, JSON.stringify(data));
      this.updateIndex(world);
    } catch (err) {
      console.error('Failed to save world to localStorage:', err);
    }
  }

  public static loadWorldBundle(worldId: string): SerializedToyboxFile | null {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${worldId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as SerializedToyboxFile;
      return parsed;
    } catch (err) {
      console.error('Failed to load world bundle:', err);
      return null;
    }
  }

  public static deleteWorld(worldId: string): void {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${worldId}`);
      const index = this.listSavedWorlds();
      const updated = index.filter(w => w.id !== worldId);
      localStorage.setItem(WORLD_INDEX_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to delete world:', err);
    }
  }

  public static listSavedWorlds(): Array<{ id: string; name: string; themeId: string; updatedAt: number; isFavorite: boolean }> {
    try {
      const raw = localStorage.getItem(WORLD_INDEX_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private static updateIndex(world: ToyboxWorld): void {
    const list = this.listSavedWorlds();
    const existingIdx = list.findIndex(w => w.id === world.id);
    const item = {
      id: world.id,
      name: world.name,
      themeId: world.themeId,
      updatedAt: world.updatedAt,
      isFavorite: world.isFavorite,
    };
    if (existingIdx !== -1) {
      list[existingIdx] = item;
    } else {
      list.unshift(item);
    }
    localStorage.setItem(WORLD_INDEX_KEY, JSON.stringify(list));
  }

  public static exportToFile(world: ToyboxWorld, creatures: CreatureEntity[], contraptions: ContraptionPart[], wires: SignalWire[] = []): void {
    const bundle: SerializedToyboxFile = {
      app: 'ODDLYWORLD',
      fileVersion: 1,
      exportedAt: Date.now(),
      world,
      creatures,
      contraptions,
      wires,
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${world.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.oddlyworld`;
    a.click();
    URL.revokeObjectURL(url);
  }

  public static validateAndParseImport(jsonString: string): SerializedToyboxFile {
    const data = JSON.parse(jsonString);
    if (!data || data.app !== 'ODDLYWORLD') {
      throw new Error('Invalid ODDLYWORLD world file format');
    }
    if (!data.world || !data.world.id || !data.world.themeId) {
      throw new Error('Corrupt world metadata in imported file');
    }
    return data as SerializedToyboxFile;
  }
}
