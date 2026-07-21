import * as THREE from 'three';
import { createPainterlyMaterial } from './PainterlyMaterial';
import { generateBlotchTexture } from './painterlyTexture';

export interface TerrainConfig {
  size: number;
}

export function createTerrain(config: TerrainConfig): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(config.size, config.size, 1, 1);
  geometry.rotateX(-Math.PI / 2);

  const texture = generateBlotchTexture({
    base: '#8a7a5f',
    blotches: ['#a08b68', '#6f6250', '#5c5548', '#b79a6e'],
    size: 1024,
    blotchCount: 260,
    seed: 42,
  });
  texture.repeat.set(config.size / 6, config.size / 6);

  const material = createPainterlyMaterial({
    color: 0xffffff,
    map: texture,
    rimColor: 0xd8c9a3,
    rimIntensity: 0.1,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.name = 'terrain';
  return mesh;
}
