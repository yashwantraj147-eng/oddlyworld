import * as THREE from 'three';
import { CreatureEntity, BodyShape, HeadStyle, LimbStyle, AccessoryStyle } from '../core/creatures/CreatureModel';

export class CreatureMeshBuilder {
  public static buildCreatureMesh(creature: CreatureEntity): THREE.Group {
    const root = new THREE.Group();
    root.name = `creature_${creature.id}`;

    const scale = creature.anatomy.scale || 1.0;
    const primaryColor = new THREE.Color(creature.anatomy.primaryColor);
    const secondaryColor = new THREE.Color(creature.anatomy.secondaryColor);
    const bellyColor = new THREE.Color(creature.anatomy.bellyColor);
    const eyeColor = new THREE.Color(creature.anatomy.eyeColor);

    const bodyMat = new THREE.MeshStandardMaterial({
      color: primaryColor,
      roughness: creature.anatomy.roughness || 0.4,
      metalness: 0.05,
    });

    const secondaryMat = new THREE.MeshStandardMaterial({
      color: secondaryColor,
      roughness: 0.5,
    });

    const bellyMat = new THREE.MeshStandardMaterial({
      color: bellyColor,
      roughness: 0.5,
    });

    // 1. Body Geometry
    let bodyGeom: THREE.BufferGeometry;
    switch (creature.anatomy.bodyShape) {
      case 'pill':
        bodyGeom = new THREE.CapsuleGeometry(0.4, 0.45, 8, 16);
        break;
      case 'cube':
        bodyGeom = new THREE.BoxGeometry(0.7, 0.7, 0.7);
        break;
      case 'pear':
        bodyGeom = new THREE.ConeGeometry(0.48, 0.8, 16);
        break;
      case 'slug':
        bodyGeom = new THREE.SphereGeometry(0.45, 16, 12);
        bodyGeom.scale(0.8, 0.5, 1.4);
        break;
      case 'star':
        bodyGeom = new THREE.DodecahedronGeometry(0.48, 0);
        break;
      case 'blob':
      default:
        bodyGeom = new THREE.SphereGeometry(0.5, 16, 16);
        bodyGeom.scale(1.0, 0.85, 1.0);
        break;
    }

    const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
    bodyMesh.position.y = 0.5;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bodyMesh.name = 'creature_body';
    root.add(bodyMesh);

    // Belly patch
    const bellyGeom = new THREE.SphereGeometry(0.26, 12, 12);
    bellyGeom.scale(1.0, 1.1, 0.4);
    const bellyMesh = new THREE.Mesh(bellyGeom, bellyMat);
    bellyMesh.position.set(0, 0.45, 0.38);
    root.add(bellyMesh);

    // 2. Eyes and Head Features
    this.addEyesAndHead(root, creature.anatomy.headStyle, eyeColor, secondaryMat);

    // 3. Limbs
    this.addLimbs(root, creature.anatomy.limbStyle, secondaryMat);

    // 4. Accessory
    this.addAccessory(root, creature.anatomy.accessory, secondaryColor);

    // 5. Emote Anchor
    const emoteAnchor = new THREE.Group();
    emoteAnchor.name = 'emote_anchor';
    emoteAnchor.position.set(0, 1.3, 0);
    root.add(emoteAnchor);

    root.scale.set(scale, scale, scale);
    return root;
  }

  private static addEyesAndHead(root: THREE.Group, headStyle: HeadStyle, eyeColor: THREE.Color, secondaryMat: THREE.Material): void {
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
    const eyePupilMat = new THREE.MeshStandardMaterial({ color: eyeColor, roughness: 0.1 });

    switch (headStyle) {
      case 'cyclops': {
        const eyeGeom = new THREE.SphereGeometry(0.18, 16, 16);
        const eye = new THREE.Mesh(eyeGeom, eyeWhiteMat);
        eye.position.set(0, 0.65, 0.42);

        const pupilGeom = new THREE.SphereGeometry(0.09, 12, 12);
        const pupil = new THREE.Mesh(pupilGeom, eyePupilMat);
        pupil.position.set(0, 0.65, 0.56);
        root.add(eye);
        root.add(pupil);
        break;
      }

      case 'trinocular': {
        const eyePos = [
          { x: -0.16, y: 0.6, z: 0.42 },
          { x: 0.16, y: 0.6, z: 0.42 },
          { x: 0, y: 0.78, z: 0.4 },
        ];
        eyePos.forEach(p => {
          const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), eyeWhiteMat);
          eye.position.set(p.x, p.y, p.z);
          const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), eyePupilMat);
          pupil.position.set(p.x, p.y, p.z + 0.06);
          root.add(eye);
          root.add(pupil);
        });
        break;
      }

      case 'antenna_crown': {
        // Two cute antennae
        const stalkMat = secondaryMat;
        [-0.15, 0.15].forEach(xOff => {
          const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35), stalkMat);
          stalk.position.set(xOff, 0.95, 0);
          stalk.rotation.z = xOff > 0 ? -0.2 : 0.2;
          const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xfacc15, emissiveIntensity: 0.5 }));
          bulb.position.set(xOff * 1.5, 1.15, 0);
          root.add(stalk);
          root.add(bulb);
        });
        // Normal eyes
        this.addPairEyes(root, eyeWhiteMat, eyePupilMat);
        break;
      }

      case 'snout': {
        const snout = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), secondaryMat);
        snout.scale.set(1.4, 0.8, 1.0);
        snout.position.set(0, 0.48, 0.5);
        root.add(snout);
        this.addPairEyes(root, eyeWhiteMat, eyePupilMat);
        break;
      }

      case 'beak': {
        const beak = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 8), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
        beak.rotation.x = Math.PI / 2;
        beak.position.set(0, 0.52, 0.55);
        root.add(beak);
        this.addPairEyes(root, eyeWhiteMat, eyePupilMat);
        break;
      }

      case 'googly':
      default: {
        this.addPairEyes(root, eyeWhiteMat, eyePupilMat);
        break;
      }
    }
  }

  private static addPairEyes(root: THREE.Group, whiteMat: THREE.Material, pupilMat: THREE.Material): void {
    [-0.16, 0.16].forEach(x => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 14), whiteMat);
      eye.position.set(x, 0.65, 0.43);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), pupilMat);
      pupil.position.set(x, 0.65, 0.52);
      root.add(eye);
      root.add(pupil);
    });
  }

  private static addLimbs(root: THREE.Group, limbStyle: LimbStyle, mat: THREE.Material): void {
    switch (limbStyle) {
      case 'spring_foot': {
        const spring = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.25, 8), mat);
        spring.position.set(0, 0.12, 0);
        root.add(spring);
        break;
      }

      case 'hover_fins': {
        [-0.45, 0.45].forEach(x => {
          const fin = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.04, 0.3), mat);
          fin.position.set(x, 0.4, 0);
          fin.rotation.z = x > 0 ? -0.2 : 0.2;
          root.add(fin);
        });
        break;
      }

      case 'insect_legs': {
        [-0.3, 0.3].forEach(x => {
          [-0.15, 0.15].forEach(z => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.3), mat);
            leg.position.set(x * 1.2, 0.15, z);
            leg.rotation.z = x > 0 ? -0.4 : 0.4;
            root.add(leg);
          });
        });
        break;
      }

      case 'stubby_paws':
      default: {
        [-0.22, 0.22].forEach(x => {
          const paw = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), mat);
          paw.scale.set(1.0, 0.7, 1.4);
          paw.position.set(x, 0.08, 0.12);
          paw.castShadow = true;
          root.add(paw);
        });
        break;
      }
    }
  }

  private static addAccessory(root: THREE.Group, accessory: AccessoryStyle, secondaryColor: THREE.Color): void {
    if (accessory === 'none') return;

    switch (accessory) {
      case 'sprout': {
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2), new THREE.MeshStandardMaterial({ color: 0x78350f }));
        stem.position.set(0, 0.95, 0);
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.3 });
        const leaf1 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), leafMat);
        leaf1.scale.set(1.5, 0.3, 0.8);
        leaf1.position.set(0.08, 1.05, 0);
        leaf1.rotation.z = 0.3;
        root.add(stem);
        root.add(leaf1);
        break;
      }

      case 'wings': {
        const wingMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.7 });
        [-0.35, 0.35].forEach(x => {
          const wing = new THREE.Mesh(new THREE.CircleGeometry(0.22, 12), wingMat);
          wing.position.set(x, 0.65, -0.4);
          wing.rotation.y = x > 0 ? 0.3 : -0.3;
          root.add(wing);
        });
        break;
      }

      case 'halo': {
        const haloGeom = new THREE.TorusGeometry(0.25, 0.03, 8, 24);
        const haloMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 0.8 });
        const halo = new THREE.Mesh(haloGeom, haloMat);
        halo.rotation.x = Math.PI / 2;
        halo.position.set(0, 1.15, 0);
        root.add(halo);
        break;
      }

      case 'horns': {
        const hornMat = new THREE.MeshStandardMaterial({ color: 0xfb7185 });
        [-0.2, 0.2].forEach(x => {
          const horn = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 8), hornMat);
          horn.position.set(x, 0.95, 0);
          horn.rotation.z = x > 0 ? -0.3 : 0.3;
          root.add(horn);
        });
        break;
      }

      case 'propeller': {
        const propMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8 });
        const prop = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.08), propMat);
        prop.position.set(0, 1.0, 0);
        prop.name = 'propeller_blade';
        root.add(prop);
        break;
      }
    }
  }

  public static animateCreature(mesh: THREE.Group, creature: CreatureEntity, time: number): void {
    const body = mesh.getObjectByName('creature_body');
    if (!body) return;

    const squish = creature.anatomy.squishiness || 0.5;

    if (creature.currentAction === 'sleep') {
      // Slow breathing squash
      body.scale.y = 1.0 - Math.sin(time * 2) * 0.12 * squish;
      body.scale.x = 1.0 + Math.sin(time * 2) * 0.08 * squish;
      mesh.rotation.z = 0.25; // snug tilted posture
    } else {
      mesh.rotation.z = 0;
      // Normal breathing
      body.scale.y = 1.0 + Math.sin(time * 4) * 0.06 * squish;

      // Waddling animation when moving
      const isMoving = Math.abs(creature.velocity.x) > 0.1 || Math.abs(creature.velocity.z) > 0.1;
      if (isMoving) {
        mesh.rotation.z = Math.sin(time * 12) * 0.12;
        body.position.y = 0.5 + Math.abs(Math.sin(time * 12)) * 0.15;
      } else {
        body.position.y = 0.5;
      }

      // Propeller spin
      const prop = mesh.getObjectByName('propeller_blade');
      if (prop) {
        prop.rotation.y = time * 15;
      }
    }

    // Heading orientation
    mesh.rotation.y = creature.heading;
  }
}
