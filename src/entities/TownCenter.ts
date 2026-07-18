import * as THREE from 'three';
import { createTownCenterMesh } from './meshFactories';

export class TownCenter {
  readonly group: THREE.Group;
  readonly position: THREE.Vector3;
  readonly approachRadius = 2.1;

  constructor(position: THREE.Vector3) {
    this.position = position;
    this.group = createTownCenterMesh();
    this.group.position.copy(position);
    this.group.userData.entityType = 'townCenter';
    this.group.userData.entity = this;
  }
}
