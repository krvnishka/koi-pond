import type { World } from "../sim";
import { drawBackground } from "./background";
import { drawMotes } from "./motes";
import { drawRipple, drawGoal } from "./fx";
import { drawFishKoi, drawFishWake } from "./fish";
import { drawLilyPad, drawPadRipples } from "./lilypads";

export type RenderOpts = { time: number };

export function render(ctx: CanvasRenderingContext2D, world: World, opts: RenderOpts) {
  const { w, h } = world;
  const t = opts.time;

  drawBackground(ctx, w, h);
  drawMotes(ctx, w, h, t);

  for (const rp of world.ripples) drawRipple(ctx, rp);

  for (const f of world.fish) drawFishKoi(ctx, f);
  for (const f of world.fish) drawFishWake(ctx, f, t);

  for (const p of world.pads) drawLilyPad(ctx, p.pos, p.r, p.rot, p.notch, p.hue, p.phase, t);
  for (const p of world.pads) drawPadRipples(ctx, p.pos, p.r, p.phase, t);

  if (world.goal) drawGoal(ctx, world.goal, t);
}
