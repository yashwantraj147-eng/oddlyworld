import * as THREE from 'three';
import { ToyboxWorld } from '../core/world/WorldModel';
import { WORLD_THEMES } from '../core/world/WorldThemes';

export class TerrainMeshBuilder {
  public static buildTerrainMesh(world: ToyboxWorld): THREE.Group {
    const group = new THREE.Group();
    const { width, depth } = world.bounds;
    const res = world.terrainResolution;
    const themeConfig = WORLD_THEMES[world.themeId];

    // Create PlaneGeometry with resolution segments
    const geom = new THREE.PlaneGeometry(width, depth, res - 1, res - 1);
    geom.rotateX(-Math.PI / 2);

    const posAttr = geom.attributes.position;
    const colors: number[] = [];

    // Parse theme ground colors
    const groundPalette = themeConfig.groundColors.map(c => new THREE.Color(c));

    for (let i = 0; i < posAttr.count; i++) {
      const h = world.heightMap[i] || 0;
      posAttr.setY(i, h);

      // Color based on height and slope
      const normHeight = Math.min(1.0, h / 4.0);
      let colorIndex = Math.floor(normHeight * (groundPalette.length - 1));
      colorIndex = Math.max(0, Math.min(groundPalette.length - 1, colorIndex));
      
      const col = groundPalette[colorIndex];
      colors.push(col.r, col.g, col.b);
    }

    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.85,
      metalness: 0.1,
      flatShading: true, // cute low-poly diorama aesthetic
    });

    const terrainMesh = new THREE.Mesh(geom, mat);
    terrainMesh.receiveShadow = true;
    terrainMesh.castShadow = true;
    terrainMesh.name = 'terrain_surface';
    group.add(terrainMesh);

    // Add wooden/stone diorama pedestal sides and bottom
    const baseHeight = 2.5;
    const baseGeom = new THREE.BoxGeometry(width + 0.4, baseHeight, depth + 0.4);
    const baseMat = new THREE.MeshStandardMaterial({
      color: world.themeId === 'clockwork_gardens' ? 0x451a03 : (world.themeId === 'crystal_caverns' ? 0x1e293b : 0x271d18),
      roughness: 0.7,
      metalness: 0.15,
    });
    const baseMesh = new THREE.Mesh(baseGeom, baseMat);
    baseMesh.position.set(0, -baseHeight / 2 - 0.05, 0);
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    // Water plane
    if (world.waterLevel > 0) {
      const waterGeom = new THREE.PlaneGeometry(width - 0.2, depth - 0.2, 16, 16);
      waterGeom.rotateX(-Math.PI / 2);
      const waterMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(themeConfig.waterColor),
        transparent: true,
        opacity: themeConfig.waterOpacity,
        roughness: 0.1,
        metalness: 0.2,
      });
      const waterMesh = new THREE.Mesh(waterGeom, waterMat);
      waterMesh.position.y = world.waterLevel;
      waterMesh.receiveShadow = true;
      waterMesh.name = 'water_surface';
      group.add(waterMesh);
    }

    return group;
  }
}
