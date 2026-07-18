import * as THREE from 'three';
import { createPainterlyMaterial } from '../render/PainterlyMaterial';

function mesh(geometry: THREE.BufferGeometry, color: THREE.ColorRepresentation, rim = 0.5): THREE.Mesh {
  const m = new THREE.Mesh(geometry, createPainterlyMaterial({ color, rimIntensity: rim }));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export interface VillagerParts {
  group: THREE.Group;
  basket: THREE.Object3D;
  bobRoot: THREE.Group;
}

/** Small chibi-proportioned worker: readable at isometric RTS zoom levels. */
export function createVillagerMesh(): VillagerParts {
  const group = new THREE.Group();
  const bobRoot = new THREE.Group();
  group.add(bobRoot);

  const legs = mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.42, 8), 0x6b4a2f);
  legs.position.y = 0.21;
  bobRoot.add(legs);

  const torso = mesh(new THREE.CapsuleGeometry(0.2, 0.32, 4, 8), 0x3f7fb0);
  torso.position.y = 0.58;
  bobRoot.add(torso);

  const head = mesh(new THREE.SphereGeometry(0.19, 12, 10), 0xe8b98a);
  head.position.y = 0.92;
  bobRoot.add(head);

  const hood = mesh(new THREE.ConeGeometry(0.21, 0.24, 8), 0xc96b3f);
  hood.position.y = 1.08;
  bobRoot.add(hood);

  const armGeo = new THREE.CapsuleGeometry(0.06, 0.24, 4, 6);
  const armL = mesh(armGeo, 0x3f7fb0);
  armL.position.set(0.26, 0.58, 0);
  armL.rotation.z = 0.35;
  bobRoot.add(armL);
  const armR = mesh(armGeo, 0x3f7fb0);
  armR.position.set(-0.26, 0.58, 0);
  armR.rotation.z = -0.35;
  bobRoot.add(armR);

  const basket = mesh(new THREE.BoxGeometry(0.22, 0.2, 0.16), 0x9c7a44, 0.3);
  basket.position.set(0, 0.62, -0.24);
  basket.visible = false;
  bobRoot.add(basket);

  group.scale.setScalar(1.15);

  return { group, basket, bobRoot };
}

export interface TreeParts {
  group: THREE.Group;
  canopy: THREE.Object3D;
}

export function createTreeMesh(): TreeParts {
  const group = new THREE.Group();

  const trunk = mesh(new THREE.CylinderGeometry(0.14, 0.2, 1.1, 7), 0x6b4a2f);
  trunk.position.y = 0.55;
  group.add(trunk);

  const canopy = new THREE.Group();
  const lump1 = mesh(new THREE.IcosahedronGeometry(0.62, 0), 0x4f8f4a);
  lump1.position.set(0, 1.35, 0);
  canopy.add(lump1);
  const lump2 = mesh(new THREE.IcosahedronGeometry(0.42, 0), 0x5fa356);
  lump2.position.set(0.35, 1.15, 0.2);
  canopy.add(lump2);
  const lump3 = mesh(new THREE.IcosahedronGeometry(0.38, 0), 0x3f7a3d);
  lump3.position.set(-0.3, 1.1, -0.22);
  canopy.add(lump3);
  group.add(canopy);

  return { group, canopy };
}

export function createTownCenterMesh(): THREE.Group {
  const group = new THREE.Group();

  const base = mesh(new THREE.BoxGeometry(2.6, 1.4, 2.6), 0xd9b877);
  base.position.y = 0.7;
  group.add(base);

  const doorway = mesh(new THREE.BoxGeometry(0.6, 0.7, 0.1), 0x6b4a2f, 0.2);
  doorway.position.set(0, 0.4, 1.32);
  group.add(doorway);

  const roof = mesh(new THREE.ConeGeometry(2.05, 1.1, 4), 0x3f8f86);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 1.95;
  group.add(roof);

  const poleGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.3, 6);
  const pole = mesh(poleGeo, 0x8a8a8a, 0.2);
  pole.position.set(0.9, 3.1, 0.9);
  group.add(pole);

  const flag = mesh(new THREE.ConeGeometry(0.22, 0.32, 3), 0xc96b3f, 0.2);
  flag.rotation.z = Math.PI / 2;
  flag.position.set(1.05, 3.55, 0.9);
  group.add(flag);

  return group;
}

export function createSelectionRing(): THREE.Mesh {
  const geometry = new THREE.RingGeometry(0.42, 0.5, 24);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.MeshBasicMaterial({
    color: 0xfff59a,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(geometry, material);
  ring.position.y = 0.02;
  ring.visible = false;
  return ring;
}
