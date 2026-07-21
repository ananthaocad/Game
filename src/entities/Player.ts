import * as THREE from 'three';
import { createSurvivorMesh } from './meshFactories';

const SPEED = 3.4;

/** The player-controlled survivor: moved directly from an input direction each frame. */
export class Player {
  readonly group: THREE.Group;
  private readonly bobRoot: THREE.Group;
  private readonly bound: number;
  private aliveTime = 0;

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
