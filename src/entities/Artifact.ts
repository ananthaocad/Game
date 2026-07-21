import * as THREE from 'three';
import { createArtifactMesh } from './meshFactories';

export const ARTIFACT_PICKUP_RADIUS = 1.1;

/** A scavengeable relic scattered around the wasteland. */
export class Artifact {
  readonly group: THREE.Group;
  readonly position: THREE.Vector3;
  collected = false;

  private readonly spinRoot: THREE.Object3D;
  private aliveTime: number;

  constructor(position: THREE.Vector3) {
    this.position = position;
    const parts = createArtifactMesh();
    this.group = parts.group;
    this.spinRoot = parts.spinRoot;
    this.group.position.copy(position);
    // Randomized phase so artifacts don't all bob in lockstep.
    this.aliveTime = Math.random() * 10;
  }

  update(dt: number): void {
    if (this.collected) return;
    this.aliveTime += dt;
    this.spinRoot.rotation.y += dt * 1.4;
    this.spinRoot.position.y = 0.55 + Math.sin(this.aliveTime * 2) * 0.12;
  }

  collect(): void {
    this.collected = true;
    this.group.visible = false;
  }
}
