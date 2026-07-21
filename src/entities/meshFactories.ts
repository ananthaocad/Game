import * as THREE from 'three';
import { createPainterlyMaterial } from '../render/PainterlyMaterial';

function mesh(geometry: THREE.BufferGeometry, color: THREE.ColorRepresentation, rim = 0.5): THREE.Mesh {
  const m = new THREE.Mesh(geometry, createPainterlyMaterial({ color, rimIntensity: rim }));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export interface SurvivorParts {
  group: THREE.Group;
  bobRoot: THREE.Group;
}

/** Small chibi-proportioned wasteland scavenger: readable at isometric zoom levels. */
export function createSurvivorMesh(): SurvivorParts {
  const group = new THREE.Group();
  const bobRoot = new THREE.Group();
  group.add(bobRoot);

  const legs = mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.42, 8), 0x3a3a34);
  legs.position.y = 0.21;
  bobRoot.add(legs);

  const torso = mesh(new THREE.CapsuleGeometry(0.2, 0.32, 4, 8), 0x8a4a2f);
  torso.position.y = 0.58;
  bobRoot.add(torso);

  const head = mesh(new THREE.SphereGeometry(0.19, 12, 10), 0xcf9f78);
  head.position.y = 0.92;
  bobRoot.add(head);

  const hood = mesh(new THREE.ConeGeometry(0.21, 0.24, 8), 0x555c47);
  hood.position.y = 1.08;
  bobRoot.add(hood);

  const armGeo = new THREE.CapsuleGeometry(0.06, 0.24, 4, 6);
  const armL = mesh(armGeo, 0x8a4a2f);
  armL.position.set(0.26, 0.58, 0);
  armL.rotation.z = 0.35;
  bobRoot.add(armL);
  const armR = mesh(armGeo, 0x8a4a2f);
  armR.position.set(-0.26, 0.58, 0);
  armR.rotation.z = -0.35;
  bobRoot.add(armR);

  const pack = mesh(new THREE.BoxGeometry(0.24, 0.28, 0.16), 0x4a4438, 0.3);
  pack.position.set(0, 0.6, -0.24);
  bobRoot.add(pack);

  group.scale.setScalar(1.15);

  return { group, bobRoot };
}

export interface LootParts {
  group: THREE.Group;
  spinRoot: THREE.Group;
}

/** Common scavenge find: a strapped supply crate, glowing faintly so it reads against the dust. */
export function createCrateMesh(): LootParts {
  const group = new THREE.Group();
  const spinRoot = new THREE.Group();
  group.add(spinRoot);

  const box = mesh(new THREE.BoxGeometry(0.34, 0.3, 0.34), 0x6b5a3f, 0.3);
  box.position.y = 0.15;
  spinRoot.add(box);

  const strap = mesh(new THREE.BoxGeometry(0.36, 0.05, 0.06), 0x3a3226, 0.2);
  strap.position.y = 0.2;
  spinRoot.add(strap);

  const glow = new THREE.PointLight(0xffcf8a, 0.5, 1.8);
  glow.position.y = 0.35;
  spinRoot.add(glow);

  return { group, spinRoot };
}

/** Rarer scavenge find (weapons/gear): a latched case with a stronger, cooler glow. */
export function createGearCaseMesh(): LootParts {
  const group = new THREE.Group();
  const spinRoot = new THREE.Group();
  group.add(spinRoot);

  const box = mesh(new THREE.BoxGeometry(0.4, 0.24, 0.3), 0x4a5648, 0.35);
  box.position.y = 0.14;
  spinRoot.add(box);

  const latch = mesh(new THREE.BoxGeometry(0.08, 0.06, 0.06), 0xd8c9a3, 0.2);
  latch.position.set(0, 0.2, 0.16);
  spinRoot.add(latch);

  const glow = new THREE.PointLight(0x6be8d4, 0.9, 2.6);
  glow.position.y = 0.32;
  spinRoot.add(glow);

  return { group, spinRoot };
}

export interface BeaconParts {
  group: THREE.Group;
  ring: THREE.Object3D;
}

/** Tall signal pillar marking a mission destination; hidden until active. */
export function createBeaconMesh(): BeaconParts {
  const group = new THREE.Group();

  const pole = mesh(new THREE.CylinderGeometry(0.08, 0.12, 3.4, 8), 0x4a4438, 0.25);
  pole.position.y = 1.7;
  group.add(pole);

  const beamMaterial = new THREE.MeshBasicMaterial({
    color: 0xffb066,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.4, 8, 10, 1, true), beamMaterial);
  beam.position.y = 5.4;
  group.add(beam);

  const light = new THREE.PointLight(0xffb066, 1.6, 9);
  light.position.y = 3.6;
  group.add(light);

  const ringGeo = new THREE.RingGeometry(1.6, 2.0, 32);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xffb066,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.y = 0.03;
  group.add(ring);

  return { group, ring };
}

const RUBBLE_COLORS = [0x8f887a, 0x736c5f, 0xa39a89];

/** Static decoration: a heap of collapsed masonry. */
export function createRubbleMesh(): THREE.Group {
  const group = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const size = 0.25 + Math.random() * 0.4;
    const block = mesh(new THREE.DodecahedronGeometry(size, 0), RUBBLE_COLORS[i % RUBBLE_COLORS.length], 0.25);
    block.position.set((Math.random() - 0.5) * 0.8, size * 0.4, (Math.random() - 0.5) * 0.8);
    block.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    group.add(block);
  }
  return group;
}

/** Static decoration: a jagged, rebar-pierced remnant of a wall. */
export function createBrokenWallMesh(): THREE.Group {
  const group = new THREE.Group();

  const wall = mesh(new THREE.BoxGeometry(2.4, 1.8, 0.35), 0x9a9186, 0.3);
  wall.position.y = 0.9;
  wall.rotation.z = 0.03;
  group.add(wall);

  const jag = mesh(new THREE.BoxGeometry(0.7, 0.9, 0.35), 0x9a9186, 0.3);
  jag.position.set(-0.7, 1.85, 0);
  jag.rotation.z = -0.25;
  group.add(jag);

  const rebar = mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 5), 0x6b6459, 0.2);
  rebar.position.set(0.6, 2.1, 0.1);
  rebar.rotation.z = 0.4;
  group.add(rebar);

  return group;
}

/** Static decoration: a charred, leafless tree. */
export function createDeadTreeMesh(): THREE.Group {
  const group = new THREE.Group();

  const trunk = mesh(new THREE.CylinderGeometry(0.1, 0.18, 2.2, 6), 0x3d362c, 0.25);
  trunk.position.y = 1.1;
  group.add(trunk);

  const branchGeo = new THREE.CylinderGeometry(0.04, 0.07, 0.9, 5);
  const branchA = mesh(branchGeo, 0x3d362c, 0.25);
  branchA.position.set(0.25, 1.9, 0);
  branchA.rotation.z = -0.9;
  group.add(branchA);

  const branchB = mesh(branchGeo, 0x3d362c, 0.25);
  branchB.position.set(-0.2, 1.7, 0.15);
  branchB.rotation.z = 1.0;
  branchB.rotation.x = 0.3;
  group.add(branchB);

  return group;
}
