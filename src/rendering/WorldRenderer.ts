import * as THREE from 'three';
import { ToyboxWorld } from '../core/world/WorldModel';
import { WORLD_THEMES } from '../core/world/WorldThemes';
import { CreatureEntity } from '../core/creatures/CreatureModel';
import { ContraptionPart } from '../core/physics/ContraptionModel';
import { TerrainMeshBuilder } from './TerrainMeshBuilder';
import { CreatureMeshBuilder } from './CreatureMeshBuilder';
import { ContraptionMeshBuilder } from './ContraptionMeshBuilder';
import { ParticleSystem } from './ParticleSystem';
import { CameraController } from './CameraController';

export interface RaycastHit {
  point: THREE.Vector3;
  type: 'terrain' | 'creature' | 'contraption' | 'prop';
  id?: string;
}

export class WorldRenderer {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public cameraController: CameraController;

  // Scene object groups
  private terrainGroup: THREE.Group = new THREE.Group();
  private propsGroup: THREE.Group = new THREE.Group();
  private creaturesGroup: THREE.Group = new THREE.Group();
  private contraptionsGroup: THREE.Group = new THREE.Group();
  private ghostGroup: THREE.Group = new THREE.Group();
  private particles: ParticleSystem;

  // Lighting
  private ambientLight: THREE.AmbientLight;
  private dirLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;

  // Meshes cache
  private creatureMeshes: Map<string, THREE.Group> = new Map();
  private contraptionMeshes: Map<string, THREE.Group> = new Map();

  // Raycaster
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mouseCoords: THREE.Vector2 = new THREE.Vector2();

  // Selection
  public selectedId: string | null = null;
  public selectedType: 'creature' | 'contraption' | 'prop' | null = null;

  constructor(container: HTMLElement, world: ToyboxWorld) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a);
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.015);

    const width = container.clientWidth || window.innerWidth || 1280;
    const height = container.clientHeight || window.innerHeight || 800;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
    this.camera.position.set(18, 16, 18);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // Explicit style ensures canvas displays prominently and fills container
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';

    container.appendChild(this.renderer.domElement);

    this.cameraController = new CameraController(this.camera, this.renderer.domElement);

    // Initialize Lighting
    const theme = WORLD_THEMES[world.themeId];
    this.ambientLight = new THREE.AmbientLight(theme.ambientLight.color, theme.ambientLight.intensity);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 0.4);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(theme.sunLight.color, theme.sunLight.intensity);
    this.dirLight.position.set(15, 25, 12);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 70;
    const d = 18;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0005;
    this.scene.add(this.dirLight);

    // Add Scene Groups
    this.scene.add(this.terrainGroup);
    this.scene.add(this.propsGroup);
    this.scene.add(this.creaturesGroup);
    this.scene.add(this.contraptionsGroup);
    this.scene.add(this.ghostGroup);

    this.particles = new ParticleSystem(world.bounds);
    this.scene.add(this.particles.group);

    this.rebuildTerrain(world);
    this.rebuildProps(world);

    window.addEventListener('resize', this.onResize);
  }

  public rebuildTerrain(world: ToyboxWorld): void {
    while (this.terrainGroup.children.length > 0) {
      const child = this.terrainGroup.children[0];
      this.terrainGroup.remove(child);
      if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
    }
    const mesh = TerrainMeshBuilder.buildTerrainMesh(world);
    this.terrainGroup.add(mesh);
  }

  public rebuildProps(world: ToyboxWorld): void {
    while (this.propsGroup.children.length > 0) {
      const child = this.propsGroup.children[0];
      this.propsGroup.remove(child);
    }

    world.props.forEach(p => {
      const propGroup = new THREE.Group();
      propGroup.name = `prop_${p.id}`;
      const color = new THREE.Color(p.colorHex);

      let geom: THREE.BufferGeometry;
      let mat = new THREE.MeshStandardMaterial({ color, roughness: 0.5 });

      switch (p.type) {
        case 'mushroom_tree': {
          const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.2, 8), new THREE.MeshStandardMaterial({ color: 0xfef3c7 }));
          stem.position.y = 0.6;
          const cap = new THREE.Mesh(new THREE.ConeGeometry(0.85, 0.7, 16), mat);
          cap.position.y = 1.3;
          propGroup.add(stem);
          propGroup.add(cap);
          break;
        }

        case 'crystal_shard': {
          geom = new THREE.ConeGeometry(0.4, 1.6, 6);
          mat = new THREE.MeshStandardMaterial({ color, roughness: 0.1, metalness: 0.4, emissive: color, emissiveIntensity: 0.25 });
          const shard = new THREE.Mesh(geom, mat);
          shard.position.y = 0.8;
          propGroup.add(shard);
          break;
        }

        case 'gear_flower': {
          const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0), new THREE.MeshStandardMaterial({ color: 0xca8a04 }));
          stem.position.y = 0.5;
          const blossom = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.08, 6, 12), mat);
          blossom.position.y = 1.0;
          propGroup.add(stem);
          propGroup.add(blossom);
          break;
        }

        case 'lantern_post': {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8), new THREE.MeshStandardMaterial({ color: 0x334155 }));
          post.position.y = 0.9;
          const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 1.0 }));
          lantern.position.y = 1.7;
          propGroup.add(post);
          propGroup.add(lantern);
          break;
        }

        default: {
          geom = new THREE.DodecahedronGeometry(0.4, 0);
          const m = new THREE.Mesh(geom, mat);
          m.position.y = 0.4;
          propGroup.add(m);
          break;
        }
      }

      propGroup.position.set(p.position.x, p.position.y, p.position.z);
      propGroup.rotation.set(p.rotation.x, p.rotation.y, p.rotation.z);
      propGroup.scale.set(p.scale.x, p.scale.y, p.scale.z);
      this.propsGroup.add(propGroup);
    });
  }

  public syncCreatures(creatures: CreatureEntity[], time: number): void {
    const currentIds = new Set(creatures.map(c => c.id));

    // Remove deleted creatures
    for (const [id, mesh] of this.creatureMeshes.entries()) {
      if (!currentIds.has(id)) {
        this.creaturesGroup.remove(mesh);
        this.creatureMeshes.delete(id);
      }
    }

    // Add or update
    creatures.forEach(c => {
      let mesh = this.creatureMeshes.get(c.id);
      if (!mesh) {
        mesh = CreatureMeshBuilder.buildCreatureMesh(c);
        this.creatureMeshes.set(c.id, mesh);
        this.creaturesGroup.add(mesh);
      }

      mesh.position.set(c.position.x, c.position.y, c.position.z);
      CreatureMeshBuilder.animateCreature(mesh, c, time);
    });
  }

  public syncContraptions(contraptions: ContraptionPart[], time: number): void {
    const currentIds = new Set(contraptions.map(p => p.id));

    // Remove deleted parts
    for (const [id, mesh] of this.contraptionMeshes.entries()) {
      if (!currentIds.has(id)) {
        this.contraptionsGroup.remove(mesh);
        this.contraptionMeshes.delete(id);
      }
    }

    // Add or update
    contraptions.forEach(p => {
      let mesh = this.contraptionMeshes.get(p.id);
      if (!mesh) {
        mesh = ContraptionMeshBuilder.buildPartMesh(p);
        this.contraptionMeshes.set(p.id, mesh);
        this.contraptionsGroup.add(mesh);
      }

      mesh.position.set(p.position.x, p.position.y, p.position.z);
      mesh.rotation.set(p.rotation.x, p.rotation.y, p.rotation.z);
      ContraptionMeshBuilder.animatePart(mesh, p, time);
    });
  }

  public updateEnvironment(world: ToyboxWorld, time: number): void {
    const theme = WORLD_THEMES[world.themeId];
    const dayRatio = world.dayTimeRatio; // 0 (dawn) -> 0.25 (noon) -> 0.5 (twilight) -> 0.75 (night)

    // Sun celestial orbit
    const sunAngle = dayRatio * Math.PI * 2;
    const sunDist = 30;
    const sunY = Math.sin(sunAngle) * sunDist;
    const sunX = Math.cos(sunAngle) * sunDist;
    this.dirLight.position.set(sunX, Math.max(2, sunY), 12);

    // Dynamic sky & light transitions
    let skyColor: THREE.Color;
    let sunIntensity: number;

    if (sunY > 5) {
      // Day
      skyColor = new THREE.Color(theme.skyColors.day[0]);
      sunIntensity = 1.3;
    } else if (sunY > -5) {
      // Dawn / Twilight
      skyColor = new THREE.Color(theme.skyColors.twilight[0]);
      sunIntensity = 0.6;
    } else {
      // Night
      skyColor = new THREE.Color(theme.skyColors.night[0]);
      sunIntensity = 0.15;
    }

    this.scene.background = skyColor;
    (this.scene.fog as THREE.FogExp2).color.copy(skyColor);
    this.dirLight.intensity = sunIntensity;

    this.particles.update(time);
  }

  public setGhostPreview(partType: string | null, position: THREE.Vector3 | null, colorHex: string = '#38bdf8'): void {
    while (this.ghostGroup.children.length > 0) {
      this.ghostGroup.remove(this.ghostGroup.children[0]);
    }

    if (!partType || !position) return;

    const ghostMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      transparent: true,
      opacity: 0.5,
      roughness: 0.3,
    });

    let ghostMesh: THREE.Mesh;
    if (partType === 'marble') {
      ghostMesh = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), ghostMat);
    } else if (partType === 'ramp') {
      ghostMesh = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.25, 1.2), ghostMat);
      ghostMesh.rotation.z = -0.3;
    } else if (partType === 'spring') {
      ghostMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.6, 16), ghostMat);
    } else if (partType === 'target_bell') {
      ghostMesh = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.8, 12), ghostMat);
    } else {
      ghostMesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 1.2), ghostMat);
    }

    ghostMesh.position.copy(position);
    this.ghostGroup.add(ghostMesh);
  }

  public raycast(clientX: number, clientY: number): RaycastHit | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouseCoords.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouseCoords.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouseCoords, this.camera);

    // 1. Check Creatures
    const creatureHits = this.raycaster.intersectObjects(this.creaturesGroup.children, true);
    if (creatureHits.length > 0) {
      let obj: THREE.Object3D | null = creatureHits[0].object;
      while (obj && !obj.name.startsWith('creature_') && obj.parent) {
        obj = obj.parent;
      }
      if (obj && obj.name.startsWith('creature_')) {
        const cId = obj.name.replace('creature_', '');
        return { point: creatureHits[0].point, type: 'creature', id: cId };
      }
    }

    // 2. Check Contraptions
    const contraptionHits = this.raycaster.intersectObjects(this.contraptionsGroup.children, true);
    if (contraptionHits.length > 0) {
      let obj: THREE.Object3D | null = contraptionHits[0].object;
      while (obj && !obj.name.startsWith('contraption_') && obj.parent) {
        obj = obj.parent;
      }
      if (obj && obj.name.startsWith('contraption_')) {
        const pId = obj.name.replace('contraption_', '');
        return { point: contraptionHits[0].point, type: 'contraption', id: pId };
      }
    }

    // 3. Check Terrain
    const terrainHits = this.raycaster.intersectObjects(this.terrainGroup.children, true);
    if (terrainHits.length > 0) {
      return { point: terrainHits[0].point, type: 'terrain' };
    }

    return null;
  }

  public render(dt: number): void {
    this.cameraController.update(dt);
    this.renderer.render(this.scene, this.camera);
  }

  private onResize = () => {
    const container = this.renderer.domElement.parentElement;
    const w = (container && container.clientWidth) || window.innerWidth || 1280;
    const h = (container && container.clientHeight) || window.innerHeight || 800;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  public dispose(): void {
    window.removeEventListener('resize', this.onResize);
    this.cameraController.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
