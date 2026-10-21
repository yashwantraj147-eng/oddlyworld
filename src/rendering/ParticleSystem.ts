import * as THREE from 'three';
import { Vector3D } from '../core/world/WorldModel';

export class ParticleSystem {
  public group: THREE.Group = new THREE.Group();
  private ambientParticles: THREE.Points;
  private particlePositions: Float32Array;
  private particleCount: number = 250;

  constructor(worldBounds: { width: number; depth: number; maxHeight: number }) {
    const geom = new THREE.BufferGeometry();
    this.particlePositions = new Float32Array(this.particleCount * 3);

    for (let i = 0; i < this.particleCount; i++) {
      this.particlePositions[i * 3] = (Math.random() - 0.5) * worldBounds.width * 1.2;
      this.particlePositions[i * 3 + 1] = Math.random() * worldBounds.maxHeight + 0.5;
      this.particlePositions[i * 3 + 2] = (Math.random() - 0.5) * worldBounds.depth * 1.2;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.15,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    this.ambientParticles = new THREE.Points(geom, mat);
    this.group.add(this.ambientParticles);
  }

  public update(time: number): void {
    const pos = this.ambientParticles.geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;

    for (let i = 0; i < this.particleCount; i++) {
      // Gentle sine drift in wind
      arr[i * 3] += Math.sin(time + i) * 0.005;
      arr[i * 3 + 1] += Math.cos(time * 0.5 + i) * 0.003;
      arr[i * 3 + 2] += Math.cos(time + i * 2) * 0.005;

      // Wrap if drifted too far
      if (arr[i * 3 + 1] > 10) arr[i * 3 + 1] = 0.5;
      if (arr[i * 3 + 1] < 0.5) arr[i * 3 + 1] = 10;
    }

    pos.needsUpdate = true;
  }

  public setSporeColor(hex: string): void {
    (this.ambientParticles.material as THREE.PointsMaterial).color.set(hex);
  }
}
