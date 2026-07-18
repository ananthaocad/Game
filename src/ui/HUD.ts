export class HUD {
  private readonly woodValueEl: HTMLElement;
  private readonly selectionPanelEl: HTMLElement;
  private readonly hintEl: HTMLElement;

  constructor(root: HTMLElement) {
    root.innerHTML = `
      <div class="top-bar">
        <div class="resource-pill"><span class="icon">🪵</span><span id="wood-value">0</span></div>
      </div>
      <div class="hint" id="hint">Tap a villager, then tap a tree to gather</div>
      <div class="selection-panel hidden" id="selection-panel"></div>
    `;
    this.woodValueEl = root.querySelector('#wood-value')!;
    this.selectionPanelEl = root.querySelector('#selection-panel')!;
    this.hintEl = root.querySelector('#hint')!;

    window.setTimeout(() => {
      this.hintEl.style.opacity = '0';
    }, 6000);
  }

  setWood(amount: number): void {
    this.woodValueEl.textContent = String(amount);
  }

  setSelection(label: string | null): void {
    if (!label) {
      this.selectionPanelEl.classList.add('hidden');
      return;
    }
    this.selectionPanelEl.classList.remove('hidden');
    this.selectionPanelEl.textContent = label;
  }
}
