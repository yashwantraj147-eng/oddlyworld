import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { WorldRenderer, RaycastHit } from '../../rendering/WorldRenderer';
import { ToyboxWorld } from '../../core/world/WorldModel';
import { CreatureEntity } from '../../core/creatures/CreatureModel';
import { ContraptionPart, ContraptionPartType } from '../../core/physics/ContraptionModel';
import { ToolMode } from '../components/ToolPalette';
import { globalAudio } from '../../core/audio/ProceduralAudioEngine';

import { SimulationEngine } from '../../core/engine/SimulationEngine';

interface WorldViewportProps {
  world: ToyboxWorld;
  creatures: CreatureEntity[];
  contraptions: ContraptionPart[];
  currentMode: ToolMode;
  selectedContraptionType: ContraptionPartType;
  sculptMode: 'raise' | 'lower' | 'smooth';
  onSelectEntity: (type: 'creature' | 'contraption' | null, id: string | null) => void;
  onPlaceContraption: (pos: THREE.Vector3) => void;
  onSpawnCreatureAt: (pos: THREE.Vector3) => void;
  onSculptTerrainAt: (pos: THREE.Vector3, mode: 'raise' | 'lower' | 'smooth') => void;
  onDeleteEntity: (type: 'creature' | 'contraption', id: string) => void;
  rendererRef: React.MutableRefObject<WorldRenderer | null>;
  simEngineRef?: React.MutableRefObject<SimulationEngine | null>;
}

export const WorldViewport: React.FC<WorldViewportProps> = ({
  world,
  creatures,
  contraptions,
  currentMode,
  selectedContraptionType,
  sculptMode,
  onSelectEntity,
  onPlaceContraption,
  onSpawnCreatureAt,
  onSculptTerrainAt,
  onDeleteEntity,
  rendererRef,
  simEngineRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ world, creatures, contraptions });
  stateRef.current = { world, creatures, contraptions };

  useEffect(() => {
    if (!containerRef.current) return;

    // Remove any leftover canvas elements from previous renders
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    const renderer = new WorldRenderer(containerRef.current, world);
    rendererRef.current = renderer;

    let animId: number;
    let clock = 0;

    const loop = () => {
      clock += 0.016;
      const { world: curWorld, creatures: curCreatures, contraptions: curContraptions } = stateRef.current;
      const liveCreatures = simEngineRef?.current ? simEngineRef.current.creatures : curCreatures;
      const liveContraptions = simEngineRef?.current ? simEngineRef.current.contraptionParts : curContraptions;
      renderer.syncCreatures(liveCreatures, clock);
      renderer.syncContraptions(liveContraptions, clock);
      renderer.updateEnvironment(curWorld, clock);
      renderer.render(0.016);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      rendererRef.current = null;
    };
  }, [world.id]);

  // Handle Mouse Hover for Ghost Preview
  const handleMouseMove = (e: React.MouseEvent) => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    if (currentMode === 'contraption') {
      const hit = renderer.raycast(e.clientX, e.clientY);
      if (hit && hit.type === 'terrain') {
        const previewY = hit.point.y + (selectedContraptionType === 'marble' ? 0.6 : 0.2);
        renderer.setGhostPreview(selectedContraptionType, new THREE.Vector3(hit.point.x, previewY, hit.point.z));
      } else {
        renderer.setGhostPreview(null, null);
      }
    } else {
      renderer.setGhostPreview(null, null);
    }
  };

  // Handle Mouse Click on World
  const handleClick = (e: React.MouseEvent) => {
    // Only handle primary left click
    if (e.button !== 0) return;
    const renderer = rendererRef.current;
    if (!renderer) return;

    const hit = renderer.raycast(e.clientX, e.clientY);
    if (!hit) return;

    if (currentMode === 'inspect') {
      if (hit.type === 'creature' && hit.id) {
        globalAudio.playClick();
        onSelectEntity('creature', hit.id);
      } else if (hit.type === 'contraption' && hit.id) {
        globalAudio.playClick();
        onSelectEntity('contraption', hit.id);
      } else {
        onSelectEntity(null, null);
      }
    } else if (currentMode === 'contraption') {
      if (hit.point) {
        const placeY = hit.point.y + (selectedContraptionType === 'marble' ? 1.0 : 0.2);
        onPlaceContraption(new THREE.Vector3(hit.point.x, placeY, hit.point.z));
      }
    } else if (currentMode === 'creature_spawn') {
      if (hit.point) {
        onSpawnCreatureAt(new THREE.Vector3(hit.point.x, hit.point.y + 0.5, hit.point.z));
      }
    } else if (currentMode === 'sculpt') {
      if (hit.point) {
        onSculptTerrainAt(hit.point, sculptMode);
      }
    } else if (currentMode === 'eraser') {
      if (hit.type === 'creature' && hit.id) {
        globalAudio.playClick();
        onDeleteEntity('creature', hit.id);
      } else if (hit.type === 'contraption' && hit.id) {
        globalAudio.playClick();
        onDeleteEntity('contraption', hit.id);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={{
        width: '100vw',
        height: '100vh',
        position: 'absolute',
        top: 0,
        left: 0,
        cursor: currentMode === 'inspect' ? 'default' : currentMode === 'eraser' ? 'crosshair' : 'crosshair',
        outline: 'none',
      }}
    />
  );
};
