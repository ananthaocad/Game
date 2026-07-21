import type { CameraRig } from './CameraRig';

interface PointerState {
  x: number;
  y: number;
}

/**
 * Two-finger pinch and mouse-wheel zoom on the game canvas. Movement is
 * handled separately by the virtual joystick / keyboard (see
 * MovementInput) so this controller only owns the camera's zoom.
 */
export class InputController {
  private pointers = new Map<number, PointerState>();
  private pinchStartDistance = 0;

  constructor(
    private readonly element: HTMLElement,
    private readonly cameraRig: CameraRig,
    private readonly getAspect: () => number
  ) {
    element.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
    window.addEventListener('pointercancel', this.handlePointerUp);
    element.addEventListener('wheel', this.handleWheel, { passive: false });
  }

  dispose(): void {
    this.element.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    window.removeEventListener('pointercancel', this.handlePointerUp);
    this.element.removeEventListener('wheel', this.handleWheel);
  }

  private handlePointerDown = (e: PointerEvent): void => {
    this.element.setPointerCapture(e.pointerId);
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      this.pinchStartDistance = distance(a.x, a.y, b.x, b.y);
    }
  };

  private handlePointerMove = (e: PointerEvent): void => {
    const state = this.pointers.get(e.pointerId);
    if (!state) return;
    state.x = e.clientX;
    state.y = e.clientY;

    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      const dist = distance(a.x, a.y, b.x, b.y);
      if (this.pinchStartDistance > 0) {
        const delta = (this.pinchStartDistance - dist) * 0.03;
        this.cameraRig.zoomBy(delta, this.getAspect());
        this.pinchStartDistance = dist;
      }
    }
  };

  private handlePointerUp = (e: PointerEvent): void => {
    this.pointers.delete(e.pointerId);
    this.pinchStartDistance = 0;
  };

  private handleWheel = (e: WheelEvent): void => {
    e.preventDefault();
    this.cameraRig.zoomBy(e.deltaY * 0.01, this.getAspect());
  };
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}
