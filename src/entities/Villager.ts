import * as THREE from 'three';
import { createVillagerMesh } from './meshFactories';
import { Tree } from './Tree';
import { TownCenter } from './TownCenter';

export enum VillagerState {
  Idle = 'idle',
  MovingFree = 'movingFree',
  MovingToTree = 'movingToTree',
  Chopping = 'chopping',
  ReturningToDropoff = 'returning',
}

const SPEED = 2.6;
const CAPACITY = 5;
const CHOP_INTERVAL = 0.7;

export class Villager {
  readonly group: THREE.Group;
  private readonly basket: THREE.Object3D;
  private readonly bobRoot: THREE.Group;

  state: VillagerState = VillagerState.Idle;
  carrying = 0;

  private targetTree: Tree | null = null;
  private moveTarget: THREE.Vector3 | null = null;
  private chopTimer = 0;
  private aliveTime = 0;

  constructor(
    position: THREE.Vector3,
    private readonly townCenter: TownCenter,
    private readonly onWoodDelivered: (amount: number) => void
  ) {
    const parts = createVillagerMesh();
    this.group = parts.group;
    this.basket = parts.basket;
    this.bobRoot = parts.bobRoot;
    this.group.position.copy(position);
    this.group.userData.entityType = 'villager';
    this.group.userData.entity = this;
  }

  get position(): THREE.Vector3 {
    return this.group.position;
  }

  get task(): string {
    switch (this.state) {
      case VillagerState.MovingToTree:
      case VillagerState.Chopping:
        return 'Gathering wood';
      case VillagerState.ReturningToDropoff:
        return 'Returning wood';
      case VillagerState.MovingFree:
        return 'Moving';
      default:
        return 'Idle';
    }
  }

  commandGather(tree: Tree): void {
    if (tree.depleted) return;
    this.targetTree = tree;
    this.moveTarget = null;
    this.state = VillagerState.MovingToTree;
  }

  commandMove(point: THREE.Vector3): void {
    this.targetTree = null;
    this.moveTarget = point.clone();
    this.state = VillagerState.MovingFree;
  }

  update(dt: number): void {
    this.aliveTime += dt;
    this.bobRoot.position.y = Math.sin(this.aliveTime * 2.2) * 0.015;

    switch (this.state) {
      case VillagerState.MovingFree:
        this.updateMovingFree(dt);
        break;
      case VillagerState.MovingToTree:
        this.updateMovingToTree(dt);
        break;
      case VillagerState.Chopping:
        this.updateChopping(dt);
        break;
      case VillagerState.ReturningToDropoff:
        this.updateReturning(dt);
        break;
      case VillagerState.Idle:
        this.bobRoot.rotation.z = THREE.MathUtils.lerp(this.bobRoot.rotation.z, 0, 0.1);
        break;
    }
  }

  private updateMovingFree(dt: number): void {
    if (!this.moveTarget) {
      this.state = VillagerState.Idle;
      return;
    }
    if (this.moveToward(this.moveTarget, 0.05, dt)) {
      this.moveTarget = null;
      this.state = VillagerState.Idle;
    }
  }

  private updateMovingToTree(dt: number): void {
    if (!this.targetTree || this.targetTree.depleted) {
      this.targetTree = null;
      this.state = VillagerState.Idle;
      return;
    }
    if (this.moveToward(this.targetTree.position, this.targetTree.approachRadius, dt)) {
      this.state = VillagerState.Chopping;
      this.chopTimer = 0;
    }
  }

  private updateChopping(dt: number): void {
    this.bobRoot.rotation.z = Math.sin(this.aliveTime * 10) * 0.25;

    if (!this.targetTree || this.targetTree.depleted) {
      this.finishGatheringTrip();
      return;
    }

    this.chopTimer += dt;
    if (this.chopTimer >= CHOP_INTERVAL) {
      this.chopTimer -= CHOP_INTERVAL;
      const harvested = this.targetTree.harvestOne();
      if (harvested) {
        this.carrying += 1;
        this.basket.visible = true;
      }
      if (this.carrying >= CAPACITY || this.targetTree.depleted) {
        this.finishGatheringTrip();
      }
    }
  }

  private finishGatheringTrip(): void {
    if (this.carrying > 0) {
      this.state = VillagerState.ReturningToDropoff;
    } else {
      this.targetTree = null;
      this.state = VillagerState.Idle;
    }
  }

  private updateReturning(dt: number): void {
    this.bobRoot.rotation.z = THREE.MathUtils.lerp(this.bobRoot.rotation.z, 0, 0.15);
    if (this.moveToward(this.townCenter.position, this.townCenter.approachRadius, dt)) {
      this.onWoodDelivered(this.carrying);
      this.carrying = 0;
      this.basket.visible = false;
      if (this.targetTree && !this.targetTree.depleted) {
        this.state = VillagerState.MovingToTree;
      } else {
        this.targetTree = null;
        this.state = VillagerState.Idle;
      }
    }
  }

  /** Moves toward target on the XZ plane; returns true once within stopRadius. */
  private moveToward(target: THREE.Vector3, stopRadius: number, dt: number): boolean {
    const dx = target.x - this.group.position.x;
    const dz = target.z - this.group.position.z;
    const dist = Math.hypot(dx, dz);
    // Epsilon tolerance avoids an asymptotic-approach float trap: without
    // it, `step = dist - stopRadius` shrinks toward zero but rounding
    // drift keeps `dist` a hair above `stopRadius` forever.
    if (dist <= stopRadius + 0.01) return true;

    const dirX = dx / dist;
    const dirZ = dz / dist;
    const step = Math.min(SPEED * dt, dist - stopRadius);
    this.group.position.x += dirX * step;
    this.group.position.z += dirZ * step;
    this.group.rotation.y = Math.atan2(dirX, dirZ);
    this.bobRoot.position.y = 0.02 + Math.abs(Math.sin(this.aliveTime * 9)) * 0.05;
    return false;
  }
}
