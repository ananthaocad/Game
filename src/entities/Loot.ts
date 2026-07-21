import * as THREE from 'three';
import { createCrateMesh, createGearCaseMesh } from './meshFactories';
import { ITEM_DEFS } from '../data/items';

export const LOOT_PICKUP_RADIUS = 1.1;

/** A world item drop; walking within range adds it to the player's Inventory. */
export class Loot {
  readonly group: THREE.Group;
  collected = false;

  private readonly spinRoot: THREE.Object3D;
  private aliveTime = Math.random() * 10;

  constructor(
    readonly position: THREE.Vector3,
    readonly itemId: string,
    readonly quantity = 1
  ) {
    const def = ITEM_DEFS[itemId];
    const isValuable = def.category === 'weapon' || def.category === 'gear';
    const parts = isValuable ? createGearCaseMesh() : createCrateMesh();
    this.group = parts.group;
    this.spinRoot = parts.spinRoot;
    this.group.position.copy(position);
  }

  update(dt: number): void {
    if (this.collected) return;
    this.aliveTime += dt;
    this.spinRoot.rotation.y += dt * 0.8;
    this.spinRoot.position.y = 0.05 + Math.sin(this.aliveTime * 2) * 0.05;
  }

  collect(): void {
    this.collected = true;
    this.group.visible = false;
  }
}
