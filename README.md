# Ashfall

A mobile-first, web-based 3D exploration prototype built with Three.js,
using a painterly cel-shaded rendering style inspired by *Breath of the
Wild* / *Tears of the Kingdom* (soft gradient-ramp toon shading, fresnel
rim light, hand-painted-looking blotch textures, watercolor sky gradient),
reworked into a dusty post-apocalyptic wasteland palette.

## Current slice

A free-roam exploration + scavenge-and-gear-up vertical slice, modeled on
the loot loop mobile survival-game ads promise (grid inventory, equip
slots, hunger/thirst/health) rather than a bare collectible counter:

- Fixed-angle orthographic (isometric) camera that follows the player;
  pinch/wheel to zoom
- Virtual joystick (touch) or WASD/arrow keys (desktop) move the survivor
  directly around a ruined wasteland scattered with rubble, broken walls,
  and dead trees
- Health, hunger, and thirst drain over time; starving on either drains
  health
- Scavenge crates and gear cases scattered across the map by walking up to
  them — resources, food/water/medkits, a weapon, and armor pieces
- A grid inventory (pockets + backpack) with stacking, splitting, and a
  five-slot equip paperdoll (weapon/helmet/vest/pants/boots); equipping
  gear raises attack/defense, consumables restore hunger/thirst/health
- Once every drop is scavenged, a signal beacon lights up in the
  distance — reach it to complete the mission
- HUD: health/hunger/thirst readouts, backpack button opening the
  inventory sheet, mission objective banner, pickup/objective toasts

## Develop

```bash
npm install
npm run dev
```

Open the printed local URL; append `--host` behaviour is already on via
`vite.config.ts` (`server.host: true`) so you can test on a phone on the
same network at `http://<your-lan-ip>:5173`.

## Build

```bash
npm run build
npm run preview
```

## Project layout

```
src/
  core/       Game orchestration, camera rig, zoom input, movement input,
              Inventory (grid + equip slots)
  data/       Item definitions (icons, stack sizes, equip/stat effects)
  render/     Painterly toon material, sky dome, terrain generation
  entities/   Player (with survival stats), Loot, Beacon, mesh factories
  ui/         HUD, virtual joystick, InventoryPanel
```

## Next steps

- More mission variety (timed objectives, escort/defend, fetch chains)
- Enemies/hazards to avoid or fight, weapon durability
- Crafting recipes that consume resources into gear
- Fog of war / limited visibility for tension
- Save/load and a title screen
