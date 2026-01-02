![Koi Pond demo](assets/banner.gif)

# Koi Pond

A relaxing koi pond simulation with schooling behavior, ripples, and lily pads - built with TypeScript + Canvas.

## Features
- Schooling / flocking behavior (separation, alignment, cohesion)
- Click / tap to place a goal + ripple
- Procedural koi rendering (spots + fins)
- Simple IK “spine” chain for smooth fish body motion
- UI sliders to tune the simulation live

## Controls
- **Click / tap**: place a goal (the school is attracted toward it)
- Use the sliders to adjust:
  - Fish count
  - Speed
  - Goal strength
  - Separation / alignment / cohesion weights

## Getting started

### Install
```bash
npm install
```

## Run dev
```
npm run dev
```

# Build 
```
npm run build
```

## Preview build
```
npm run preview
```

## Project structure
- `src/main.ts`: app bootstrap, resize, input + UI wiring, main loop
- `src/sim.ts`: simulation (steering behaviors, goal, ripples, bounds)
- `src/render.ts`: drawing (pond, ripples, lily pads, koi)
- `src/chain.ts`: simple forward IK chain for the fish spine
- `src/vec2.ts`: tiny vector math helpers

## Notes
This project is meant to be playful and tweakable. If you change the flocking weights, you’ll get very different “personalities” from the school.

