import React from 'react';
import {
  X,
  Trophy,
  CheckCircle2,
  Circle,
  Lightbulb,
  Award,
  Sparkles
} from 'lucide-react';
import { Challenge } from '../../core/challenges/ChallengeEngine';
import { globalAudio } from '../../core/audio/ProceduralAudioEngine';

interface ChallengesModalProps {
  challenges: Challenge[];
  onClose: () => void;
}

export const ChallengesModal: React.FC<ChallengesModalProps> = ({
  challenges,
  onClose,
}) => {
  const completedCount = challenges.filter(c => c.isCompleted).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 780, maxHeight: 580 }} onClick={e => e.stopPropagation()}>
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
            <Trophy size={18} color="#fbbf24" />
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#f8fafc' }}>
                Toybox Challenges & Engineering Feats
              </h2>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>
                Construct whimsical contraptions and nurture flourishing habitats.
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontSize: 12,
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: 999,
              background: 'rgba(251, 191, 36, 0.15)',
              color: '#fbbf24',
              border: '1px solid rgba(251, 191, 36, 0.3)',
            }}>
              {completedCount} / {challenges.length} Complete
            </span>
            <button className="toy-btn icon-only" onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Challenges List */}
        <div style={{ padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {challenges.map(c => (
            <div
              key={c.id}
              className="glass-panel"
              style={{
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                background: c.isCompleted ? 'rgba(52, 211, 153, 0.06)' : 'rgba(255, 255, 255, 0.03)',
                borderColor: c.isCompleted ? 'rgba(52, 211, 153, 0.35)' : 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {c.isCompleted ? (
                    <CheckCircle2 size={18} color="#34d399" />
                  ) : (
                    <Circle size={18} color="#94a3b8" />
                  )}
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>
                    {c.title}
                  </span>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#94a3b8',
                  }}>
                    {c.difficulty}
                  </span>
                </div>
                {c.isCompleted && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Sparkles size={13} /> Completed!
                  </span>
                )}
              </div>

              <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.4 }}>
                {c.description}
              </p>

              <div style={{
                background: 'rgba(0, 0, 0, 0.25)',
                padding: '8px 10px',
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}>
                <span style={{ fontSize: 11, color: '#38bdf8', fontWeight: 600 }}>
                  Objective: {c.objective}
                </span>
                <span style={{ fontSize: 10, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Lightbulb size={11} color="#f59e0b" /> Hint: {c.hint}
                </span>
              </div>

              {!c.isCompleted && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ width: '100%', height: 6, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${c.progressPercent}%`, height: '100%', background: '#38bdf8', borderRadius: 3 }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
