import * as THREE from 'three';
import { ContraptionPart } from '../core/physics/ContraptionModel';

export class ContraptionMeshBuilder {
  public static buildPartMesh(part: ContraptionPart): THREE.Group {
    const root = new THREE.Group();
    root.name = `contraption_${part.id}`;

    const color = new THREE.Color(part.colorHex || '#38bdf8');
    const sc = part.scale || { x: 1, y: 1, z: 1 };

    switch (part.type) {
      case 'marble': {
        const radius = (part.marbleProperties?.radius || 0.4) * sc.x;
        const matType = part.marbleProperties?.material || 'glass';

        let mat: THREE.Material;
        if (matType === 'rubber') {
          mat = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.1 });
        } else if (matType === 'iron') {
          mat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.2, metalness: 0.85 });
        } else if (matType === 'anti_grav') {
          mat = new THREE.MeshStandardMaterial({ color: 0xc084fc, emissive: 0xa855f7, emissiveIntensity: 0.8, roughness: 0.1 });
        } else {
          // Glass / polished marble
          mat = new THREE.MeshStandardMaterial({ color, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.88 });
        }

        const sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 24, 24), mat);
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        root.add(sphere);
        break;
      }

      case 'ramp': {
        // Track plane with side guardrails
        const trackLength = sc.x * 3.0;
        const trackWidth = sc.z * 1.2;

        const baseMat = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.2 });
        const railMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 });

        const trackGeom = new THREE.BoxGeometry(trackLength, sc.y * 0.25, trackWidth);
        const track = new THREE.Mesh(trackGeom, baseMat);
        track.castShadow = true;
        track.receiveShadow = true;
        root.add(track);

        // Side rails
        const railGeom = new THREE.BoxGeometry(trackLength, 0.3, 0.08);
        const railLeft = new THREE.Mesh(railGeom, railMat);
        railLeft.position.set(0, 0.2, trackWidth / 2 - 0.04);
        const railRight = new THREE.Mesh(railGeom, railMat);
        railRight.position.set(0, 0.2, -trackWidth / 2 + 0.04);
        root.add(railLeft);
        root.add(railRight);
        break;
      }

      case 'platform': {
        const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.1 });
        const box = new THREE.Mesh(new THREE.BoxGeometry(sc.x * 2.0, sc.y * 0.3, sc.z * 2.0), mat);
        box.castShadow = true;
        box.receiveShadow = true;
        root.add(box);
        break;
      }

      case 'spring': {
        // Base plate + coiled spring + red bouncy bumper
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
        const springMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.7 });
        const capMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3 });

        const base = new THREE.Mesh(new THREE.BoxGeometry(sc.x * 1.6, 0.15, sc.z * 1.6), baseMat);
        const coil = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.5, 12), springMat);
        coil.position.y = 0.3;
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(sc.x * 0.7, sc.x * 0.7, 0.15, 16), capMat);
        cap.position.y = 0.6;
        cap.name = 'spring_bumper';

        root.add(base);
        root.add(coil);
        root.add(cap);
        break;
      }

      case 'spinner': {
        const hubMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
        const bladeMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.3 });

        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.6, 12), hubMat);
        const blades = new THREE.Mesh(new THREE.BoxGeometry(sc.x * 2.8, 0.3, 0.25), bladeMat);
        blades.name = 'spinner_blade';

        root.add(hub);
        root.add(blades);
        break;
      }

      case 'fan': {
        const casingMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 });
        const bladeMat = new THREE.MeshStandardMaterial({ color, roughness: 0.2, metalness: 0.4 });

        const casing = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.4, 16), casingMat);
        casing.rotation.x = Math.PI / 2;

        const blade = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.2), bladeMat);
        blade.name = 'fan_blade';
        blade.rotation.x = Math.PI / 2;

        root.add(casing);
        root.add(blade);
        break;
      }

      case 'domino': {
        const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.3 });
        const dominoMesh = new THREE.Mesh(new THREE.BoxGeometry(sc.x * 0.2, sc.y * 1.5, sc.z * 0.7), mat);
        dominoMesh.castShadow = true;
        dominoMesh.receiveShadow = true;
        root.add(dominoMesh);
        break;
      }

      case 'switch_plate': {
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
        const buttonMat = new THREE.MeshStandardMaterial({
          color: part.switchProperties?.isPressed ? 0x22c55e : color,
          emissive: part.switchProperties?.isPressed ? 0x16a34a : 0x000000,
          emissiveIntensity: 0.5,
          roughness: 0.3,
        });

        const frame = new THREE.Mesh(new THREE.BoxGeometry(sc.x * 1.3, 0.12, sc.z * 1.3), frameMat);
        const button = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.16, 16), buttonMat);
        button.position.y = 0.08;
        button.name = 'switch_button';

        root.add(frame);
        root.add(button);
        break;
      }

      case 'target_bell': {
        const standMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
        const bellMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0xd97706,
          emissiveIntensity: 0.3,
          roughness: 0.2,
          metalness: 0.9,
        });

        // Arch stand
        const arch = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.08, 8, 16, Math.PI), standMat);
        arch.position.y = 0.7;

        // Hanging bell
        const bell = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.6, 16), bellMat);
        bell.rotation.x = Math.PI;
        bell.position.y = 0.6;
        bell.name = 'bell_mesh';

        root.add(arch);
        root.add(bell);
        break;
      }

      case 'portal_entry':
      case 'portal_exit': {
        const ringMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.4 });
        const vortexMat = new THREE.MeshStandardMaterial({
          color: part.type === 'portal_entry' ? 0x9333ea : 0x06b6d4,
          emissive: part.type === 'portal_entry' ? 0x7e22ce : 0x0891b2,
          emissiveIntensity: 0.8,
          transparent: true,
          opacity: 0.8,
        });

        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.1, 12, 24), ringMat);
        ring.position.y = 0.7;

        const vortex = new THREE.Mesh(new THREE.CircleGeometry(0.65, 24), vortexMat);
        vortex.position.y = 0.7;
        vortex.name = 'portal_vortex';

        root.add(ring);
        root.add(vortex);
        break;
      }

      default: {
        const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.5 });
        const cube = new THREE.Mesh(new THREE.BoxGeometry(sc.x, sc.y, sc.z), mat);
        cube.castShadow = true;
        cube.receiveShadow = true;
        root.add(cube);
        break;
      }
    }

    root.position.set(part.position.x, part.position.y, part.position.z);
    root.rotation.set(part.rotation.x, part.rotation.y, part.rotation.z);
    return root;
  }

  public static animatePart(mesh: THREE.Group, part: ContraptionPart, time: number): void {
    if (part.type === 'spinner') {
      const blade = mesh.getObjectByName('spinner_blade');
      if (blade) {
        blade.rotation.y = time * (part.spinnerProperties?.angularSpeed || 2.5);
      }
    } else if (part.type === 'fan') {
      const blade = mesh.getObjectByName('fan_blade');
      if (blade) {
        blade.rotation.z = time * 20;
      }
    } else if (part.type === 'portal_entry' || part.type === 'portal_exit') {
      const vortex = mesh.getObjectByName('portal_vortex');
      if (vortex) {
        vortex.rotation.z = time * 3;
      }
    }
  }
}
