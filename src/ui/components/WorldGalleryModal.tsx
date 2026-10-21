import React, { useRef } from 'react';
import {
  X,
  FolderOpen,
  Upload,
  Download,
  Trash2,
  Copy,
  Star,
  Sparkles,
  Play
} from 'lucide-react';
import { ToyboxWorld } from '../../core/world/WorldModel';
import {
  createCuratedClockworkRube,
  createCuratedBouncingSanctuary,
  createCuratedSporeValley,
  WorldBundle
} from '../../core/world/CuratedWorlds';
import { WorldPersistence, SerializedToyboxFile } from '../../core/world/WorldPersistence';
import { globalAudio } from '../../core/audio/ProceduralAudioEngine';

interface WorldGalleryModalProps {
  currentWorldId: string;
  onLoadBundle: (bundle: WorldBundle) => void;
  onClose: () => void;
}

export const WorldGalleryModal: React.FC<WorldGalleryModalProps> = ({
  currentWorldId,
  onLoadBundle,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [savedIndex, setSavedIndex] = React.useState(() => WorldPersistence.listSavedWorlds());

  const handleLoadCurated = (type: 'rube' | 'sanctuary' | 'spore') => {
    globalAudio.playDiscoveryFanfare();
    let bundle: WorldBundle;
    if (type === 'rube') bundle = createCuratedClockworkRube();
    else if (type === 'sanctuary') bundle = createCuratedBouncingSanctuary();
    else bundle = createCuratedSporeValley();

    onLoadBundle(bundle);
    onClose();
  };

  const handleLoadSaved = (id: string) => {
    globalAudio.playClick();
    const data = WorldPersistence.loadWorldBundle(id);
    if (data) {
      onLoadBundle({ world: data.world, creatures: data.creatures, contraptions: data.contraptions });
      onClose();
    }
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this saved toybox world?')) {
      globalAudio.playClick();
      WorldPersistence.deleteWorld(id);
      setSavedIndex(WorldPersistence.listSavedWorlds());
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const text = ev.target?.result as string;
        const bundle = WorldPersistence.validateAndParseImport(text);
        globalAudio.playDiscoveryFanfare();
        onLoadBundle({ world: bundle.world, creatures: bundle.creatures, contraptions: bundle.contraptions });
        onClose();
      } catch (err) {
        alert(`Failed to import world file: ${(err as Error).message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 880, height: 600 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(0, 0, 0, 0.25)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FolderOpen size={18} color="#38bdf8" />
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#f8fafc' }}>
                Toybox World Gallery
              </h2>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>
                Explore handcrafted starter dioramas or open your saved universes.
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="file"
              ref={fileInputRef}
              accept=".oddlyworld,.json"
              style={{ display: 'none' }}
              onChange={handleImportFile}
            />
            <button className="toy-btn" onClick={() => fileInputRef.current?.click()}>
              <Upload size={13} /> Import .oddlyworld
            </button>
            <button className="toy-btn icon-only" onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Gallery Content */}
        <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* CURATED STARTER DIORAMAS */}
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
              Handcrafted Starter Dioramas
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 10 }}>
              <CuratedCard
                title="The Clockwork Rube"
                tagline="Gilded brass pathways with a working marble run & bell"
                theme="Clockwork Gardens"
                color="#ca8a04"
                onPlay={() => handleLoadCurated('rube')}
              />
              <CuratedCard
                title="Sanctuary of Bouncing Jelly"
                tagline="Aerial archipelago with water ponds and playful jellyblobs"
                theme="Floating Islands"
                color="#4ade80"
                onPlay={() => handleLoadCurated('sanctuary')}
              />
              <CuratedCard
                title="Luminescent Spore Grove"
                tagline="Twilight fungal realm with anti-gravity orbs & portals"
                theme="Enchanted Spore Valley"
                color="#c084fc"
                onPlay={() => handleLoadCurated('spore')}
              />
            </div>
          </div>

          {/* SAVED WORLDS */}
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
              Saved Pocket Universes ({savedIndex.length})
            </span>
            {savedIndex.length === 0 ? (
              <div style={{
                marginTop: 10,
                padding: 24,
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
                textAlign: 'center',
                color: '#64748b',
                fontSize: 12,
              }}>
                No saved custom worlds yet. Click "Save Checkpoint" in the top bar to record your creations!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 10 }}>
                {savedIndex.map(w => (
                  <div
                    key={w.id}
                    className="glass-panel"
                    style={{
                      padding: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: w.id === currentWorldId ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                      borderColor: w.id === currentWorldId ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>{w.name}</span>
                      <span style={{ fontSize: 10, color: '#94a3b8', textTransform: 'capitalize' }}>
                        {w.themeId.replace('_', ' ')} • {new Date(w.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="toy-btn primary"
                        style={{ padding: '4px 10px', fontSize: 11 }}
                        onClick={() => handleLoadSaved(w.id)}
                      >
                        <Play size={12} /> Open
                      </button>
                      <button
                        className="toy-btn icon-only"
                        style={{ width: 28, height: 28 }}
                        onClick={e => handleDeleteSaved(w.id, e)}
                        title="Delete World"
                      >
                        <Trash2 size={13} color="#fb7185" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CuratedCard: React.FC<{
  title: string;
  tagline: string;
  theme: string;
  color: string;
  onPlay: () => void;
}> = ({ title, tagline, theme, color, onPlay }) => (
  <div
    className="glass-panel"
    style={{
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: 12,
      borderTop: `3px solid ${color}`,
    }}
  >
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 14, fontWeight: 800, color: '#f8fafc' }}>{title}</span>
      <span style={{ fontSize: 10, color: '#38bdf8', fontWeight: 600 }}>{theme}</span>
      <p style={{ fontSize: 11, color: '#cbd5e1', lineHeight: 1.4, marginTop: 4 }}>{tagline}</p>
    </div>
    <button className="toy-btn primary" style={{ width: '100%', fontSize: 11 }} onClick={onPlay}>
      <Play size={12} /> Explore Toybox
    </button>
  </div>
);
