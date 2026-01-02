import type { Vec2 } from "../vec2";
import type { Ripple } from "../sim";

export function drawGoal(ctx: CanvasRenderingContext2D, p: Vec2, t: number) {
  const pulse = 0.5 + 0.5 * Math.sin(t * 4);

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.globalAlpha = 0.7;

  ctx.beginPath();
  ctx.arc(0, 0, 6 + pulse * 2, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(210, 255, 220, 0.85)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, 16 + pulse * 4, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(180, 255, 210, 0.20)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

export function drawRipple(ctx: CanvasRenderingContext2D, rp: Ripple) {
  const life = 1.2;
  const t = Math.min(1, rp.age / life);
  const r = 8 + t * 80;
  const alpha = (1 - t) * 0.45;

  ctx.save();
  ctx.translate(rp.center.x, rp.center.y);

  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(210, 255, 220, 0.55)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.globalAlpha = alpha * 0.6;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(210, 255, 220, 0.45)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}
