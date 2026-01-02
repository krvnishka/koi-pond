import type { Vec2 } from "../vec2";

export function clamp(x: number, a: number, b: number) {
  return Math.max(a, Math.min(b, x));
}

/*
  Closed Catmull-Rom implemented as a Bezier chain.
  Used for fish outlines and fins.
*/
export function drawClosedCatmullRom(ctx: CanvasRenderingContext2D, pts: Vec2[], closed: boolean) {
  if (pts.length < 2) return;

  const p = pts;
  const n = p.length;

  const get = (i: number) => (closed ? p[(i + n) % n] : p[Math.max(0, Math.min(n - 1, i))]);

  ctx.beginPath();
  ctx.moveTo(p[0].x, p[0].y);

  for (let i = 0; i < n; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);

    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };

    ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, p2.x, p2.y);
    if (!closed && i === n - 2) break;
  }

  ctx.closePath();
}
