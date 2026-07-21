export type ItemCategory = 'resource' | 'consumable' | 'weapon' | 'gear';
export type EquipSlot = 'weapon' | 'helmet' | 'vest' | 'pants' | 'boots';

export interface ItemDef {
  id: string;
  name: string;
  icon: string;
  category: ItemCategory;
  maxStack: number;
  equipSlot?: EquipSlot;
  attack?: number;
  defense?: number;
  restoreHunger?: number;
  restoreThirst?: number;
  restoreHealth?: number;
}

export const ITEM_DEFS: Record<string, ItemDef> = {
  scrap: { id: 'scrap', name: 'Scrap Metal', icon: '\u{1F529}', category: 'resource', maxStack: 20 },
  cloth: { id: 'cloth', name: 'Cloth', icon: '\u{1F9F5}', category: 'resource', maxStack: 20 },
  cannedFood: {
    id: 'cannedFood',
    name: 'Canned Food',
    icon: '\u{1F96B}',
    category: 'consumable',
    maxStack: 10,
    restoreHunger: 35,
  },
  waterBottle: {
    id: 'waterBottle',
    name: 'Water Bottle',
    icon: '\u{1F4A7}',
    category: 'consumable',
    maxStack: 10,
    restoreThirst: 40,
  },
  medkit: {
    id: 'medkit',
    name: 'Med Kit',
    icon: '\u{1FA79}',
    category: 'consumable',
    maxStack: 5,
    restoreHealth: 40,
  },
  machete: {
    id: 'machete',
    name: 'Machete',
    icon: '\u{1F52A}',
    category: 'weapon',
    maxStack: 1,
    equipSlot: 'weapon',
    attack: 12,
  },
  helmet: {
    id: 'helmet',
    name: 'Scrap Helmet',
    icon: '\u{26D1}\u{FE0F}',
    category: 'gear',
    maxStack: 1,
    equipSlot: 'helmet',
    defense: 6,
  },
  vest: {
    id: 'vest',
    name: 'Padded Vest',
    icon: '\u{1F9BA}',
    category: 'gear',
    maxStack: 1,
    equipSlot: 'vest',
    defense: 10,
  },
  pants: {
    id: 'pants',
    name: 'Cargo Pants',
    icon: '\u{1F456}',
    category: 'gear',
    maxStack: 1,
    equipSlot: 'pants',
    defense: 4,
  },
  boots: {
    id: 'boots',
    name: 'Work Boots',
    icon: '\u{1F97E}',
    category: 'gear',
    maxStack: 1,
    equipSlot: 'boots',
    defense: 4,
  },
};

export const EQUIP_SLOT_ORDER: EquipSlot[] = ['weapon', 'helmet', 'vest', 'pants', 'boots'];
