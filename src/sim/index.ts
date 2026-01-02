export type { Fish, KoiPattern, KoiSpot, LilyPad, Ripple, Params, World } from "./types";

export { step, spawnRipple } from "./boids";

import { v2 } from "../vec2";
import { Chain } from "../chain";
import type { Params, World, Fish } from "./types";
import { makeKoiPattern, makePads } from "./gen";

/*
  Keep public constructors here so main stays clean.
*/
export function makeWorld(
  w: number,
  h: number,
  count: number,
  params: Pick<Params, "chainSegLen" | "chainMaxBend" | "maxSpeed">
): World {
  const fish: Fish[] = [];

  for (let i = 0; i < count; i++) {
    const pos = v2(Math.random() * w, Math.random() * h);
    const a = Math.random() * Math.PI * 2;

    const cruise = (0.55 + Math.random() * 0.35) * params.maxSpeed;
    const vel = v2(Math.cos(a) * cruise, Math.sin(a) * cruise);

    const chain = new Chain(pos, 12, params.chainSegLen, params.chainMaxBend);
    const koi = makeKoiPattern((Math.random() * 1e9) | 0);

    fish.push({ pos, vel, phase: Math.random() * Math.PI * 2, chain, koi, cruise });
  }

  const pads = makePads(w, h, ((Math.random() * 1e9) | 0) ^ 0xa5a5a5a5);
  return { w, h, fish, pads, ripples: [], goal: null, goalStrength: 0 };
}

export function setCount(
  world: World,
  count: number,
  params: Pick<Params, "chainSegLen" | "chainMaxBend" | "maxSpeed">
) {
  const cur = world.fish.length;
  if (count === cur) return;

  if (count > cur) {
    for (let i = cur; i < count; i++) {
      const pos = v2(Math.random() * world.w, Math.random() * world.h);
      const a = Math.random() * Math.PI * 2;

      const cruise = (0.55 + Math.random() * 0.35) * params.maxSpeed;
      const vel = v2(Math.cos(a) * cruise, Math.sin(a) * cruise);

      const chain = new Chain(pos, 12, params.chainSegLen, params.chainMaxBend);
      const koi = makeKoiPattern((Math.random() * 1e9) | 0);

      world.fish.push({ pos, vel, phase: Math.random() * Math.PI * 2, chain, koi, cruise });
    }
  } else {
    world.fish.length = count;
  }
}
