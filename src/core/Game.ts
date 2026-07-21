import * as THREE from 'three';
import { CameraRig } from './CameraRig';
import { InputController } from './InputController';
import { MovementInput } from './MovementInput';
import { Inventory } from './Inventory';
import { createSkyDome } from '../render/SkyDome';
import { createTerrain } from '../render/Terrain';
import { createRubbleMesh, createBrokenWallMesh, createDeadTreeMesh } from '../entities/meshFactories';
import { Player } from '../entities/Player';
import { Loot, LOOT_PICKUP_RADIUS } from '../entities/Loot';
import { Beacon, BEACON_REACH_RADIUS } from '../entities/Beacon';
import { ITEM_DEFS } from '../data/items';
import { HUD } from '../ui/HUD';
import { InventoryPanel } from '../ui/InventoryPanel';

const HORIZON_COLOR = 0xc9a878;
const WORLD_SIZE = 90;

const LOOT_SPAWNS: [number, number, string, number][] = [
  [10, -8, 'machete', 1],
  [-14, 6, 'vest', 1],
  [6, 14, 'cannedFood', 3],
  [-9, -16, 'waterBottle', 3],
  [14, 10, 'scrap', 5],
  [-6, 14, 'cloth', 4],
  [2, -20, 'medkit', 1],
  [-18, 4, 'helmet', 1],
];

type DecorKind = 'rubble' | 'wall' | 'deadTree';

const DECOR_POSITIONS: [number, number, DecorKind][] = [
  [4, -4, 'wall'],
  [-6, 3, 'rubble'],
  [8, 6, 'deadTree'],
  [-11, -5, 'wall'],
  [3, 10, 'rubble'],
  [-4, -10, 'deadTree'],
  [13, 2, 'rubble'],
  [-16, 10, 'wall'],
  [1, -18, 'deadTree'],
  [-2, 18, 'rubble'],
  [17, -12, 'wall'],
  [-18, -8, 'rubble'],
];

const BEACON_POSITION: [number, number] = [0, -34];

type MissionStage = 'scavenge' | 'beacon' | 'complete';

export class Game {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly cameraRig: CameraRig;
  private readonly movement: MovementInput;
  private readonly inventory = new Inventory();
  private readonly hud: HUD;
  private readonly inventoryPanel: InventoryPanel;
  private readonly clock = new THREE.Clock();

  private readonly player: Player;
  private readonly loot: Loot[] = [];
  private readonly beacon: Beacon;
  private lootCollected = 0;
  private missionStage: MissionStage = 'scavenge';
  private hasAnnouncedCollapse = false;

  constructor(canvas: HTMLCanvasElement, hudRoot: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene.fog = new THREE.Fog(HORIZON_COLOR, 22, 68);

    this.cameraRig = new CameraRig(this.aspect, WORLD_SIZE / 2);
    this.hud = new HUD(hudRoot);
    this.movement = new MovementInput(hudRoot);
    this.inventoryPanel = new InventoryPanel(hudRoot, this.inventory, {
      onConsume: (itemId) => this.player.consume(ITEM_DEFS[itemId]),
    });
    this.hud.onBackpackClick(() => this.inventoryPanel.toggle());

    this.scene.add(createSkyDome());
    this.setupLights();

    const terrain = createTerrain({ size: WORLD_SIZE });
    this.scene.add(terrain);

    this.spawnDecor();

    this.player = new Player(new THREE.Vector3(0, 0, 0), WORLD_SIZE / 2);
    this.scene.add(this.player.group);

    for (const [x, z, itemId, quantity] of LOOT_SPAWNS) {
      const drop = new Loot(new THREE.Vector3(x, 0, z), itemId, quantity);
      this.loot.push(drop);
      this.scene.add(drop.group);
    }

    this.beacon = new Beacon(new THREE.Vector3(BEACON_POSITION[0], 0, BEACON_POSITION[1]));
    this.scene.add(this.beacon.group);

    this.hud.setSurvivalStats(this.player.health, this.player.hunger, this.player.thirst);
    this.hud.setMission('Scavenge supplies before the wasteland gets you');

    new InputController(canvas, this.cameraRig, () => this.aspect);

    window.addEventListener('resize', () => this.handleResize());
    this.handleResize();
  }

  start(): void {
    this.renderer.setAnimationLoop(() => this.tick());
  }

  private setupLights(): void {
    const hemi = new THREE.HemisphereLight(0x9a8f7a, 0x5c5245, 0.85);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xffceac, 1.1);
    sun.position.set(14, 22, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -20;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 60;
    sun.shadow.bias = -0.0025;
    this.scene.add(sun);
  }

  private spawnDecor(): void {
    for (const [x, z, kind] of DECOR_POSITIONS) {
      const prop =
        kind === 'rubble' ? createRubbleMesh() : kind === 'wall' ? createBrokenWallMesh() : createDeadTreeMesh();
      prop.position.set(x, 0, z);
      prop.rotation.y = Math.random() * Math.PI * 2;
      this.scene.add(prop);
    }
  }

  private get aspect(): number {
    return window.innerWidth / window.innerHeight;
  }

  private handleResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);
    this.cameraRig.setAspect(this.aspect);
  }

  private tick(): void {
    const dt = Math.min(this.clock.getDelta(), 0.1);

    // Freeze movement while the inventory sheet covers the screen, same as the ad's game pausing action underneath the panel.
    const move = this.inventoryPanel.isOpen ? { x: 0, y: 0 } : this.movement.getVector();
    const worldDir = this.cameraRig.worldDirection(move.x, move.y);
    this.player.update(worldDir.x, worldDir.z, dt);
    this.player.updateSurvival(dt);
    this.cameraRig.followTarget(this.player.position, dt);

    this.updateLoot(dt);
    this.beacon.update(dt);
    this.updateMission();
    this.updateSurvivalHud();

    this.renderer.render(this.scene, this.cameraRig.camera);
  }

  private updateLoot(dt: number): void {
    for (const drop of this.loot) {
      if (drop.collected) continue;
      drop.update(dt);
      const dist = drop.position.distanceTo(this.player.position);
      if (dist <= LOOT_PICKUP_RADIUS) {
        const leftover = this.inventory.add(drop.itemId, drop.quantity);
        if (leftover >= drop.quantity) {
          this.hud.showToast('Backpack full');
          continue;
        }
        drop.collect();
        this.lootCollected += 1;
        this.hud.showToast(`Found ${ITEM_DEFS[drop.itemId].name}`);
      }
    }
  }

  private updateMission(): void {
    if (this.missionStage === 'scavenge' && this.lootCollected >= this.loot.length) {
      this.missionStage = 'beacon';
      this.beacon.setActive(true);
      this.hud.setMission('A signal calls — reach the extraction point');
      this.hud.showToast('New objective: reach the extraction point');
      return;
    }

    if (this.missionStage === 'beacon' && !this.beacon.reached) {
      const dist = this.beacon.position.distanceTo(this.player.position);
      if (dist <= BEACON_REACH_RADIUS) {
        this.beacon.reached = true;
        this.missionStage = 'complete';
        this.hud.setMission('Extraction secured. Hold what you scavenged.');
        this.hud.showToast('Mission complete');
      }
    }
  }

  private updateSurvivalHud(): void {
    this.hud.setSurvivalStats(this.player.health, this.player.hunger, this.player.thirst);
    if (!this.player.isAlive && !this.hasAnnouncedCollapse) {
      this.hasAnnouncedCollapse = true;
      this.hud.showToast('You collapsed from exposure');
    }
  }
}
