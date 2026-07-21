import * as THREE from 'three';
import { createSurvivorMesh } from './meshFactories';
import type { ItemDef } from '../data/items';

const SPEED = 3.4;
const MAX_STAT = 100;
const HUNGER_DECAY_PER_SEC = MAX_STAT / (6 * 60);
const THIRST_DECAY_PER_SEC = MAX_STAT / (4 * 60);
const STARVING_HEALTH_DRAIN_PER_SEC = 3;

/** The player-controlled survivor: moved directly from an input direction each frame. */
export class Player {
  readonly group: THREE.Group;
  private readonly bobRoot: THREE.Group;
  private readonly bound: number;
  private aliveTime = 0;

  health = MAX_STAT;
  hunger = MAX_STAT;
  thirst = MAX_STAT;

  constructor(position: THREE.Vector3, worldHalfExtent: number, margin = 1.5) {
    const parts = createSurvivorMesh();
    this.group = parts.group;
    this.bobRoot = parts.bobRoot;
    this.group.position.copy(position);
    this.bound = worldHalfExtent - margin;
  }

  get position(): THREE.Vector3 {
    return this.group.position;
  }

  get isAlive(): boolean {
    return this.health > 0;
  }

  /** Hunger/thirst drain continuously; starving on either drains health instead. */
  updateSurvival(dt: number): void {
    this.hunger = Math.max(0, this.hunger - HUNGER_DECAY_PER_SEC * dt);
    this.thirst = Math.max(0, this.thirst - THIRST_DECAY_PER_SEC * dt);
    if (this.hunger <= 0 || this.thirst <= 0) {
      this.health = Math.max(0, this.health - STARVING_HEALTH_DRAIN_PER_SEC * dt);
    }
  }

  consume(def: ItemDef): void {
    if (def.restoreHunger) this.hunger = Math.min(MAX_STAT, this.hunger + def.restoreHunger);
    if (def.restoreThirst) this.thirst = Math.min(MAX_STAT, this.thirst + def.restoreThirst);
    if (def.restoreHealth) this.health = Math.min(MAX_STAT, this.health + def.restoreHealth);
  }

  /** @param dirX, dirZ World-space movement direction; magnitude is ignored beyond normalization. */
  update(dirX: number, dirZ: number, dt: number): void {
    this.aliveTime += dt;
    const len = Math.hypot(dirX, dirZ);

    if (len > 0.001) {
      const nx = dirX / len;
      const nz = dirZ / len;
      this.group.position.x = THREE.MathUtils.clamp(this.group.position.x + nx * SPEED * dt, -this.bound, this.bound);
      this.group.position.z = THREE.MathUtils.clamp(this.group.position.z + nz * SPEED * dt, -this.bound, this.bound);
      this.group.rotation.y = Math.atan2(nx, nz);
      this.bobRoot.position.y = 0.02 + Math.abs(Math.sin(this.aliveTime * 9)) * 0.05;
      this.bobRoot.rotation.z = Math.sin(this.aliveTime * 9) * 0.08;
    } else {
      this.bobRoot.position.y = Math.sin(this.aliveTime * 2.2) * 0.015;
      this.bobRoot.rotation.z = THREE.MathUtils.lerp(this.bobRoot.rotation.z, 0, 0.1);
    }
  }
}
