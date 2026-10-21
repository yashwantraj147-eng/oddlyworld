import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  Award,
  Layers,
  FileText,
  Download,
  Calendar,
  Lock,
  Unlock,
  Check
} from 'lucide-react';
import { ToyboxWorld } from '../../core/world/WorldModel';
import { CreatureEntity } from '../../core/creatures/CreatureModel';
import { ContraptionPart } from '../../core/physics/ContraptionModel';
import { Discovery } from '../../core/discoveries/DiscoverySystem';
import { globalAudio } from '../../core/audio/ProceduralAudioEngine';

interface FieldJournalModalProps {
  world: ToyboxWorld;
  creatures: CreatureEntity[];
  contraptions: ContraptionPart[];
  discoveries: Discovery[];
  onUpdateNotes: (notes: string) => void;
  onClose: () => void;
}

export const FieldJournalModal: React.FC<FieldJournalModalProps> = ({
  world,
  creatures,
  contraptions,
  discoveries,
  onUpdateNotes,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'dossier' | 'bestiary' | 'discoveries' | 'blueprints'>('discoveries');
  const [playerNotes, setPlayerNotes] = useState<string>(world.playerNotes || '');
  const [notesSaved, setNotesSaved] = useState<boolean>(false);

  const unlockedCount = discoveries.filter(d => d.unlocked).length;

  const handleSaveNotes = () => {
    globalAudio.playClick();
    onUpdateNotes(playerNotes);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  const handleExportMarkdown = () => {
    globalAudio.playClick();
    const md = `# ODDLYWORLD FIELD JOURNAL
**World:** ${world.name} (Seed #${world.seed})
**Theme:** ${world.themeId}
**Date Generated:** ${new Date(world.createdAt).toLocaleString()}
**Simulation Time Elapsed:** ${Math.round(world.simulationTime)} seconds

---
## 1. Naturalist Notes
${playerNotes || 'No player notes recorded.'}

---
## 2. Bestiary Catalog (${creatures.length} Creatures)
${creatures.map(c => `- **${c.name}** (${c.speciesName}): Fun ${c.needs.fun}%, Energy ${c.needs.energy}%. Thought: "${c.currentThought}"`).join('\n')}

---
## 3. Kinetic Contraptions (${contraptions.length} Components)
${contraptions.map(p => `- **${p.name}** [${p.type}] at (${p.position.x}, ${p.position.y}, ${p.position.z})`).join('\n')}

---
## 4. Discoveries Unlocked (${unlockedCount}/${discoveries.length})
${discoveries.filter(d => d.unlocked).map(d => `### ✓ ${d.title}\n*${d.description}*\n> Evidence: ${d.evidence}\n> Lore: ${d.lore}`).join('\n\n')}
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${world.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_field_journal.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 880, height: 620 }} onClick={e => e.stopPropagation()}>
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
            <BookOpen size={18} color="#38bdf8" />
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#f8fafc' }}>
                Field Naturalist Journal
              </h2>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>
                Documenting the living wonders and kinetic curiosities of {world.name}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="toy-btn" onClick={handleExportMarkdown}>
              <Download size={13} /> Export Field Report
            </button>
            <button className="toy-btn icon-only" onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: 4,
          padding: '8px 20px',
          background: 'rgba(0, 0, 0, 0.2)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
          <TabButton
            active={activeTab === 'discoveries'}
            onClick={() => setActiveTab('discoveries')}
            icon={<Award size={14} />}
            label="Discoveries"
            badge={`${unlockedCount}/${discoveries.length}`}
          />
          <TabButton
            active={activeTab === 'bestiary'}
            onClick={() => setActiveTab('bestiary')}
            icon={<Sparkles size={14} />}
            label="Bestiary"
            badge={`${creatures.length}`}
          />
          <TabButton
            active={activeTab === 'blueprints'}
            onClick={() => setActiveTab('blueprints')}
            icon={<Layers size={14} />}
            label="Contraptions"
            badge={`${contraptions.length}`}
          />
          <TabButton
            active={activeTab === 'dossier'}
            onClick={() => setActiveTab('dossier')}
            icon={<FileText size={14} />}
            label="World Dossier & Notes"
          />
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
          {/* DISCOVERIES TAB */}
          {activeTab === 'discoveries' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {discoveries.map(d => (
                <div
                  key={d.id}
                  className="glass-panel"
                  style={{
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    background: d.unlocked ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    borderColor: d.unlocked ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {d.unlocked ? <Unlock size={16} color="#34d399" /> : <Lock size={16} color="#64748b" />}
                      <span style={{ fontSize: 13, fontWeight: 700, color: d.unlocked ? '#f8fafc' : '#94a3b8' }}>
                        {d.title}
                      </span>
                    </div>
                    <span style={{
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: d.unlocked ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      color: d.unlocked ? '#34d399' : '#64748b',
                    }}>
                      {d.category}
                    </span>
                  </div>

                  <p style={{ fontSize: 11, color: '#cbd5e1', lineHeight: 1.4 }}>
                    {d.description}
                  </p>

                  {d.unlocked ? (
                    <div style={{
                      marginTop: 4,
                      padding: '6px 8px',
                      borderRadius: 6,
                      background: 'rgba(0, 0, 0, 0.25)',
                      borderLeft: '2px solid #38bdf8',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}>
                      <span style={{ fontSize: 10, color: '#38bdf8', fontStyle: 'italic' }}>
                        "{d.lore}"
                      </span>
                      <span style={{ fontSize: 10, color: '#34d399', fontWeight: 600 }}>
                        {d.rewardText}
                      </span>
                    </div>
                  ) : (
                    <span style={{ fontSize: 10, color: '#64748b', fontStyle: 'italic', marginTop: 4 }}>
                      Undiscovered — Observe the toybox and experiment with contraptions.
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* BESTIARY TAB */}
          {activeTab === 'bestiary' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {creatures.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                  No creatures currently inhabit this world. Use the Creature Lab or Tool Palette to birth life!
                </div>
              ) : (
                creatures.map(c => (
                  <div key={c.id} className="glass-panel" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: c.anatomy.primaryColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Sparkles size={16} color="#ffffff" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>{c.name}</span>
                        <span style={{ fontSize: 11, color: '#38bdf8' }}>{c.speciesName}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 11, color: '#e2e8f0', fontStyle: 'italic' }}>
                      "{c.currentThought}"
                    </p>
                    <div style={{ display: 'flex', gap: 6, fontSize: 10, color: '#94a3b8' }}>
                      <span>Body: {c.anatomy.bodyShape}</span> •
                      <span>Eyes: {c.anatomy.headStyle}</span> •
                      <span>Fun: {Math.round(c.needs.fun)}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* BLUEPRINTS TAB */}
          {activeTab === 'blueprints' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>
                Active Machine Components ({contraptions.length})
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {contraptions.map(p => (
                  <div key={p.id} className="glass-panel" style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#f8fafc' }}>{p.name}</span>
                    <span style={{ fontSize: 10, color: '#38bdf8', textTransform: 'capitalize' }}>{p.type.replace('_', ' ')}</span>
                    <span style={{ fontSize: 10, color: '#64748b' }}>
                      Coord: [{p.position.x.toFixed(1)}, {p.position.y.toFixed(1)}, {p.position.z.toFixed(1)}]
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DOSSIER & NOTES TAB */}
          {activeTab === 'dossier' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                <StatCard label="Theme" value={world.themeId.replace('_', ' ')} />
                <StatCard label="Seed" value={`#${world.seed}`} />
                <StatCard label="Sim Elapsed" value={`${Math.round(world.simulationTime)}s`} />
                <StatCard label="Weather" value={world.weather.replace('_', ' ')} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>Naturalist's Notebook</span>
                  <button className="toy-btn primary" style={{ fontSize: 11, padding: '4px 10px' }} onClick={handleSaveNotes}>
                    {notesSaved ? <Check size={12} /> : null} Save Notes
                  </button>
                </div>
                <textarea
                  value={playerNotes}
                  onChange={e => setPlayerNotes(e.target.value)}
                  placeholder="Record your scientific observations, machine recipes, and creature interactions here..."
                  style={{
                    width: '100%',
                    height: 180,
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 10,
                    padding: 12,
                    color: '#f8fafc',
                    fontFamily: 'inherit',
                    fontSize: 12,
                    lineHeight: 1.5,
                    resize: 'none',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: string }> = ({
  active,
  onClick,
  icon,
  label,
  badge,
}) => (
  <button
    className={`toy-btn ${active ? 'active' : ''}`}
    onClick={() => {
      globalAudio.playClick();
      onClick();
    }}
    style={{ fontSize: 12 }}
  >
    {icon} {label}
    {badge && (
      <span style={{
        fontSize: 10,
        padding: '1px 5px',
        borderRadius: 8,
        background: active ? '#0f172a' : 'rgba(255, 255, 255, 0.1)',
        color: active ? '#38bdf8' : '#cbd5e1',
      }}>
        {badge}
      </span>
    )}
  </button>
);

const StatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="glass-panel" style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
    <span style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase' }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc', textTransform: 'capitalize' }}>{value}</span>
  </div>
);
