import React from 'react';
import { X, HelpCircle, Keyboard, Sparkles } from 'lucide-react';

interface ShortcutHelpModalProps {
  onClose: () => void;
}

export const ShortcutHelpModal: React.FC<ShortcutHelpModalProps> = ({ onClose }) => {
  const shortcuts = [
    { key: 'Space', desc: 'Toggle Simulation Play / Pause' },
    { key: '.', desc: 'Step Simulation Forward 1 Tick' },
    { key: '1 / 2 / 3', desc: 'Set Simulation Speed (1x / 2x / 5x)' },
    { key: 'R', desc: 'Reset All Contraptions to Construction State' },
    { key: 'F', desc: 'Fit & Focus Camera on World Center' },
    { key: 'Ctrl + 1', desc: 'Top-Down Tactical Camera' },
    { key: 'Ctrl + 2', desc: 'Isometric 45° Camera' },
    { key: 'P', desc: 'Photo Studio Mode Snapshot' },
    { key: 'Ctrl + C', desc: 'Open Creature Creator Lab' },
    { key: 'Ctrl + K', desc: 'Open The Chaos Engine' },
    { key: 'Ctrl + J', desc: 'Open Field Naturalist Journal' },
    { key: 'Ctrl + T', desc: 'Open Temporal Time Machine' },
    { key: 'Ctrl + G', desc: 'Open Curated Challenges' },
    { key: 'Ctrl + Z', desc: 'Undo Creative Action' },
    { key: 'Ctrl + Y', desc: 'Redo Creative Action' },
    { key: 'V / B / C / T / X', desc: 'Switch Tools (Inspect / Build / Spawn / Sculpt / Erase)' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(0, 0, 0, 0.25)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Keyboard size={18} color="#38bdf8" />
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#f8fafc' }}>
              ODDLYWORLD Controls & Shortcuts
            </h2>
          </div>
          <button className="toy-btn icon-only" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 420, overflowY: 'auto' }}>
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderRadius: 8,
                background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
              }}
            >
              <span style={{ fontSize: 12, color: '#e2e8f0' }}>{s.desc}</span>
              <kbd style={{
                fontSize: 11,
                fontFamily: 'monospace',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 6,
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}>
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
