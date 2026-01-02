import type { Vec2 } from "../vec2";

export function drawLilyPad(
  ctx: CanvasRenderingContext2D,
  p: Vec2,
  r: number,
  rot: number,
  notch: number,
  hue: number,
  phase: number,
  time: number
) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(rot);

  // shadow
  ctx.globalAlpha = 0.22;
  ctx.beginPath();
  ctx.ellipse(2, 3, r * 1.02, r * 0.92, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.9)";
  ctx.fill();

  const gap = 0.35;
  const wob = 0.5 + 0.5 * Math.sin(time * 0.6 + phase);

  ctx.globalAlpha = 0.95;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, r, notch + gap, notch - gap, false);
  ctx.closePath();

  const light = 70 + hue * 20;
  const dark = 35 + hue * 10;

  const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.2, 0, 0, r * 1.1);
  grad.addColorStop(0, `rgba(${20}, ${light}, ${50}, 0.95)`);
  grad.addColorStop(1, `rgba(${10}, ${dark}, ${30}, 0.95)`);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = "rgba(10, 40, 25, 0.45)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // veins
  ctx.globalAlpha = 0.28;
  ctx.strokeStyle = "rgba(210, 255, 220, 0.35)";
  ctx.lineWidth = 1.2;

  const veins = 6;
  for (let i = 0; i < veins; i++) {
    const a = notch + (i / (veins - 1) - 0.5) * (Math.PI * 1.1);
    const rr = r * (0.35 + 0.55 * wob);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(
      Math.cos(a) * rr * 0.35,
      Math.sin(a) * rr * 0.35,
      Math.cos(a) * rr,
      Math.sin(a) * rr
    );
    ctx.stroke();
  }

  ctx.restore();
}

export function drawPadRipples(ctx: CanvasRenderingContext2D, p: Vec2, r: number, phase: number, time: number) {
  const ringCount = 3;
  const speed = 4;
  const maxSpan = 70;
  const base = r + 10;

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.globalCompositeOperation = "screen";

  for (let k = 0; k < ringCount; k++) {
    const t = (time * speed + k * (maxSpan / ringCount) + phase * 20) % maxSpan;

    const rr = base + t;
    const fade = 1 - t / maxSpan;

    ctx.globalAlpha = 0.12 * fade;
    ctx.beginPath();
    ctx.arc(0, 0, rr, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(200, 255, 210, 0.85)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }

  ctx.restore();
}
