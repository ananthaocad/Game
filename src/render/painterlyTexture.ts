import * as THREE from 'three';

export interface BlotchTextureOptions {
  base: string;
  blotches: string[];
  size?: number;
  blotchCount?: number;
  seed?: number;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Hand-painted-looking ground/foliage texture: a flat base color with soft
 * overlapping radial blotches, mimicking gouache brush dabs instead of a
 * photoreal tiled texture.
 */
export function generateBlotchTexture(opts: BlotchTextureOptions): THREE.CanvasTexture {
  const size = opts.size ?? 512;
  const rand = mulberry32(opts.seed ?? 1337);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = opts.base;
  ctx.fillRect(0, 0, size, size);

  const count = opts.blotchCount ?? 90;
  for (let i = 0; i < count; i++) {
    const color = opts.blotches[Math.floor(rand() * opts.blotches.length)];
    const x = rand() * size;
    const y = rand() * size;
    const r = size * (0.04 + rand() * 0.09);
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 0.35 + rand() * 0.25;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
