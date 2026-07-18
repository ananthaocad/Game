# Dune & Dominion

A mobile-first, web-based 3D strategy/RPG prototype built with Three.js,
using a painterly cel-shaded rendering style inspired by *Breath of the
Wild* / *Tears of the Kingdom* (soft gradient-ramp toon shading, fresnel
rim light, hand-painted-looking blotch textures, watercolor sky gradient).

## Current slice

An Age-of-Empires-style economy loop vertical slice:

- Fixed-angle orthographic (isometric) camera — drag to pan, pinch/wheel to zoom
- Tap a villager to select it, tap a tree to send it gathering, tap the
  ground to move it
- Villager walks to the tree, chops, carries wood back to the town
  center, and repeats until the tree is depleted
- Wood counter HUD

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
  core/       Game orchestration, camera rig, input handling
  render/     Painterly toon material, sky dome, terrain generation
  entities/   Villager, Tree, TownCenter, low-poly mesh factories
  ui/         HUD
```

## Next steps

- More unit types (soldier, scout) and combat
- Buildings you can place (barracks, farm) and a build menu
- Fog of war
- Multiple resources (food, gold, stone) and a simple tech tree
- Save/load and a title screen
