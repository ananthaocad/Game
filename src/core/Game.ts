import * as THREE from 'three';
import { CameraRig } from './CameraRig';
import { InputController, type TapEvent } from './InputController';
import { createSkyDome } from '../render/SkyDome';
import { createTerrain } from '../render/Terrain';
import { createSelectionRing } from '../entities/meshFactories';
import { Tree } from '../entities/Tree';
import { TownCenter } from '../entities/TownCenter';
import { Villager } from '../entities/Villager';
import { HUD } from '../ui/HUD';

const HORIZON_COLOR = 0xdcefe6;
const WORLD_SIZE = 60;

interface HitResult {
  type: 'villager' | 'tree' | 'townCenter' | 'terrain' | 'none';
  entity?: Villager | Tree | TownCenter;
  point?: THREE.Vector3;
}

export class Game {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly cameraRig: CameraRig;
  private readonly input: InputController;
  private readonly hud: HUD;
  private readonly raycaster = new THREE.Raycaster();
  private readonly clock = new THREE.Clock();

  private readonly interactables: THREE.Object3D[] = [];
  private readonly trees: Tree[] = [];
  private readonly villagers: Villager[] = [];
  private readonly townCenter: TownCenter;
  private readonly selectionRing: THREE.Mesh;
  private selected: Villager | null = null;
  private wood = 0;

  constructor(canvas: HTMLCanvasElement, hudRoot: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene.fog = new THREE.Fog(HORIZON_COLOR, 30, 75);

    this.cameraRig = new CameraRig(this.aspect, WORLD_SIZE / 2);
    this.hud = new HUD(hudRoot);

    this.scene.add(createSkyDome());
    this.setupLights();

    const terrain = createTerrain({ size: WORLD_SIZE });
    terrain.userData.entityType = 'terrain';
    this.scene.add(terrain);
    this.interactables.push(terrain);

    this.townCenter = new TownCenter(new THREE.Vector3(0, 0, 0));
    this.scene.add(this.townCenter.group);
    this.interactables.push(this.townCenter.group);

    this.spawnTrees();

    const villager = new Villager(new THREE.Vector3(1.6, 0, 2.4), this.townCenter, (amount) =>
      this.depositWood(amount)
    );
    this.villagers.push(villager);
    this.scene.add(villager.group);
    this.interactables.push(villager.group);

    this.selectionRing = createSelectionRing();
    this.scene.add(this.selectionRing);

    this.select(villager);

    this.input = new InputController(canvas, this.cameraRig, () => this.aspect);
    this.input.setTapHandler((e) => this.handleTap(e));

    window.addEventListener('resize', () => this.handleResize());
    this.handleResize();
  }

  start(): void {
    this.renderer.setAnimationLoop(() => this.tick());
  }

  private setupLights(): void {
    const hemi = new THREE.HemisphereLight(0xbfe0ff, 0xcf9f5f, 0.9);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff2d8, 1.4);
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

  private spawnTrees(): void {
    const positions = [
      [4.5, -3.5],
      [5.6, -1.2],
      [3.8, -1.6],
      [-5.2, 3.8],
      [-6.4, 1.9],
      [-4.6, 5.1],
      [6.2, 4.4],
      [-3.4, -5.6],
    ];
    for (const [x, z] of positions) {
      const tree = new Tree(new THREE.Vector3(x, 0, z));
      this.trees.push(tree);
      this.scene.add(tree.group);
      this.interactables.push(tree.group);
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

  private depositWood(amount: number): void {
    this.wood += amount;
    this.hud.setWood(this.wood);
  }

  private select(villager: Villager | null): void {
    this.selected = villager;
    this.selectionRing.visible = !!villager;
    this.hud.setSelection(villager ? `Villager — ${villager.task}` : null);
  }

  private handleTap(e: TapEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    this.raycaster.setFromCamera(ndc, this.cameraRig.camera);
    const hits = this.raycaster.intersectObjects(this.interactables, true);
    if (hits.length === 0) return;

    const result = this.resolveHit(hits[0]);
    switch (result.type) {
      case 'villager':
        this.select(result.entity as Villager);
        break;
      case 'tree':
        this.selected?.commandGather(result.entity as Tree);
        break;
      case 'terrain':
        if (this.selected && result.point) this.selected.commandMove(result.point);
        break;
      default:
        break;
    }
  }

  private resolveHit(hit: THREE.Intersection): HitResult {
    let obj: THREE.Object3D | null = hit.object;
    while (obj && !obj.userData.entityType) {
      obj = obj.parent;
    }
    if (!obj) return { type: 'none' };
    const type = obj.userData.entityType as HitResult['type'];
    if (type === 'terrain') return { type, point: hit.point };
    return { type, entity: obj.userData.entity };
  }

  private tick(): void {
    const dt = Math.min(this.clock.getDelta(), 0.1);

    for (const villager of this.villagers) {
      villager.update(dt);
    }

    if (this.selected) {
      this.selectionRing.position.set(this.selected.position.x, 0.02, this.selected.position.z);
      this.hud.setSelection(`Villager — ${this.selected.task}`);
    }

    this.renderer.render(this.scene, this.cameraRig.camera);
  }
}
