export function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = "#081f18";
  ctx.fillRect(0, 0, w, h);

  const g = ctx.createRadialGradient(
    w * 0.52,
    h * 0.42,
    Math.min(w, h) * 0.1,
    w * 0.5,
    h * 0.55,
    Math.min(w, h) * 0.95
  );
  g.addColorStop(0, "rgba(90, 170, 120, 0.10)");
  g.addColorStop(0.55, "rgba(40, 110, 85, 0.08)");
  g.addColorStop(1, "rgba(0, 0, 0, 0.42)");

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}
