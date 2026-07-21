import { EQUIP_SLOT_ORDER, ITEM_DEFS, type EquipSlot } from '../data/items';

export interface InventorySlot {
  itemId: string;
  quantity: number;
}

export const POCKET_SLOTS = 5;
export const BACKPACK_SLOTS = 15;
const TOTAL_SLOTS = POCKET_SLOTS + BACKPACK_SLOTS;

/** Grid-based item storage plus the five equip slots, mirroring the ad's loot loop. */
export class Inventory {
  readonly slots: (InventorySlot | null)[] = new Array(TOTAL_SLOTS).fill(null);
  readonly equipment: Record<EquipSlot, string | null> = {
    weapon: null,
    helmet: null,
    vest: null,
    pants: null,
    boots: null,
  };

  /** Stacks into existing slots first, then fills empty ones. Returns how much didn't fit. */
  add(itemId: string, quantity: number): number {
    const def = ITEM_DEFS[itemId];
    let remaining = quantity;

    for (const slot of this.slots) {
      if (remaining <= 0) break;
      if (slot && slot.itemId === itemId && slot.quantity < def.maxStack) {
        const take = Math.min(def.maxStack - slot.quantity, remaining);
        slot.quantity += take;
        remaining -= take;
      }
    }

    for (let i = 0; i < this.slots.length && remaining > 0; i++) {
      if (!this.slots[i]) {
        const take = Math.min(def.maxStack, remaining);
        this.slots[i] = { itemId, quantity: take };
        remaining -= take;
      }
    }

    return remaining;
  }

  removeFromSlot(index: number, quantity = 1): void {
    const slot = this.slots[index];
    if (!slot) return;
    slot.quantity -= quantity;
    if (slot.quantity <= 0) this.slots[index] = null;
  }

  /** Splits a stack roughly in half into the first free slot. No-op below 2 items or with no free slot. */
  split(index: number): void {
    const slot = this.slots[index];
    if (!slot || slot.quantity < 2) return;
    const freeIndex = this.slots.findIndex((s) => s === null);
    if (freeIndex === -1) return;

    const moved = Math.floor(slot.quantity / 2);
    slot.quantity -= moved;
    this.slots[freeIndex] = { itemId: slot.itemId, quantity: moved };
  }

  /** Moves a weapon/gear item from a slot into its equip slot, returning the previously equipped item there (if any). */
  equip(index: number): void {
    const slot = this.slots[index];
    if (!slot) return;
    const def = ITEM_DEFS[slot.itemId];
    if (!def.equipSlot) return;

    const previousItemId = this.equipment[def.equipSlot];
    this.equipment[def.equipSlot] = slot.itemId;
    this.removeFromSlot(index, 1);
    if (previousItemId) this.add(previousItemId, 1);
  }

  unequip(equipSlot: EquipSlot): void {
    const itemId = this.equipment[equipSlot];
    if (!itemId) return;
    this.equipment[equipSlot] = null;
    this.add(itemId, 1);
  }

  get totalAttack(): number {
    const weaponId = this.equipment.weapon;
    return weaponId ? (ITEM_DEFS[weaponId].attack ?? 0) : 1;
  }

  get totalDefense(): number {
    return EQUIP_SLOT_ORDER.reduce((sum, slot) => {
      const itemId = this.equipment[slot];
      return sum + (itemId ? (ITEM_DEFS[itemId].defense ?? 0) : 0);
    }, 0);
  }

  get usedSlots(): number {
    return this.slots.filter((s) => s !== null).length;
  }

  get totalSlots(): number {
    return TOTAL_SLOTS;
  }
}
