import React from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Sun,
  Moon,
  Camera,
  Maximize2,
  Compass,
  Layers
} from 'lucide-react';
import { globalAudio } from '../../core/audio/ProceduralAudioEngine';

interface SimulationToolbarProps {
  isPaused: boolean;
  speedMultiplier: number;
  dayTimeRatio: number; // 0 to 1
  weather: string;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onChangeSpeed: (speed: number) => void;
  onResetContraptions: () => void;
  onFitWorld: () => void;
  onTopDownView: () => void;
  onIsoView: () => void;
  onPhotoMode: () => void;
}

export const SimulationToolbar: React.FC<SimulationToolbarProps> = ({
  isPaused,
  speedMultiplier,
  dayTimeRatio,
  weather,
  onTogglePlay,
  onStepForward,
  onChangeSpeed,
  onResetContraptions,
  onFitWorld,
  onTopDownView,
  onIsoView,
  onPhotoMode,
}) => {
  // Day phase
  const isNight = dayTimeRatio > 0.65 || dayTimeRatio < 0.1;
  const isTwilight = (dayTimeRatio >= 0.5 && dayTimeRatio <= 0.65) || (dayTimeRatio >= 0.1 && dayTimeRatio <= 0.2);

  return (
    <div style={{
      position: 'absolute',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      zIndex: 100,
      pointerEvents: 'none',
    }}>
      {/* Simulation Playback Strip */}
      <div className="glass-panel" style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        pointerEvents: 'auto',
      }}>
        {/* Play/Pause */}
        <button
          className={`toy-btn icon-only ${!isPaused ? 'primary' : ''}`}
          onClick={() => {
            globalAudio.playClick();
            onTogglePlay();
          }}
          title={isPaused ? 'Resume Simulation (Space)' : 'Pause Simulation (Space)'}
        >
          {isPaused ? <Play size={16} fill="#ffffff" /> : <Pause size={16} fill="#ffffff" />}
        </button>

        {/* Step Forward */}
        <button
          className="toy-btn icon-only"
          onClick={() => {
            globalAudio.playClick();
            onStepForward();
          }}
          title="Step Forward 1 Tick (.)"
          disabled={!isPaused}
          style={{ opacity: isPaused ? 1 : 0.4 }}
        >
          <SkipForward size={14} />
        </button>

        {/* Speed Multipliers */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(0, 0, 0, 0.25)', padding: 3, borderRadius: 999 }}>
          {[0.5, 1.0, 2.0, 5.0].map(s => (
            <button
              key={s}
              className={`toy-btn ${speedMultiplier === s ? 'active' : ''}`}
              style={{
                padding: '3px 8px',
                fontSize: 11,
                borderRadius: 999,
                background: speedMultiplier === s ? '#38bdf8' : 'transparent',
                color: speedMultiplier === s ? '#0f172a' : '#94a3b8',
                border: 'none',
                boxShadow: 'none',
              }}
              onClick={() => {
                globalAudio.playClick();
                onChangeSpeed(s);
              }}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Reset Contraptions to Initial Construction State */}
        <button
          className="toy-btn"
          onClick={onResetContraptions}
          title="Reset Contraptions & Marbles to Start Positions (R)"
          style={{ padding: '6px 12px', fontSize: 12 }}
        >
          <RotateCcw size={13} color="#f59e0b" /> Reset Rube
        </button>
      </div>

      {/* Environmental Time & Weather Pill */}
      <div className="glass-panel" style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 14px',
        pointerEvents: 'auto',
      }}>
        {isNight ? (
          <Moon size={15} color="#c084fc" />
        ) : isTwilight ? (
          <Sun size={15} color="#fb923c" />
        ) : (
          <Sun size={15} color="#fde047" />
        )}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#f8fafc' }}>
            {isNight ? 'Midnight Stars' : isTwilight ? 'Twilight Glow' : 'Warm Midday'}
          </span>
          <span style={{ fontSize: 9, color: '#94a3b8', textTransform: 'capitalize' }}>
            {weather.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Camera Presets & Photo Studio */}
      <div className="glass-panel" style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        pointerEvents: 'auto',
      }}>
        <button
          className="toy-btn icon-only"
          onClick={() => {
            globalAudio.playClick();
            onFitWorld();
          }}
          title="Focus & Fit World to Screen (F)"
        >
          <Maximize2 size={14} />
        </button>
        <button
          className="toy-btn icon-only"
          onClick={() => {
            globalAudio.playClick();
            onIsoView();
          }}
          title="Isometric View (Ctrl+2)"
        >
          <Compass size={14} />
        </button>
        <button
          className="toy-btn icon-only"
          onClick={() => {
            globalAudio.playClick();
            onTopDownView();
          }}
          title="Top-Down Tactical View (Ctrl+1)"
        >
          <Layers size={14} />
        </button>
        <button
          className="toy-btn icon-only"
          onClick={() => {
            globalAudio.playClick();
            onPhotoMode();
          }}
          title="Photo Studio Snapshot (P)"
        >
          <Camera size={14} color="#f472b6" />
        </button>
      </div>
    </div>
  );
};
