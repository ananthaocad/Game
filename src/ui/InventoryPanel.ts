import { Inventory, POCKET_SLOTS, BACKPACK_SLOTS } from '../core/Inventory';
import { ITEM_DEFS, EQUIP_SLOT_ORDER, type EquipSlot } from '../data/items';

export interface InventoryPanelCallbacks {
  /** Applies a consumable's hunger/thirst/health restore to the player; called before the item is removed. */
  onConsume: (itemId: string) => void;
}

const EQUIP_SLOT_PLACEHOLDER_ICONS: Record<EquipSlot, string> = {
  weapon: '\u{1F5E1}\u{FE0F}',
  helmet: '\u{26D1}\u{FE0F}',
  vest: '\u{1F9BA}',
  pants: '\u{1F456}',
  boots: '\u{1F97E}',
};

/** Grid inventory + equip-slot modal, modeled on the ad's loot/gear screen. */
export class InventoryPanel {
  private readonly overlayEl: HTMLElement;
  private readonly equipColumnEl: HTMLElement;
  private readonly actionBarEl: HTMLElement;
  private readonly statsFooterEl: HTMLElement;
  private selectedIndex: number | null = null;
  private isOpen_ = false;

  constructor(
    root: HTMLElement,
    private readonly inventory: Inventory,
    private readonly callbacks: InventoryPanelCallbacks
  ) {
    this.overlayEl = document.createElement('div');
    this.overlayEl.className = 'inventory-overlay hidden';
    this.overlayEl.innerHTML = `
      <div class="inventory-card">
        <div class="inventory-header">
          <span>SUPPLIES</span>
          <button class="icon-btn" id="inv-close">✕</button>
        </div>
        <div class="inventory-body">
          <div class="inventory-grid-area">
            <div class="slot-label">Pockets</div>
            <div class="slot-grid" id="pocket-grid"></div>
            <div class="slot-label">Backpack</div>
            <div class="slot-grid" id="backpack-grid"></div>
          </div>
          <div class="equip-column" id="equip-column"></div>
        </div>
        <div class="action-bar hidden" id="action-bar"></div>
        <div class="stats-footer" id="stats-footer"></div>
      </div>
    `;
    root.appendChild(this.overlayEl);

    this.equipColumnEl = this.overlayEl.querySelector('#equip-column')!;
    this.actionBarEl = this.overlayEl.querySelector('#action-bar')!;
    this.statsFooterEl = this.overlayEl.querySelector('#stats-footer')!;

    this.overlayEl.querySelector('#inv-close')!.addEventListener('click', () => this.close());
    this.overlayEl.addEventListener('click', (e) => {
      if (e.target === this.overlayEl) this.close();
    });
  }

  get isOpen(): boolean {
    return this.isOpen_;
  }

  open(): void {
    this.isOpen_ = true;
    this.overlayEl.classList.remove('hidden');
    this.refresh();
  }

  close(): void {
    this.isOpen_ = false;
    this.overlayEl.classList.add('hidden');
    this.selectedIndex = null;
  }

  toggle(): void {
    if (this.isOpen_) this.close();
    else this.open();
  }

  refresh(): void {
    this.renderSlotGrid('#pocket-grid', 0, POCKET_SLOTS);
    this.renderSlotGrid('#backpack-grid', POCKET_SLOTS, POCKET_SLOTS + BACKPACK_SLOTS);
    this.renderEquipColumn();
    this.renderActionBar();
    this.renderStatsFooter();
  }

  private renderSlotGrid(selector: string, start: number, end: number): void {
    const container = this.overlayEl.querySelector(selector)!;
    container.innerHTML = '';
    for (let i = start; i < end; i++) {
      const slot = this.inventory.slots[i];
      const el = document.createElement('button');
      el.className = 'slot' + (i === this.selectedIndex ? ' selected' : '');
      if (slot) {
        const def = ITEM_DEFS[slot.itemId];
        const qty = slot.quantity > 1 ? `<span class="slot-qty">${slot.quantity}</span>` : '';
        el.innerHTML = `<span class="slot-icon">${def.icon}</span>${qty}`;
      }
      el.addEventListener('click', () => this.selectSlot(i));
      container.appendChild(el);
    }
  }

  private renderEquipColumn(): void {
    this.equipColumnEl.innerHTML = '';
    for (const equipSlot of EQUIP_SLOT_ORDER) {
      const itemId = this.inventory.equipment[equipSlot];
      const el = document.createElement('button');
      el.className = 'equip-slot';
      const icon = itemId ? ITEM_DEFS[itemId].icon : EQUIP_SLOT_PLACEHOLDER_ICONS[equipSlot];
      el.innerHTML = `<span class="slot-icon${itemId ? '' : ' empty'}">${icon}</span>`;
      el.addEventListener('click', () => {
        if (!itemId) return;
        this.inventory.unequip(equipSlot);
        this.refresh();
      });
      this.equipColumnEl.appendChild(el);
    }
  }

  private selectSlot(index: number): void {
    this.selectedIndex = this.selectedIndex === index ? null : index;
    this.refresh();
  }

  private renderActionBar(): void {
    const slot = this.selectedIndex !== null ? this.inventory.slots[this.selectedIndex] : null;
    if (!slot) {
      this.actionBarEl.classList.add('hidden');
      this.actionBarEl.innerHTML = '';
      return;
    }

    const index = this.selectedIndex!;
    const def = ITEM_DEFS[slot.itemId];
    this.actionBarEl.classList.remove('hidden');
    this.actionBarEl.innerHTML = `<span class="action-item-name">${def.name}</span>`;

    if (def.equipSlot) {
      this.addActionButton('EQUIP', () => {
        this.inventory.equip(index);
        this.selectedIndex = null;
        this.refresh();
      });
    } else if (def.category === 'consumable') {
      const label = def.restoreHealth ? 'APPLY' : def.restoreThirst && !def.restoreHunger ? 'DRINK' : 'EAT';
      this.addActionButton(label, () => {
        this.callbacks.onConsume(slot.itemId);
        this.inventory.removeFromSlot(index, 1);
        this.selectedIndex = null;
        this.refresh();
      });
    }

    if (slot.quantity > 1) {
      this.addActionButton('SPLIT', () => {
        this.inventory.split(index);
        this.refresh();
      });
    }

    this.addActionButton('DROP', () => {
      this.inventory.removeFromSlot(index, slot.quantity);
      this.selectedIndex = null;
      this.refresh();
    });
  }

  private addActionButton(label: string, handler: () => void): void {
    const btn = document.createElement('button');
    btn.className = 'action-btn';
    btn.textContent = label;
    btn.addEventListener('click', handler);
    this.actionBarEl.appendChild(btn);
  }

  private renderStatsFooter(): void {
    this.statsFooterEl.innerHTML = `
      <span>⚔️ ${this.inventory.totalAttack}</span>
      <span>\u{1F6E1}️ ${this.inventory.totalDefense}</span>
      <span>\u{1F392} ${this.inventory.usedSlots}/${this.inventory.totalSlots}</span>
    `;
  }
}
