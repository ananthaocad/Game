import * as THREE from 'three';

const WORLD_UP = new THREE.Vector3(0, 1, 0);

/**
 * Fixed-angle orthographic camera in the Age-of-Empires mold: it never
 * rotates, only pans across the ground plane and zooms via frustum size.
 */
export class CameraRig {
  readonly camera: THREE.OrthographicCamera;
  readonly target = new THREE.Vector3(0, 0, 0);

  private zoomLevel = 13;
  private readonly minZoom = 6;
  private readonly maxZoom = 26;
  private readonly distance = 40;
  private readonly dir: THREE.Vector3;
  private readonly right: THREE.Vector3;
  private readonly forwardGround: THREE.Vector3;
  private readonly panBound: number;

  /**
   * @param panBound How far the look-at target may travel from the origin
   * on each ground axis. Keeping it at the world's half-extent means the
   * screen center — and therefore the farthest a ground edge can be
   * dragged into view — never goes past the middle of the viewport, so
   * players can't pan off into empty space and lose their bearings.
   */
  constructor(aspect: number, panBound = 30) {
    this.panBound = panBound;
    this.dir = new THREE.Vector3(1, 1.3, 1).normalize();
    const forward3 = this.dir.clone().negate();
    this.forwardGround = new THREE.Vector3(forward3.x, 0, forward3.z).normalize();
    this.right = new THREE.Vector3().crossVectors(forward3, WORLD_UP).normalize();

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    this.setAspect(aspect);
    this.sync();
  }

  setAspect(aspect: number): void {
    const h = this.zoomLevel;
    const w = h * aspect;
    this.camera.left = -w;
    this.camera.right = w;
    this.camera.top = h;
    this.camera.bottom = -h;
    this.camera.updateProjectionMatrix();
  }

  /** Pan in screen-space units; automatically scaled by current zoom. */
  panScreen(dxPixels: number, dyPixels: number, viewportHeight: number): void {
    const worldPerPixel = (this.zoomLevel * 2) / viewportHeight;
    const worldDx = -dxPixels * worldPerPixel;
    const worldDy = dyPixels * worldPerPixel;
    this.target.addScaledVector(this.right, worldDx);
    this.target.addScaledVector(this.forwardGround, worldDy);
    this.clampTarget();
    this.sync();
  }

  zoomBy(delta: number, aspect: number): void {
    this.zoomLevel = THREE.MathUtils.clamp(this.zoomLevel + delta, this.minZoom, this.maxZoom);
    this.setAspect(aspect);
    this.clampTarget();
    this.sync();
  }

  private clampTarget(): void {
    this.target.x = THREE.MathUtils.clamp(this.target.x, -this.panBound, this.panBound);
    this.target.z = THREE.MathUtils.clamp(this.target.z, -this.panBound, this.panBound);
  }

  private sync(): void {
    this.camera.position.copy(this.target).addScaledVector(this.dir, this.distance);
    this.camera.lookAt(this.target);
  }
}
