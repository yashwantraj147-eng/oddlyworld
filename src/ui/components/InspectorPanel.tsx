import React from 'react';
import {
  X,
  Eye,
  Heart,
  Smile,
  Zap,
  Trash2,
  Sliders,
  History,
  Camera,
  Compass
} from 'lucide-react';
import { CreatureEntity } from '../../core/creatures/CreatureModel';
import { ContraptionPart } from '../../core/physics/ContraptionModel';
import { globalAudio } from '../../core/audio/ProceduralAudioEngine';

interface InspectorPanelProps {
  selectedCreature: CreatureEntity | null;
  selectedContraption: ContraptionPart | null;
  allContraptions: ContraptionPart[];
  onClose: () => void;
  onFollowCreature: (creature: CreatureEntity) => void;
  onDeleteCreature: (creatureId: string) => void;
  onDeleteContraption: (partId: string) => void;
  onUpdateContraptionProperty: (partId: string, updater: (p: ContraptionPart) => void) => void;
  onOpenCreatureLabForCreature?: (creature: CreatureEntity) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedCreature,
  selectedContraption,
  allContraptions,
  onClose,
  onFollowCreature,
  onDeleteCreature,
  onDeleteContraption,
  onUpdateContraptionProperty,
  onOpenCreatureLabForCreature,
}) => {
  if (!selectedCreature && !selectedContraption) return null;

  return (
    <aside className="glass-panel" style={{
      position: 'absolute',
      right: 14,
      top: 80,
      width: 320,
      maxHeight: 'calc(100vh - 120px)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 90,
      overflow: 'hidden',
      animation: 'fadeIn 0.15s ease-out',
    }}>
      {/* Panel Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(0, 0, 0, 0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sliders size={15} color="#38bdf8" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>
            {selectedCreature ? 'Creature Inspector' : 'Contraption Inspector'}
          </span>
        </div>
        <button
          className="toy-btn icon-only"
          style={{ width: 26, height: 26 }}
          onClick={() => {
            globalAudio.playClick();
            onClose();
          }}
        >
          <X size={14} />
        </button>
      </div>

      <div style={{ padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* CREATURE INSPECTOR */}
        {selectedCreature && (
          <>
            {/* Identity Banner */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: selectedCreature.anatomy.primaryColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 16px ${selectedCreature.anatomy.primaryColor}55`,
              }}>
                <Eye size={20} color="#ffffff" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#f8fafc' }}>
                  {selectedCreature.name}
                </span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>
                  Species: <strong style={{ color: '#38bdf8' }}>{selectedCreature.speciesName}</strong>
                </span>
              </div>
            </div>

            {/* Current Thought Bubble */}
            <div style={{
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: 12,
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                Current Activity & Thought
              </span>
              <p style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.4, fontStyle: 'italic' }}>
                "{selectedCreature.currentThought}"
              </p>
            </div>

            {/* Needs Meters */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Live Needs & Wellbeing
              </span>

              <NeedBar label="Fun & Play" value={selectedCreature.needs.fun} color="#f472b6" icon={<Smile size={12} />} />
              <NeedBar label="Energy" value={selectedCreature.needs.energy} color="#38bdf8" icon={<Zap size={12} />} />
              <NeedBar label="Hunger Satiety" value={selectedCreature.needs.hunger} color="#34d399" icon={<Heart size={12} />} />
              <NeedBar label="Social Harmony" value={selectedCreature.needs.social} color="#fbbf24" icon={<Smile size={12} />} />
            </div>

            {/* Personality Traits */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Personality Traits
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <TraitBadge label="Curiosity" value={selectedCreature.traits.curiosity} />
                <TraitBadge label="Playfulness" value={selectedCreature.traits.playfulness} />
                <TraitBadge label="Mobility" value={selectedCreature.traits.mobility} />
                <TraitBadge label="Social" value={selectedCreature.traits.social} />
              </div>
            </div>

            {/* Bounded Memories */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <History size={13} color="#94a3b8" />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Recent Memories ({selectedCreature.memories.length})
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 130, overflowY: 'auto' }}>
                {selectedCreature.memories.map(m => (
                  <div key={m.id} style={{
                    fontSize: 11,
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: '6px 8px',
                    borderRadius: 8,
                    borderLeft: `3px solid ${m.sentiment === 'positive' ? '#34d399' : '#f59e0b'}`,
                  }}>
                    {m.description}
                  </div>
                ))}
              </div>
            </div>

            {/* Creature Actions */}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                className="toy-btn primary"
                style={{ flex: 1, fontSize: 11 }}
                onClick={() => {
                  globalAudio.playClick();
                  onFollowCreature(selectedCreature);
                }}
              >
                <Camera size={13} /> Follow
              </button>
              <button
                className="toy-btn"
                style={{ padding: '6px 10px' }}
                onClick={() => {
                  globalAudio.playClick();
                  onDeleteCreature(selectedCreature.id);
                  onClose();
                }}
                title="Remove Creature"
              >
                <Trash2 size={13} color="#fb7185" />
              </button>
            </div>
          </>
        )}

        {/* CONTRAPTION INSPECTOR */}
        {selectedContraption && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: selectedContraption.colorHex || '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Compass size={18} color="#ffffff" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc' }}>
                  {selectedContraption.name}
                </span>
                <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'capitalize' }}>
                  Type: {selectedContraption.type.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Type Specific Controls */}
            {selectedContraption.type === 'marble' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>Marble Material</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['glass', 'rubber', 'iron', 'anti_grav'] as const).map(m => (
                    <button
                      key={m}
                      className={`toy-btn ${selectedContraption.marbleProperties?.material === m ? 'active' : ''}`}
                      style={{ flex: 1, fontSize: 10, padding: '4px 6px', textTransform: 'capitalize' }}
                      onClick={() => {
                        onUpdateContraptionProperty(selectedContraption.id, p => {
                          if (p.marbleProperties) p.marbleProperties.material = m;
                        });
                      }}
                    >
                      {m.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedContraption.type === 'spring' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>
                  Impulse Booster Strength ({selectedContraption.springProperties?.impulseStrength || 12}m/s)
                </span>
                <input
                  type="range"
                  min="6"
                  max="24"
                  step="1"
                  value={selectedContraption.springProperties?.impulseStrength || 12}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    onUpdateContraptionProperty(selectedContraption.id, p => {
                      if (p.springProperties) p.springProperties.impulseStrength = val;
                    });
                  }}
                  style={{ width: '100%', accentColor: '#38bdf8' }}
                />
              </div>
            )}

            {selectedContraption.type === 'target_bell' && (
              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: 10,
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b' }}>
                  Total Bell Chimes
                </span>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#fef3c7' }}>
                  {selectedContraption.bellProperties?.hitCount || 0} hits
                </span>
              </div>
            )}

            {selectedContraption.type === 'portal_entry' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>Linked Exit Portal</span>
                <select
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#f8fafc',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '6px 8px',
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                  value={selectedContraption.portalProperties?.linkedPortalId || ''}
                  onChange={e => {
                    const exitId = e.target.value;
                    onUpdateContraptionProperty(selectedContraption.id, p => {
                      if (p.portalProperties) p.portalProperties.linkedPortalId = exitId;
                    });
                  }}
                >
                  <option value="">Select Exit Portal...</option>
                  {allContraptions.filter(p => p.type === 'portal_exit').map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Position Display */}
            <div style={{
              fontSize: 11,
              color: '#94a3b8',
              fontFamily: 'monospace',
              background: 'rgba(0, 0, 0, 0.2)',
              padding: '6px 8px',
              borderRadius: 8,
            }}>
              XYZ: [{selectedContraption.position.x.toFixed(1)}, {selectedContraption.position.y.toFixed(1)}, {selectedContraption.position.z.toFixed(1)}]
            </div>

            <button
              className="toy-btn"
              style={{ color: '#fb7185', borderColor: 'rgba(251, 113, 133, 0.3)' }}
              onClick={() => {
                globalAudio.playClick();
                onDeleteContraption(selectedContraption.id);
                onClose();
              }}
            >
              <Trash2 size={13} /> Delete Component
            </button>
          </>
        )}
      </div>
    </aside>
  );
};

const NeedBar: React.FC<{ label: string; value: number; color: string; icon: React.ReactNode }> = ({ label, value, color, icon }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#cbd5e1' }}>
        {icon} {label}
      </span>
      <span style={{ fontWeight: 700, color }}>{Math.round(value)}%</span>
    </div>
    <div style={{ width: '100%', height: 6, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.3s ease-out' }} />
    </div>
  </div>
);

const TraitBadge: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div style={{
    background: 'rgba(255, 255, 255, 0.04)',
    padding: '6px 8px',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  }}>
    <span style={{ fontSize: 10, color: '#94a3b8' }}>{label}</span>
    <span style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8' }}>{Math.round(value * 100)}%</span>
  </div>
);
