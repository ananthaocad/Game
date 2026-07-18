import type { CameraRig } from './CameraRig';

export interface TapEvent {
  clientX: number;
  clientY: number;
}

export type TapHandler = (event: TapEvent) => void;

const DRAG_THRESHOLD_PX = 8;
const TAP_MAX_DURATION_MS = 350;

interface PointerState {
  startX: number;
  startY: number;
  x: number;
  y: number;
  startTime: number;
}

/**
 * Unified mouse + touch input: one finger drag pans the camera, two-finger
 * pinch zooms, and a short low-movement tap/click is forwarded as a
 * select/move command.
 */
export class InputController {
  private pointers = new Map<number, PointerState>();
  private dragging = false;
  private pinchStartDistance = 0;
  private onTap: TapHandler | null = null;

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

  setTapHandler(handler: TapHandler): void {
    this.onTap = handler;
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
    this.pointers.set(e.pointerId, {
      startX: e.clientX,
      startY: e.clientY,
      x: e.clientX,
      y: e.clientY,
      startTime: performance.now(),
    });

    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      this.pinchStartDistance = distance(a.x, a.y, b.x, b.y);
      this.dragging = true;
    }
  };

  private handlePointerMove = (e: PointerEvent): void => {
    const state = this.pointers.get(e.pointerId);
    if (!state) return;
    const prevX = state.x;
    const prevY = state.y;
    state.x = e.clientX;
    state.y = e.clientY;

    if (this.pointers.size === 1) {
      const dx = state.x - state.startX;
      const dy = state.y - state.startY;
      if (Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
        this.dragging = true;
      }
      if (this.dragging) {
        this.cameraRig.panScreen(state.x - prevX, state.y - prevY, this.element.clientHeight);
      }
    } else if (this.pointers.size === 2) {
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
    const state = this.pointers.get(e.pointerId);
    this.pointers.delete(e.pointerId);

    if (this.pointers.size === 0) {
      const wasDragging = this.dragging;
      this.dragging = false;
      if (
        !wasDragging &&
        state &&
        performance.now() - state.startTime < TAP_MAX_DURATION_MS &&
        this.onTap
      ) {
        this.onTap({ clientX: state.x, clientY: state.y });
      }
    } else if (this.pointers.size === 1) {
      // Dropped from pinch back to a single finger: reset its drag origin
      // so it doesn't jump.
      const [remaining] = [...this.pointers.values()];
      remaining.startX = remaining.x;
      remaining.startY = remaining.y;
      remaining.startTime = performance.now();
    }
  };

  private handleWheel = (e: WheelEvent): void => {
    e.preventDefault();
    this.cameraRig.zoomBy(e.deltaY * 0.01, this.getAspect());
  };
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}
