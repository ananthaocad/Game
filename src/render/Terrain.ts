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
    base: '#8fbf6a',
    blotches: ['#a4d17f', '#79aa57', '#c8dd8f', '#6f9c4d'],
    size: 1024,
    blotchCount: 220,
    seed: 42,
  });
  texture.repeat.set(config.size / 6, config.size / 6);

  const material = createPainterlyMaterial({
    color: 0xffffff,
    map: texture,
    rimColor: 0xfff6e0,
    rimIntensity: 0.12,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.name = 'terrain';
  return mesh;
}
