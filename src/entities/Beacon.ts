import * as THREE from 'three';
import { createBeaconMesh } from './meshFactories';

export const BEACON_REACH_RADIUS = 2.6;

/** The mission's destination marker: invisible until the setup objective is done. */
export class Beacon {
  readonly group: THREE.Group;
  readonly position: THREE.Vector3;
  active = false;
  reached = false;

  private readonly ring: THREE.Object3D;
  private aliveTime = 0;

  constructor(position: THREE.Vector3) {
    this.position = position;
    const parts = createBeaconMesh();
    this.group = parts.group;
    this.ring = parts.ring;
    this.group.position.copy(position);
    this.group.visible = false;
  }

  setActive(active: boolean): void {
    this.active = active;
    this.group.visible = active;
  }

  update(dt: number): void {
    if (!this.active) return;
    this.aliveTime += dt;
    this.ring.scale.setScalar(0.85 + Math.sin(this.aliveTime * 2.5) * 0.15);
  }
}
