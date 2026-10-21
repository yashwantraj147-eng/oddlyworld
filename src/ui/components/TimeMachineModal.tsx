import React, { useState } from 'react';
import {
  X,
  Clock,
  GitBranch,
  Camera,
  RotateCcw,
  Plus,
  GitFork,
  BarChart2
} from 'lucide-react';
import { TimeMachine, WorldSnapshot, TimelineBranch, BranchComparisonMetrics } from '../../core/timeline/TimeMachine';
import { globalAudio } from '../../core/audio/ProceduralAudioEngine';

interface TimeMachineModalProps {
  timeMachine: TimeMachine;
  onRestoreSnapshot: (snapshot: WorldSnapshot) => void;
  onCreateSnapshot: (name: string, description: string) => void;
  onClose: () => void;
}

export const TimeMachineModal: React.FC<TimeMachineModalProps> = ({
  timeMachine,
  onRestoreSnapshot,
  onCreateSnapshot,
  onClose,
}) => {
  const [snapshotName, setSnapshotName] = useState<string>('');
  const [snapshotDesc, setSnapshotDesc] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'snapshots' | 'branches' | 'compare'>('snapshots');

  const [selectedBranchA, setSelectedBranchA] = useState<string>('branch_main');
  const [selectedBranchB, setSelectedBranchB] = useState<string>('');
  const [comparison, setComparison] = useState<BranchComparisonMetrics | null>(null);

  const snapshots = timeMachine.getAllSnapshots();
  const branches = timeMachine.getAllBranches();

  const handleCreate = () => {
    if (!snapshotName.trim()) return;
    globalAudio.playClick();
    onCreateSnapshot(snapshotName, snapshotDesc || 'Temporal world checkpoint');
    setSnapshotName('');
    setSnapshotDesc('');
  };

  const handleBranch = (snapshotId: string) => {
    globalAudio.playClick();
    const branchName = prompt('Enter a name for this alternate reality branch:', 'Alternate Branch');
    if (branchName) {
      timeMachine.branch(snapshotId, branchName);
    }
  };

  const runCompare = () => {
    if (!selectedBranchA || !selectedBranchB) return;
    const res = timeMachine.compareBranches(selectedBranchA, selectedBranchB);
    setComparison(res);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 840, height: 580 }} onClick={e => e.stopPropagation()}>
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
            <Clock size={18} color="#38bdf8" />
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#f8fafc' }}>
                Temporal Time Machine
              </h2>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>
                Preserve checkpoints, fork divergent timelines, and compare experimental outcomes.
              </span>
            </div>
          </div>
          <button className="toy-btn icon-only" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        {/* Tab Strip */}
        <div style={{
          display: 'flex',
          gap: 6,
          padding: '8px 20px',
          background: 'rgba(0, 0, 0, 0.15)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
          <button
            className={`toy-btn ${activeTab === 'snapshots' ? 'active' : ''}`}
            onClick={() => setActiveTab('snapshots')}
            style={{ fontSize: 12 }}
          >
            <Camera size={13} /> Snapshots ({snapshots.length})
          </button>
          <button
            className={`toy-btn ${activeTab === 'branches' ? 'active' : ''}`}
            onClick={() => setActiveTab('branches')}
            style={{ fontSize: 12 }}
          >
            <GitBranch size={13} /> Timeline Branches ({branches.length})
          </button>
          <button
            className={`toy-btn ${activeTab === 'compare' ? 'active' : ''}`}
            onClick={() => setActiveTab('compare')}
            style={{ fontSize: 12 }}
          >
            <BarChart2 size={13} /> Compare Realities
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
          {activeTab === 'snapshots' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Create Snapshot Form */}
              <div className="glass-panel" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8' }}>Capture New World Snapshot</span>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="text"
                    placeholder="Snapshot Title (e.g. Before Domino Cascade)"
                    value={snapshotName}
                    onChange={e => setSnapshotName(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'rgba(0, 0, 0, 0.25)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      padding: '8px 12px',
                      borderRadius: 8,
                      color: '#f8fafc',
                      fontSize: 12,
                      outline: 'none',
                    }}
                  />
                  <button className="toy-btn primary" onClick={handleCreate}>
                    <Plus size={14} /> Capture Checkpoint
                  </button>
                </div>
              </div>

              {/* Snapshots List */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {snapshots.map(s => (
                  <div key={s.id} className="glass-panel" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>{s.name}</span>
                      <span style={{ fontSize: 10, color: '#94a3b8' }}>
                        Sim: {Math.round(s.simulationTime)}s
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: '#cbd5e1' }}>{s.description}</p>
                    <div style={{ fontSize: 10, color: '#64748b' }}>
                      {new Date(s.timestamp).toLocaleTimeString()} • {s.worldData.creatures.length} creatures • {s.worldData.contraptionParts.length} parts
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button
                        className="toy-btn primary"
                        style={{ flex: 1, fontSize: 11 }}
                        onClick={() => {
                          globalAudio.playClick();
                          onRestoreSnapshot(s);
                          onClose();
                        }}
                      >
                        <RotateCcw size={12} /> Rewind to State
                      </button>
                      <button
                        className="toy-btn"
                        style={{ fontSize: 11 }}
                        onClick={() => handleBranch(s.id)}
                        title="Fork an independent branch from this moment"
                      >
                        <GitFork size={12} /> Fork Branch
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'branches' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {branches.map(b => (
                <div key={b.id} className="glass-panel" style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <GitBranch size={16} color="#34d399" />
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>{b.name}</span>
                    </div>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>
                      Created: {new Date(b.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <button
                    className="toy-btn primary"
                    style={{ fontSize: 11 }}
                    onClick={() => {
                      globalAudio.playClick();
                      onRestoreSnapshot(b.currentSnapshot);
                      onClose();
                    }}
                  >
                    Switch to This Reality
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'compare' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <select
                  value={selectedBranchA}
                  onChange={e => setSelectedBranchA(e.target.value)}
                  style={{ flex: 1, background: '#1e293b', color: '#f8fafc', padding: 8, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <span style={{ color: '#94a3b8', fontWeight: 700 }}>VS</span>
                <select
                  value={selectedBranchB}
                  onChange={e => setSelectedBranchB(e.target.value)}
                  style={{ flex: 1, background: '#1e293b', color: '#f8fafc', padding: 8, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <option value="">Select Branch B...</option>
                  {branches.filter(b => b.id !== selectedBranchA).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <button className="toy-btn primary" onClick={runCompare}>
                  Analyze Divergence
                </button>
              </div>

              {comparison && (
                <div className="glass-panel" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#38bdf8' }}>
                    Outcome Comparison: {comparison.branchAName} vs {comparison.branchBName}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    <div style={{ background: 'rgba(255,255,255,0.04)', padding: 10, borderRadius: 8 }}>
                      <span style={{ fontSize: 10, color: '#94a3b8' }}>Creatures</span>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>
                        {comparison.creatureCountA} vs {comparison.creatureCountB}
                      </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', padding: 10, borderRadius: 8 }}>
                      <span style={{ fontSize: 10, color: '#94a3b8' }}>Contraptions</span>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>
                        {comparison.contraptionCountA} vs {comparison.contraptionCountB}
                      </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', padding: 10, borderRadius: 8 }}>
                      <span style={{ fontSize: 10, color: '#94a3b8' }}>Avg Happiness</span>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#34d399', marginTop: 4 }}>
                        {comparison.averageHappinessA}% vs {comparison.averageHappinessB}%
                      </div>
                    </div>
                  </div>
                  {comparison.ruleDifferences.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b' }}>Rule Divergences:</span>
                      {comparison.ruleDifferences.map((d, i) => (
                        <div key={i} style={{ fontSize: 11, color: '#cbd5e1' }}>• {d}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
