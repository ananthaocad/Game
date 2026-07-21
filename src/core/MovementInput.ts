import { Joystick } from '../ui/Joystick';

const DEADZONE = 0.05;

/** Combines the touch joystick and WASD/arrow keys into one movement vector. */
export class MovementInput {
  private readonly keys = new Set<string>();
  private readonly joystick: Joystick;

  constructor(hudRoot: HTMLElement) {
    this.joystick = new Joystick(hudRoot);
    window.addEventListener('keydown', (e) => this.keys.add(e.key.toLowerCase()));
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
  }

  /** Normalized {x, y}, both in [-1, 1]; y is positive when moving "up" on screen. */
  getVector(): { x: number; y: number } {
    const joy = this.joystick.getVector();
    if (Math.hypot(joy.x, joy.y) > DEADZONE) return joy;

    let x = 0;
    let y = 0;
    if (this.keys.has('a') || this.keys.has('arrowleft')) x -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) x += 1;
    if (this.keys.has('w') || this.keys.has('arrowup')) y += 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) y -= 1;

    const len = Math.hypot(x, y);
    return len > 0 ? { x: x / len, y: y / len } : { x: 0, y: 0 };
  }
}
