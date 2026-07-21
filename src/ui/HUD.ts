export class HUD {
  private readonly artifactValueEl: HTMLElement;
  private readonly missionTextEl: HTMLElement;
  private readonly toastEl: HTMLElement;
  private readonly hintEl: HTMLElement;
  private toastTimer: number | undefined;

  constructor(root: HTMLElement) {
    root.innerHTML = `
      <div class="top-bar">
        <div class="resource-pill"><span class="icon">◆</span><span id="artifact-value">0/0</span></div>
      </div>
      <div class="mission-banner" id="mission-banner"></div>
      <div class="hint" id="hint">Drag the stick to move · Pinch or scroll to zoom</div>
      <div class="toast hidden" id="toast"></div>
    `;
    this.artifactValueEl = root.querySelector('#artifact-value')!;
    this.missionTextEl = root.querySelector('#mission-banner')!;
    this.hintEl = root.querySelector('#hint')!;
    this.toastEl = root.querySelector('#toast')!;

    window.setTimeout(() => {
      this.hintEl.style.opacity = '0';
    }, 6000);
  }

  setArtifactCount(found: number, total: number): void {
    this.artifactValueEl.textContent = `${found}/${total}`;
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
