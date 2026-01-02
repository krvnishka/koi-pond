import { v2 } from "../vec2";
import type { KoiPattern, KoiSpot, LilyPad } from "./types";
import { mulberry32 } from "./rng";

export function makeKoiPattern(seed: number): KoiPattern {
  const rnd = mulberry32(seed);

  const fin: "white" | "red" | "black" = rnd() < 0.65 ? "white" : rnd() < 0.88 ? "red" : "black";

  const spots: KoiSpot[] = [];
  const spotCount = 20 + Math.floor(rnd() * 10);

  for (let i = 0; i < spotCount; i++) {
    const u = Math.min(0.95, Math.max(0.05, rnd() ** 0.7));
    const v = (rnd() * 2 - 1) * 0.75;

    const rx = 0.7 + rnd() * 0.75;
    const ry = 0.6 + rnd() * 0.85;
    const rot = (rnd() * 2 - 1) * 0.9;

    const color: "red" | "black" = rnd() < 0.65 ? "red" : "black";
    spots.push({ u, v, rx, ry, rot, color });
  }

  return { base: "white", fin, spots };
}

export function makePads(w: number, h: number, seed: number): LilyPad[] {
  const rnd = mulberry32(seed);

  const pads: LilyPad[] = [];
  const targetCount = 5 + rnd() * 5;
  const maxTries = 9000;
  const edgePad = 10;
  const gap = 10;

  const fits = (x: number, y: number, r: number) => {
    for (const p of pads) {
      const dx = x - p.pos.x;
      const dy = y - p.pos.y;
      const rr = r + p.r + gap;
      if (dx * dx + dy * dy < rr * rr) return false;
    }
    return true;
  };

  for (let tries = 0; tries < maxTries && pads.length < targetCount; tries++) {
    const t = pads.length / Math.max(1, targetCount - 1);
    const rMax = 100 - t * 20;
    const rMin = 40;

    const r = rMin + rnd() * (rMax - rMin);

    const x = edgePad + r + rnd() * (w - 2 * (edgePad + r));
    const y = edgePad + r + rnd() * (h - 2 * (edgePad + r));

    if (!fits(x, y, r)) continue;

    pads.push({
      pos: v2(x, y),
      r,
      rot: (rnd() * 2 - 1) * Math.PI,
      notch: rnd() * Math.PI * 2,
      hue: rnd(),
      phase: rnd() * Math.PI * 2,
    });
  }

  return pads;
}
