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

  constructor(aspect: number) {
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
    this.target.addScaledVector(this.forwardGround, -worldDy);
    this.sync();
  }

  zoomBy(delta: number, aspect: number): void {
    this.zoomLevel = THREE.MathUtils.clamp(this.zoomLevel + delta, this.minZoom, this.maxZoom);
    this.setAspect(aspect);
    this.sync();
  }

  private sync(): void {
    this.camera.position.copy(this.target).addScaledVector(this.dir, this.distance);
    this.camera.lookAt(this.target);
  }
}
