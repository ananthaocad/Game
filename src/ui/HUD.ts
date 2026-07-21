export class HUD {
  private readonly healthFillEl: HTMLElement;
  private readonly hungerValueEl: HTMLElement;
  private readonly thirstValueEl: HTMLElement;
  private readonly backpackButtonEl: HTMLElement;
  private readonly missionTextEl: HTMLElement;
  private readonly toastEl: HTMLElement;
  private readonly hintEl: HTMLElement;
  private toastTimer: number | undefined;

  constructor(root: HTMLElement) {
    root.innerHTML = `
      <div class="top-bar">
        <div class="stat-pills">
          <div class="health-pill">
            <div class="health-fill" id="health-fill"></div>
          </div>
          <div class="resource-pill"><span class="icon">\u{1F357}</span><span id="hunger-value">100</span></div>
          <div class="resource-pill"><span class="icon">\u{1F4A7}</span><span id="thirst-value">100</span></div>
        </div>
        <button class="icon-btn backpack-btn" id="backpack-btn">\u{1F392}</button>
      </div>
      <div class="mission-banner" id="mission-banner"></div>
      <div class="hint" id="hint">Drag the stick to move · Pinch or scroll to zoom</div>
      <div class="toast hidden" id="toast"></div>
    `;
    this.healthFillEl = root.querySelector('#health-fill')!;
    this.hungerValueEl = root.querySelector('#hunger-value')!;
    this.thirstValueEl = root.querySelector('#thirst-value')!;
    this.backpackButtonEl = root.querySelector('#backpack-btn')!;
    this.missionTextEl = root.querySelector('#mission-banner')!;
    this.hintEl = root.querySelector('#hint')!;
    this.toastEl = root.querySelector('#toast')!;

    window.setTimeout(() => {
      this.hintEl.style.opacity = '0';
    }, 6000);
  }

  onBackpackClick(handler: () => void): void {
    this.backpackButtonEl.addEventListener('click', handler);
  }

  setSurvivalStats(health: number, hunger: number, thirst: number): void {
    this.healthFillEl.style.width = `${Math.max(0, Math.min(100, health))}%`;
    this.hungerValueEl.textContent = String(Math.round(hunger));
    this.thirstValueEl.textContent = String(Math.round(thirst));
  }

  setMission(text: string): void {
    this.missionTextEl.textContent = text;
  }

  showToast(text: string): void {
    this.toastEl.textContent = text;
    this.toastEl.classList.remove('hidden');
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => this.toastEl.classList.add('hidden'), 2200);
  }
}
