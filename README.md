# Ashfall

A mobile-first, web-based 3D exploration prototype built with Three.js,
using a painterly cel-shaded rendering style inspired by *Breath of the
Wild* / *Tears of the Kingdom* (soft gradient-ramp toon shading, fresnel
rim light, hand-painted-looking blotch textures, watercolor sky gradient),
reworked into a dusty post-apocalyptic wasteland palette.

## Current slice

A free-roam exploration + small-mission vertical slice:

- Fixed-angle orthographic (isometric) camera that follows the player;
  pinch/wheel to zoom
- Virtual joystick (touch) or WASD/arrow keys (desktop) move the survivor
  directly around a ruined wasteland scattered with rubble, broken walls,
  and dead trees
- Scavenge glowing artifacts scattered across the map by walking up to them
- Once every artifact is recovered, a signal beacon lights up in the
  distance — reach it to complete the mission
- HUD: artifact counter, mission objective banner, pickup/objective toasts

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
  core/       Game orchestration, camera rig, zoom input, movement input
  render/     Painterly toon material, sky dome, terrain generation
  entities/   Player, Artifact, Beacon, low-poly mesh factories
  ui/         HUD, virtual joystick
```

## Next steps

- More mission variety (timed objectives, escort/defend, fetch chains)
- Enemies/hazards to avoid or fight
- Persistent artifact/inventory collection across missions
- Fog of war / limited visibility for tension
- Save/load and a title screen
