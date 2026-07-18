import * as THREE from 'three';
import { createTreeMesh } from './meshFactories';

const MAX_WOOD = 8;

export class Tree {
  readonly group: THREE.Group;
  readonly position: THREE.Vector3;
  readonly approachRadius = 0.9;
  woodRemaining = MAX_WOOD;

  constructor(position: THREE.Vector3) {
    this.position = position;
    const parts = createTreeMesh();
    this.group = parts.group;
    this.group.position.copy(position);
    this.group.userData.entityType = 'tree';
    this.group.userData.entity = this;
  }

  get depleted(): boolean {
    return this.woodRemaining <= 0;
  }

  harvestOne(): boolean {
    if (this.depleted) return false;
    this.woodRemaining -= 1;
    const scale = 0.55 + 0.45 * (this.woodRemaining / MAX_WOOD);
    this.group.children[1]?.scale.setScalar(scale); // canopy group
    if (this.depleted) {
      this.group.visible = false;
    }
    return true;
  }
}
