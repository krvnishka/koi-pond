type Mote = { x: number; y: number; vx: number; vy: number; s: number; a: number };

let motes: Mote[] = [];
let lastW = 0;
let lastH = 0;

function initMotes(w: number, h: number, count = 140) {
  motes = [];
  for (let i = 0; i < count; i++) {
    motes.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() * 2 - 1) * 6,
      vy: (Math.random() * 2 - 1) * 6,
      s: 0.6 + Math.random() * 1.6,
      a: 0.05 + Math.random() * 0.1,
    });
  }
}

/*
  Lightweight "dust motes".
*/
export function drawMotes(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  // Reinit if first run or canvas size changed a lot
  if (motes.length === 0 || Math.abs(w - lastW) > 40 || Math.abs(h - lastH) > 40) {
    lastW = w;
    lastH = h;
    initMotes(w, h, 140);
  }

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  for (const m of motes) {
    const wx = Math.sin(time * 0.35 + m.x * 0.01) * 2.0;
    const wy = Math.cos(time * 0.3 + m.y * 0.01) * 2.0;

    m.x += (m.vx + wx) * 0.016;
    m.y += (m.vy + wy) * 0.016;

    if (m.x < 0) m.x += w;
    if (m.x >= w) m.x -= w;
    if (m.y < 0) m.y += h;
    if (m.y >= h) m.y -= h;

    ctx.globalAlpha = m.a;
    ctx.fillStyle = "rgba(220,255,230,1)";
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.s, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
