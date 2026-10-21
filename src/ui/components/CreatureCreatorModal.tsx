import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { X, Sparkles, Dices, Check, RotateCw } from 'lucide-react';
import { CreatureEntity, BodyShape, HeadStyle, LimbStyle, AccessoryStyle } from '../../core/creatures/CreatureModel';
import { createRandomCreature, COLOR_PALETTES } from '../../core/creatures/CreatureAnatomy';
import { CreatureMeshBuilder } from '../../rendering/CreatureMeshBuilder';
import { globalAudio } from '../../core/audio/ProceduralAudioEngine';

interface CreatureCreatorModalProps {
  worldId: string;
  onClose: () => void;
  onSpawnCreature: (creature: CreatureEntity) => void;
}

export const CreatureCreatorModal: React.FC<CreatureCreatorModalProps> = ({
  worldId,
  onClose,
  onSpawnCreature,
}) => {
  const [creature, setCreature] = useState<CreatureEntity>(() => createRandomCreature(worldId));
  const previewRef = useRef<HTMLDivElement>(null);
  const threeRef = useRef<{ scene: THREE.Scene; camera: THREE.PerspectiveCamera; renderer: THREE.WebGLRenderer; creatureGroup: THREE.Group } | null>(null);

  // Initialize Three.js turntable preview
  useEffect(() => {
    if (!previewRef.current) return;
    const container = previewRef.current;
    const width = container.clientWidth || 340;
    const height = container.clientHeight || 340;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0f19);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 1.2, 3.2);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // Studio lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambLight);

    const keyLight = new THREE.DirectionalLight(0xfef08a, 1.4);
    keyLight.position.set(2, 4, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    // Cute pedestal platform
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.3, 0.15, 32),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 })
    );
    pedestal.position.y = -0.08;
    scene.add(pedestal);

    const creatureGroup = new THREE.Group();
    scene.add(creatureGroup);

    threeRef.current = { scene, camera, renderer, creatureGroup };

    let reqId: number;
    let clock = 0;

    const animate = () => {
      clock += 0.016;
      if (threeRef.current) {
        threeRef.current.creatureGroup.rotation.y = clock * 0.8;
        CreatureMeshBuilder.animateCreature(threeRef.current.creatureGroup, creature, clock);
        threeRef.current.renderer.render(threeRef.current.scene, threeRef.current.camera);
      }
      reqId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      renderer.dispose();
      while (container.firstChild) container.removeChild(container.firstChild);
    };
  }, []);

  // Update creature 3D mesh when anatomy changes
  useEffect(() => {
    if (!threeRef.current) return;
    const group = threeRef.current.creatureGroup;
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }
    const mesh = CreatureMeshBuilder.buildCreatureMesh(creature);
    group.add(mesh);
  }, [creature.anatomy]);

  const randomize = () => {
    globalAudio.playClick();
    const fresh = createRandomCreature(worldId);
    setCreature(fresh);
    globalAudio.playCreatureChirp(fresh.vocalPitch, 'curious');
  };

  const handleSpawn = () => {
    globalAudio.playDiscoveryFanfare();
    onSpawnCreature(creature);
    onClose();
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
          background: 'rgba(0, 0, 0, 0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={18} color="#f472b6" />
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#f8fafc' }}>
              Creature Creator Laboratory
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="toy-btn" onClick={randomize}>
              <Dices size={14} /> Randomize Design
            </button>
            <button className="toy-btn icon-only" onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Modal Body: Left 3D View, Right Controls */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* 3D Turntable Preview */}
          <div style={{ flex: '1 1 45%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <div ref={previewRef} style={{ width: '100%', height: '100%', minHeight: 350 }} />
            <div style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              right: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              background: 'rgba(15, 23, 42, 0.85)',
              padding: '10px 14px',
              borderRadius: 12,
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <input
                type="text"
                value={creature.name}
                onChange={e => setCreature(prev => ({ ...prev, name: e.target.value }))}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#f8fafc',
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: 11, color: '#38bdf8' }}>
                Species: <strong>{creature.speciesName}</strong>
              </span>
            </div>
          </div>

          {/* Right Customization Columns */}
          <div style={{
            flex: '1 1 55%',
            padding: 20,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            {/* Body Shapes */}
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Body Form</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 6 }}>
                {(['blob', 'pill', 'cube', 'pear', 'slug', 'star'] as BodyShape[]).map(shape => (
                  <button
                    key={shape}
                    className={`toy-btn ${creature.anatomy.bodyShape === shape ? 'active' : ''}`}
                    style={{ textTransform: 'capitalize', fontSize: 11, padding: '6px 8px' }}
                    onClick={() => setCreature(prev => ({ ...prev, anatomy: { ...prev.anatomy, bodyShape: shape } }))}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>

            {/* Head / Eyes */}
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Eyes & Face</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 6 }}>
                {(['cyclops', 'trinocular', 'googly', 'snout', 'antenna_crown', 'beak'] as HeadStyle[]).map(h => (
                  <button
                    key={h}
                    className={`toy-btn ${creature.anatomy.headStyle === h ? 'active' : ''}`}
                    style={{ textTransform: 'capitalize', fontSize: 11, padding: '6px 8px' }}
                    onClick={() => setCreature(prev => ({ ...prev, anatomy: { ...prev.anatomy, headStyle: h } }))}
                  >
                    {h.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Limbs */}
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Limbs & Mobility</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginTop: 6 }}>
                {(['stubby_paws', 'spring_foot', 'insect_legs', 'hover_fins'] as LimbStyle[]).map(l => (
                  <button
                    key={l}
                    className={`toy-btn ${creature.anatomy.limbStyle === l ? 'active' : ''}`}
                    style={{ textTransform: 'capitalize', fontSize: 11, padding: '6px 8px' }}
                    onClick={() => setCreature(prev => ({ ...prev, anatomy: { ...prev.anatomy, limbStyle: l } }))}
                  >
                    {l.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Accessories */}
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Accessory Adornment</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 6 }}>
                {(['sprout', 'wings', 'propeller', 'halo', 'horns', 'none'] as AccessoryStyle[]).map(acc => (
                  <button
                    key={acc}
                    className={`toy-btn ${creature.anatomy.accessory === acc ? 'active' : ''}`}
                    style={{ textTransform: 'capitalize', fontSize: 11, padding: '6px 8px' }}
                    onClick={() => setCreature(prev => ({ ...prev, anatomy: { ...prev.anatomy, accessory: acc } }))}
                  >
                    {acc}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Palettes */}
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Harmonious Color Palette</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 6 }}>
                {COLOR_PALETTES.map(p => (
                  <div
                    key={p.name}
                    onClick={() => setCreature(prev => ({
                      ...prev,
                      anatomy: {
                        ...prev.anatomy,
                        primaryColor: p.primary,
                        secondaryColor: p.secondary,
                        bellyColor: p.belly,
                        eyeColor: p.eye,
                      }
                    }))}
                    style={{
                      height: 32,
                      borderRadius: 8,
                      background: `linear-gradient(135deg, ${p.primary} 50%, ${p.secondary} 50%)`,
                      cursor: 'pointer',
                      border: creature.anatomy.primaryColor === p.primary ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.1)',
                      boxShadow: creature.anatomy.primaryColor === p.primary ? '0 0 10px rgba(255,255,255,0.4)' : 'none',
                    }}
                    title={p.name}
                  />
                ))}
              </div>
            </div>

            {/* Trait Balance Sliders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Personality & Behavior</span>
              <TraitSlider
                label="Curiosity"
                value={creature.traits.curiosity}
                onChange={v => setCreature(prev => ({ ...prev, traits: { ...prev.traits, curiosity: v } }))}
              />
              <TraitSlider
                label="Playfulness"
                value={creature.traits.playfulness}
                onChange={v => setCreature(prev => ({ ...prev, traits: { ...prev.traits, playfulness: v } }))}
              />
              <TraitSlider
                label="Mobility Speed"
                value={creature.traits.mobility}
                onChange={v => setCreature(prev => ({ ...prev, traits: { ...prev.traits, mobility: v } }))}
              />
            </div>

            {/* Action Bar */}
            <button
              className="toy-btn primary"
              style={{ padding: '12px 20px', fontSize: 14, fontWeight: 800, marginTop: 8 }}
              onClick={handleSpawn}
            >
              <Check size={16} /> Birth into Toybox World
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TraitSlider: React.FC<{ label: string; value: number; onChange: (v: number) => void }> = ({ label, value, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#cbd5e1' }}>
      <span>{label}</span>
      <span style={{ fontWeight: 700, color: '#38bdf8' }}>{Math.round(value * 100)}%</span>
    </div>
    <input
      type="range"
      min="0.1"
      max="1.0"
      step="0.05"
      value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      style={{ width: '100%', accentColor: '#38bdf8' }}
    />
  </div>
);
