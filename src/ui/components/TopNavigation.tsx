import React from 'react';
import {
  Sparkles,
  Compass,
  BookOpen,
  Clock,
  Trophy,
  Volume2,
  VolumeX,
  HelpCircle,
  Save,
  Check,
  FolderOpen,
  Plus
} from 'lucide-react';
import { ToyboxWorld } from '../../core/world/WorldModel';
import { globalAudio } from '../../core/audio/ProceduralAudioEngine';

interface TopNavigationProps {
  world: ToyboxWorld;
  hasUnsavedChanges: boolean;
  unlockedDiscoveriesCount: number;
  totalDiscoveriesCount: number;
  completedChallengesCount: number;
  totalChallengesCount: number;
  isChaosActive: boolean;
  onOpenGallery: () => void;
  onNewWorld: () => void;
  onSaveCheckpoint: () => void;
  onOpenCreatureLab: () => void;
  onOpenChaos: () => void;
  onOpenJournal: () => void;
  onOpenTimeMachine: () => void;
  onOpenChallenges: () => void;
  onOpenHelp: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  world,
  hasUnsavedChanges,
  unlockedDiscoveriesCount,
  totalDiscoveriesCount,
  completedChallengesCount,
  totalChallengesCount,
  isChaosActive,
  onOpenGallery,
  onNewWorld,
  onSaveCheckpoint,
  onOpenCreatureLab,
  onOpenChaos,
  onOpenJournal,
  onOpenTimeMachine,
  onOpenChallenges,
  onOpenHelp,
}) => {
  const [isMuted, setIsMuted] = React.useState(globalAudio.isMuted);

  const toggleSound = () => {
    const muted = globalAudio.toggleMute();
    setIsMuted(muted);
    if (!muted) globalAudio.playClick();
  };

  return (
    <header style={{
      position: 'absolute',
      top: 14,
      left: 14,
      right: 14,
      height: 52,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      zIndex: 100,
      pointerEvents: 'none',
    }}>
      {/* Brand & World Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, pointerEvents: 'auto' }}>
        <div className="glass-panel" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '6px 14px',
          background: 'rgba(15, 23, 42, 0.85)',
        }}>
          <div style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            background: 'linear-gradient(135deg, #38bdf8, #c084fc)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(56, 189, 248, 0.5)',
          }}>
            <Sparkles size={16} color="#ffffff" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.04em', color: '#f8fafc' }}>
              ODDLYWORLD
            </span>
            <span style={{ fontSize: 10, color: '#38bdf8', fontWeight: 600 }}>
              The Infinite Toybox
            </span>
          </div>
        </div>

        {/* Current World Info Pill */}
        <div className="glass-panel" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '6px 14px',
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>
            {world.name}
          </span>
          <span style={{
            fontSize: 10,
            padding: '2px 6px',
            borderRadius: 6,
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            fontFamily: 'monospace',
          }}>
            Seed #{world.seed}
          </span>
          <button
            className="toy-btn"
            style={{ padding: '3px 8px', fontSize: 11 }}
            onClick={onOpenGallery}
            title="World Gallery"
          >
            <FolderOpen size={12} /> Worlds
          </button>
          <button
            className="toy-btn"
            style={{ padding: '3px 8px', fontSize: 11 }}
            onClick={onNewWorld}
            title="Generate New Seeded World"
          >
            <Plus size={12} /> New
          </button>
        </div>
      </div>

      {/* Main Feature Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'auto' }}>
        <button
          className="toy-btn primary"
          onClick={onOpenCreatureLab}
          title="Creature Creator Laboratory (Ctrl+C)"
        >
          <Sparkles size={14} /> Creature Lab
        </button>

        <button
          className={`toy-btn ${isChaosActive ? 'chaos' : ''}`}
          onClick={onOpenChaos}
          title="The Chaos Engine: Alter World Laws (Ctrl+K)"
        >
          <Compass size={14} /> Chaos Engine
        </button>

        <button
          className="toy-btn"
          onClick={onOpenJournal}
          title="Field Naturalist Journal (Ctrl+J)"
        >
          <BookOpen size={14} /> Field Journal
          <span style={{
            fontSize: 10,
            padding: '1px 5px',
            borderRadius: 10,
            background: 'rgba(56, 189, 248, 0.25)',
            color: '#38bdf8',
          }}>
            {unlockedDiscoveriesCount}/{totalDiscoveriesCount}
          </span>
        </button>

        <button
          className="toy-btn"
          onClick={onOpenTimeMachine}
          title="Temporal Time Machine & Branches (Ctrl+T)"
        >
          <Clock size={14} /> Time Machine
        </button>

        <button
          className="toy-btn"
          onClick={onOpenChallenges}
          title="Curated Challenges & Puzzles (Ctrl+G)"
        >
          <Trophy size={14} /> Challenges
          <span style={{
            fontSize: 10,
            padding: '1px 5px',
            borderRadius: 10,
            background: completedChallengesCount > 0 ? 'rgba(52, 211, 153, 0.25)' : 'rgba(255, 255, 255, 0.1)',
            color: completedChallengesCount > 0 ? '#34d399' : '#94a3b8',
          }}>
            {completedChallengesCount}/{totalChallengesCount}
          </span>
        </button>
      </div>

      {/* Controls & Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'auto' }}>
        <button
          className="toy-btn"
          onClick={onSaveCheckpoint}
          title="Save Checkpoint (Ctrl+S)"
          style={{
            borderColor: hasUnsavedChanges ? 'rgba(251, 191, 36, 0.4)' : 'rgba(52, 211, 153, 0.3)',
          }}
        >
          {hasUnsavedChanges ? (
            <>
              <Save size={13} color="#fbbf24" />
              <span style={{ fontSize: 11, color: '#fbbf24' }}>Unsaved</span>
            </>
          ) : (
            <>
              <Check size={13} color="#34d399" />
              <span style={{ fontSize: 11, color: '#34d399' }}>Saved</span>
            </>
          )}
        </button>

        <button
          className="toy-btn icon-only"
          onClick={toggleSound}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX size={15} color="#94a3b8" /> : <Volume2 size={15} color="#38bdf8" />}
        </button>

        <button
          className="toy-btn icon-only"
          onClick={onOpenHelp}
          title="Keyboard Shortcuts & Guide (F1)"
        >
          <HelpCircle size={15} color="#e2e8f0" />
        </button>
      </div>
    </header>
  );
};
