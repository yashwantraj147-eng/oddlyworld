import React from 'react';
import {
  MousePointer,
  Wrench,
  Sparkles,
  Mountain,
  Trash2,
  Undo2,
  Redo2,
  CircleDot,
  ArrowUpRight,
  ArrowUpCircle,
  Fan,
  RotateCw,
  Bell,
  Compass,
  Square
} from 'lucide-react';
import { ContraptionPartType } from '../../core/physics/ContraptionModel';
import { globalAudio } from '../../core/audio/ProceduralAudioEngine';

export type ToolMode = 'inspect' | 'contraption' | 'creature_spawn' | 'sculpt' | 'eraser';

interface ToolPaletteProps {
  currentMode: ToolMode;
  selectedContraptionType: ContraptionPartType;
  sculptMode: 'raise' | 'lower' | 'smooth';
  canUndo: boolean;
  canRedo: boolean;
  undoDesc: string | null;
  redoDesc: string | null;
  onSelectMode: (mode: ToolMode) => void;
  onSelectContraptionType: (type: ContraptionPartType) => void;
  onSelectSculptMode: (m: 'raise' | 'lower' | 'smooth') => void;
  onUndo: () => void;
  onRedo: () => void;
}

export const ToolPalette: React.FC<ToolPaletteProps> = ({
  currentMode,
  selectedContraptionType,
  sculptMode,
  canUndo,
  canRedo,
  undoDesc,
  redoDesc,
  onSelectMode,
  onSelectContraptionType,
  onSelectSculptMode,
  onUndo,
  onRedo,
}) => {
  const contraptionParts: Array<{ type: ContraptionPartType; label: string; icon: React.ReactNode }> = [
    { type: 'marble', label: 'Marble', icon: <CircleDot size={14} /> },
    { type: 'ramp', label: 'Ramp', icon: <ArrowUpRight size={14} /> },
    { type: 'platform', label: 'Platform', icon: <Square size={14} /> },
    { type: 'spring', label: 'Trampoline', icon: <ArrowUpCircle size={14} /> },
    { type: 'spinner', label: 'Spinner', icon: <RotateCw size={14} /> },
    { type: 'fan', label: 'Fan Blower', icon: <Fan size={14} /> },
    { type: 'target_bell', label: 'Target Bell', icon: <Bell size={14} /> },
    { type: 'portal_entry', label: 'Portal', icon: <Compass size={14} /> },
  ];

  return (
    <div style={{
      position: 'absolute',
      left: 14,
      top: 80,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      zIndex: 90,
      pointerEvents: 'none',
    }}>
      {/* Primary Mode Selector */}
      <div className="glass-panel" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: 8,
        pointerEvents: 'auto',
      }}>
        <button
          className={`toy-btn icon-only ${currentMode === 'inspect' ? 'active' : ''}`}
          onClick={() => {
            globalAudio.playClick();
            onSelectMode('inspect');
          }}
          title="Inspect & Select Mode (V)"
        >
          <MousePointer size={16} />
        </button>

        <button
          className={`toy-btn icon-only ${currentMode === 'contraption' ? 'active' : ''}`}
          onClick={() => {
            globalAudio.playClick();
            onSelectMode('contraption');
          }}
          title="Contraption Physics Workshop (B)"
        >
          <Wrench size={16} />
        </button>

        <button
          className={`toy-btn icon-only ${currentMode === 'creature_spawn' ? 'active' : ''}`}
          onClick={() => {
            globalAudio.playClick();
            onSelectMode('creature_spawn');
          }}
          title="Spawn Living Creature (C)"
        >
          <Sparkles size={16} />
        </button>

        <button
          className={`toy-btn icon-only ${currentMode === 'sculpt' ? 'active' : ''}`}
          onClick={() => {
            globalAudio.playClick();
            onSelectMode('sculpt');
          }}
          title="Sculpt Terrain Brush (T)"
        >
          <Mountain size={16} />
        </button>

        <button
          className={`toy-btn icon-only ${currentMode === 'eraser' ? 'active' : ''}`}
          onClick={() => {
            globalAudio.playClick();
            onSelectMode('eraser');
          }}
          title="Eraser / Deconstruct Tool (X)"
        >
          <Trash2 size={16} color="#fb7185" />
        </button>

        <div style={{ width: '100%', height: 1, background: 'rgba(255, 255, 255, 0.1)', margin: '4px 0' }} />

        {/* Undo / Redo */}
        <button
          className="toy-btn icon-only"
          onClick={() => {
            globalAudio.playClick();
            onUndo();
          }}
          disabled={!canUndo}
          title={undoDesc ? `Undo: ${undoDesc} (Ctrl+Z)` : 'Undo (Ctrl+Z)'}
          style={{ opacity: canUndo ? 1 : 0.35 }}
        >
          <Undo2 size={15} />
        </button>

        <button
          className="toy-btn icon-only"
          onClick={() => {
            globalAudio.playClick();
            onRedo();
          }}
          disabled={!canRedo}
          title={redoDesc ? `Redo: ${redoDesc} (Ctrl+Y)` : 'Redo (Ctrl+Y)'}
          style={{ opacity: canRedo ? 1 : 0.35 }}
        >
          <Redo2 size={15} />
        </button>
      </div>

      {/* Secondary Context Palette based on Current Mode */}
      {currentMode === 'contraption' && (
        <div className="glass-panel" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          padding: '10px 8px',
          maxHeight: 320,
          overflowY: 'auto',
          pointerEvents: 'auto',
          animation: 'fadeIn 0.15s ease-out',
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textAlign: 'center', textTransform: 'uppercase' }}>
            Parts
          </span>
          {contraptionParts.map(part => (
            <button
              key={part.type}
              className={`toy-btn ${selectedContraptionType === part.type ? 'active' : ''}`}
              style={{ justifyContent: 'flex-start', padding: '6px 10px', fontSize: 11 }}
              onClick={() => {
                globalAudio.playClick();
                onSelectContraptionType(part.type);
              }}
            >
              {part.icon}
              <span>{part.label}</span>
            </button>
          ))}
        </div>
      )}

      {currentMode === 'sculpt' && (
        <div className="glass-panel" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          padding: 8,
          pointerEvents: 'auto',
          animation: 'fadeIn 0.15s ease-out',
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textAlign: 'center', textTransform: 'uppercase' }}>
            Brush
          </span>
          <button
            className={`toy-btn ${sculptMode === 'raise' ? 'active' : ''}`}
            style={{ fontSize: 11, padding: '5px 8px' }}
            onClick={() => onSelectSculptMode('raise')}
          >
            Raise Hills
          </button>
          <button
            className={`toy-btn ${sculptMode === 'lower' ? 'active' : ''}`}
            style={{ fontSize: 11, padding: '5px 8px' }}
            onClick={() => onSelectSculptMode('lower')}
          >
            Dig Basin
          </button>
          <button
            className={`toy-btn ${sculptMode === 'smooth' ? 'active' : ''}`}
            style={{ fontSize: 11, padding: '5px 8px' }}
            onClick={() => onSelectSculptMode('smooth')}
          >
            Smooth
          </button>
        </div>
      )}
    </div>
  );
};
