import type { Vec2 } from "../vec2";
import type { Fish } from "../sim";
import { clamp, drawClosedCatmullRom } from "./geom";

function drawFinEllipse(ctx: CanvasRenderingContext2D, p: Vec2, rot: number, w: number, h: number) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.5, h * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function drawFishWake(ctx: CanvasRenderingContext2D, f: Fish, time: number) {
  const vx = f.vel.x;
  const vy = f.vel.y;
  const sp = Math.hypot(vx, vy);
  if (sp < 40) return;

  const ang = Math.atan2(vy, vx);
  const bx = Math.cos(ang + Math.PI);
  const by = Math.sin(ang + Math.PI);

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = Math.min(0.14, 0.05 + sp / 1800);

  const baseLen = 14 + (sp / 140) * 10;
  const wig = 0.9 * Math.sin(time * 2.2 + f.phase);

  for (let i = 0; i < 2; i++) {
    const off = (i === 0 ? -1 : 1) * (6 + (sp / 140) * 2);
    const nx = Math.cos(ang + Math.PI / 2) * off;
    const ny = Math.sin(ang + Math.PI / 2) * off;

    const x0 = f.pos.x + nx;
    const y0 = f.pos.y + ny;

    ctx.beginPath();
    ctx.moveTo(x0, y0);

    const x1 = x0 + bx * baseLen * 0.6 + Math.cos(ang + Math.PI / 2) * wig * 2;
    const y1 = y0 + by * baseLen * 0.6 + Math.sin(ang + Math.PI / 2) * wig * 2;

    const x2 = x0 + bx * baseLen * 1.2;
    const y2 = y0 + by * baseLen * 1.2;

    ctx.quadraticCurveTo(x1, y1, x2, y2);

    ctx.strokeStyle = "rgba(210, 255, 220, 0.85)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }

  ctx.restore();
}

export function drawFishKoi(ctx: CanvasRenderingContext2D, f: Fish) {
  const j = f.chain.joints;
  const a = f.chain.angles;
  if (!j || j.length < 12) return;

  const KOI = {
    white: "rgba(246, 241, 230, 1)",
    red: "rgba(228,  91,  44, 1)",
    black: "rgba( 20,  20,  22, 1)",
  };

  const bodyBase = KOI.white;
  const finKey = f.koi?.fin ?? "white";
  const finColor = finKey === "red" ? KOI.red : finKey === "black" ? KOI.black : KOI.white;
  const strokeColor = "rgba(255,255,255,0.70)";

  const baseWidths = [68, 81, 84, 83, 77, 64, 51, 38, 32, 19];
  const scale = 0.22;
  const bodyWidth = baseWidths.map((w) => w * scale);

  const getPos = (i: number, angleOffset: number, lengthOffset: number) => {
    const w = (bodyWidth[i] ?? bodyWidth[bodyWidth.length - 1]) + lengthOffset;
    const ang = a[i] + angleOffset;
    return { x: j[i].x + Math.cos(ang) * w, y: j[i].y + Math.sin(ang) * w };
  };

  const relDiff = (x: number, y: number) => {
    let d = y - x;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  };

  const headToMid1 = relDiff(a[0], a[6]);
  const headToMid2 = relDiff(a[0], a[7]);
  const headToTail = headToMid1 + relDiff(a[6], a[11]);

  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.lineWidth = 2;
  ctx.strokeStyle = strokeColor;

  // fins
  ctx.save();
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = finColor;

  drawFinEllipse(ctx, getPos(3, Math.PI / 3, 0), a[2] - Math.PI / 4, 160 * scale, 64 * scale);
  drawFinEllipse(ctx, getPos(3, -Math.PI / 3, 0), a[2] + Math.PI / 4, 160 * scale, 64 * scale);
  drawFinEllipse(ctx, getPos(7, Math.PI / 2, 0), a[6] - Math.PI / 4, 96 * scale, 32 * scale);
  drawFinEllipse(ctx, getPos(7, -Math.PI / 2, 0), a[6] + Math.PI / 4, 96 * scale, 32 * scale);

  // tail fin
  {
    const tailPts: Vec2[] = [];
    for (let i = 8; i < 12; i++) {
      const tailWidth = 1.5 * headToTail * (i - 8) * (i - 8);
      tailPts.push({
        x: j[i].x + Math.cos(a[i] - Math.PI / 2) * tailWidth,
        y: j[i].y + Math.sin(a[i] - Math.PI / 2) * tailWidth,
      });
    }
    for (let i = 11; i >= 8; i--) {
      const tailWidth = clamp(headToTail * 6, -13, 13);
      tailPts.push({
        x: j[i].x + Math.cos(a[i] + Math.PI / 2) * tailWidth,
        y: j[i].y + Math.sin(a[i] + Math.PI / 2) * tailWidth,
      });
    }
    drawClosedCatmullRom(ctx, tailPts, true);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();

  // body outline
  {
    const outline: Vec2[] = [];
    for (let i = 0; i < 10; i++) outline.push(getPos(i, Math.PI / 2, 0));
    outline.push(getPos(9, Math.PI, 0));
    for (let i = 9; i >= 0; i--) outline.push(getPos(i, -Math.PI / 2, 0));

    const w0 = bodyWidth[0];
    const archAng = 0.35;
    const archFwd = w0 * 0.35;
    const tipFwd = w0 * 0.5;

    outline.push(getPos(0, -archAng, archFwd));
    outline.push(getPos(0, 0, tipFwd));
    outline.push(getPos(0, archAng, archFwd));

    outline.push(getPos(0, Math.PI / 2, 0));
    outline.push(getPos(1, Math.PI / 2, 0));
    outline.push(getPos(2, Math.PI / 2, 0));

    drawClosedCatmullRom(ctx, outline, true);

    ctx.fillStyle = bodyBase;
    ctx.fill();

    // spots
    ctx.save();
    ctx.clip();

    const spots = f.koi?.spots;
    if (spots?.length) {
      for (const sp of spots) {
        const idx = Math.max(0, Math.min(9, Math.floor(sp.u * 10)));
        const p = j[idx];
        const ang = a[idx];

        const nx = Math.cos(ang + Math.PI / 2);
        const ny = Math.sin(ang + Math.PI / 2);

        const w = bodyWidth[idx] ?? bodyWidth[0];
        const cx = p.x + nx * sp.v * w * 0.9;
        const cy = p.y + ny * sp.v * w * 0.9;

        const rx = w * sp.rx;
        const ry = w * sp.ry;

        const stamps = 2 + ((idx * 131 + Math.floor(sp.u * 997)) % 3);
        for (let s = 0; s < stamps; s++) {
          const jitterA = (s - (stamps - 1) / 2) * 0.35;
          const jitterR = 0.25 + s * 0.1;

          ctx.save();
          ctx.translate(
            cx + Math.cos(ang + jitterA) * rx * 0.25 * jitterR,
            cy + Math.sin(ang + jitterA) * ry * 0.25 * jitterR
          );
          ctx.rotate(ang + sp.rot + jitterA);

          ctx.beginPath();
          ctx.ellipse(0, 0, rx * (0.9 - s * 0.12), ry * (0.9 - s * 0.12), 0, 0, Math.PI * 2);
          ctx.fillStyle = sp.color === "red" ? KOI.red : KOI.black;
          ctx.fill();

          ctx.restore();
        }
      }
    }

    ctx.restore();

    drawClosedCatmullRom(ctx, outline, true);
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
  }

  // eyes
  {
    ctx.fillStyle = "rgba(255,255,255,0.90)";
    const e1 = getPos(0, Math.PI / 2, -18 * scale);
    const e2 = getPos(0, -Math.PI / 2, -18 * scale);
    const r = 24 * scale * 0.42;

    ctx.beginPath();
    ctx.arc(e1.x, e1.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(e2.x, e2.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // dorsal fin
  ctx.fillStyle = finColor;
  {
    const p4 = j[4],
      p5 = j[5],
      p6 = j[6],
      p7 = j[7];

    ctx.save();
    ctx.globalAlpha = 0.72;

    ctx.beginPath();
    ctx.moveTo(p4.x, p4.y);
    ctx.bezierCurveTo(p5.x, p5.y, p6.x, p6.y, p7.x, p7.y);

    const c1 = {
      x: p6.x + Math.cos(a[6] + Math.PI / 2) * headToMid2 * 16 * scale,
      y: p6.y + Math.sin(a[6] + Math.PI / 2) * headToMid2 * 16 * scale,
    };
    const c2 = {
      x: p5.x + Math.cos(a[5] + Math.PI / 2) * headToMid1 * 16 * scale,
      y: p5.y + Math.sin(a[5] + Math.PI / 2) * headToMid1 * 16 * scale,
    };

    ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, p4.x, p4.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}
