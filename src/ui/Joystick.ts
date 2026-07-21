const BASE_RADIUS = 54;

/** Touch-only virtual thumbstick anchored to the bottom-left of the HUD. */
export class Joystick {
  private readonly baseEl: HTMLElement;
  private readonly knobEl: HTMLElement;
  private activePointerId: number | null = null;
  private originX = 0;
  private originY = 0;
  private vecX = 0;
  private vecY = 0;

  constructor(root: HTMLElement) {
    this.baseEl = document.createElement('div');
    this.baseEl.className = 'joystick-base';
    this.knobEl = document.createElement('div');
    this.knobEl.className = 'joystick-knob';
    this.baseEl.appendChild(this.knobEl);
    root.appendChild(this.baseEl);

    this.baseEl.addEventListener('pointerdown', this.handleDown);
    window.addEventListener('pointermove', this.handleMove);
    window.addEventListener('pointerup', this.handleUp);
    window.addEventListener('pointercancel', this.handleUp);
  }

  /** Normalized {x, y}, both in [-1, 1]; y is positive when pushed "up". */
  getVector(): { x: number; y: number } {
    return { x: this.vecX, y: this.vecY };
  }

  private handleDown = (e: PointerEvent): void => {
    if (this.activePointerId !== null) return;
    this.activePointerId = e.pointerId;
    this.baseEl.setPointerCapture(e.pointerId);
    const rect = this.baseEl.getBoundingClientRect();
    this.originX = rect.left + rect.width / 2;
    this.originY = rect.top + rect.height / 2;
    this.updateFromPointer(e.clientX, e.clientY);
  };

  private handleMove = (e: PointerEvent): void => {
    if (e.pointerId !== this.activePointerId) return;
    this.updateFromPointer(e.clientX, e.clientY);
  };

  private handleUp = (e: PointerEvent): void => {
    if (e.pointerId !== this.activePointerId) return;
    this.activePointerId = null;
    this.vecX = 0;
    this.vecY = 0;
    this.knobEl.style.transform = 'translate(-50%, -50%)';
  };

  private updateFromPointer(clientX: number, clientY: number): void {
    const dx = clientX - this.originX;
    const dy = clientY - this.originY;
    const dist = Math.min(Math.hypot(dx, dy), BASE_RADIUS);
    const angle = Math.atan2(dy, dx);
    const clampedX = Math.cos(angle) * dist;
    const clampedY = Math.sin(angle) * dist;
    this.knobEl.style.transform = `translate(calc(-50% + ${clampedX}px), calc(-50% + ${clampedY}px))`;
    this.vecX = clampedX / BASE_RADIUS;
    this.vecY = -clampedY / BASE_RADIUS;
  }
}
