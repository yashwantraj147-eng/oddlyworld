import React, { useState } from 'react';
import {
  X,
  Compass,
  Sparkles,
  Zap,
  Activity,
  Clock,
  Radio,
  Eye,
  RotateCcw,
  Maximize2
} from 'lucide-react';
import { ChaosEffectType, CHAOS_EFFECT_DEFINITIONS } from '../../core/chaos/ChaosEngine';
import { globalAudio } from '../../core/audio/ProceduralAudioEngine';

interface ChaosEngineModalProps {
  activeEffects: string[];
  onActivateEffect: (type: ChaosEffectType, intensity: number, durationSeconds: number) => void;
  onDeactivateEffect: (type: ChaosEffectType) => void;
  onClearAllChaos: () => void;
  onClose: () => void;
}

export const ChaosEngineModal: React.FC<ChaosEngineModalProps> = ({
  activeEffects,
  onActivateEffect,
  onDeactivateEffect,
  onClearAllChaos,
  onClose,
}) => {
  const [intensity, setIntensity] = useState<number>(3);
  const [duration, setDuration] = useState<number>(25);

  const effectKeys = Object.keys(CHAOS_EFFECT_DEFINITIONS) as ChaosEffectType[];

  const getIcon = (type: ChaosEffectType) => {
    switch (type) {
      case 'super_bouncy': return <Activity size={18} color="#f472b6" />;
      case 'sideways_gravity': return <Compass size={18} color="#38bdf8" />;
      case 'spore_bloom_frenzy': return <Sparkles size={18} color="#c084fc" />;
      case 'creature_hyper_curiosity': return <Eye size={18} color="#34d399" />;
      case 'time_dilation': return <Clock size={18} color="#fbbf24" />;
      case 'magnetic_singularity': return <Radio size={18} color="#fb7185" />;
      case 'cosmic_meteor_shower': return <Zap size={18} color="#fef08a" />;
      case 'size_shuffle': return <Maximize2 size={18} color="#60a5fa" />;
    }
  };

  const applyPreset = (name: string) => {
    globalAudio.playClick();
    onClearAllChaos();
    if (name === 'madhouse') {
      onActivateEffect('super_bouncy', 4, 30);
      onActivateEffect('sideways_gravity', 3, 30);
    } else if (name === 'slumber') {
      onActivateEffect('time_dilation', 4, 30);
      onActivateEffect('spore_bloom_frenzy', 3, 30);
    } else if (name === 'singularity') {
      onActivateEffect('magnetic_singularity', 4, 30);
      onActivateEffect('creature_hyper_curiosity', 5, 30);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 840 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(135deg, rgba(219, 39, 119, 0.15), rgba(147, 51, 234, 0.15))',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Compass size={20} color="#ec4899" />
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#f8fafc' }}>
                The Chaos Engine
              </h2>
              <p style={{ fontSize: 11, color: '#94a3b8' }}>
                Alter the physical and environmental laws of your pocket universe.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="toy-btn"
              onClick={() => {
                globalAudio.playClick();
                onClearAllChaos();
              }}
              style={{ color: '#fb7185', borderColor: 'rgba(251, 113, 133, 0.3)' }}
            >
              <RotateCcw size={13} /> Restore Normal Physics
            </button>
            <button className="toy-btn icon-only" onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Global Controls & Presets */}
        <div style={{
          padding: '14px 20px',
          background: 'rgba(0, 0, 0, 0.25)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Intensity & Duration */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>Chaos Intensity:</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4, 5].map(lvl => (
                  <button
                    key={lvl}
                    className={`toy-btn ${intensity === lvl ? 'active' : ''}`}
                    style={{ padding: '3px 8px', fontSize: 11 }}
                    onClick={() => setIntensity(lvl)}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>Duration:</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {[15, 30, 60].map(sec => (
                  <button
                    key={sec}
                    className={`toy-btn ${duration === sec ? 'active' : ''}`}
                    style={{ padding: '3px 8px', fontSize: 11 }}
                    onClick={() => setDuration(sec)}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>Presets:</span>
            <button className="toy-btn" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => applyPreset('madhouse')}>
              Madhouse
            </button>
            <button className="toy-btn" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => applyPreset('slumber')}>
              Bullet Slumber
            </button>
            <button className="toy-btn" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => applyPreset('singularity')}>
              Singularity
            </button>
          </div>
        </div>

        {/* Chaos Cards Grid */}
        <div style={{
          padding: 20,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
          overflowY: 'auto',
          maxHeight: 420,
        }}>
          {effectKeys.map(key => {
            const def = CHAOS_EFFECT_DEFINITIONS[key];
            const isActive = activeEffects.includes(key);

            return (
              <div
                key={key}
                className="glass-panel"
                style={{
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  background: isActive ? 'rgba(219, 39, 119, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  borderColor: isActive ? '#ec4899' : 'rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {getIcon(key)}
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>
                      {def.name}
                    </span>
                  </div>
                  {isActive && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: '#ec4899',
                      color: '#ffffff',
                    }}>
                      ACTIVE
                    </span>
                  )}
                </div>

                <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>
                  {def.description}
                </p>

                <div style={{ marginTop: 'auto', paddingTop: 6 }}>
                  {isActive ? (
                    <button
                      className="toy-btn"
                      style={{ width: '100%', fontSize: 11, color: '#fb7185', borderColor: 'rgba(251, 113, 133, 0.3)' }}
                      onClick={() => {
                        globalAudio.playClick();
                        onDeactivateEffect(key);
                      }}
                    >
                      Deactivate Effect
                    </button>
                  ) : (
                    <button
                      className="toy-btn primary"
                      style={{ width: '100%', fontSize: 11 }}
                      onClick={() => {
                        globalAudio.playClick();
                        onActivateEffect(key, intensity, duration);
                      }}
                    >
                      Unleash Modifier
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
