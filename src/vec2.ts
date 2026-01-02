export type Vec2 = { x: number; y: number };

export const v2 = (x = 0, y = 0): Vec2 => ({ x, y });

export const add = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y });
export const mul = (a: Vec2, s: number): Vec2 => ({ x: a.x * s, y: a.y * s });

export const len2 = (a: Vec2): number => a.x * a.x + a.y * a.y;
export const len = (a: Vec2): number => Math.hypot(a.x, a.y);

export const norm = (a: Vec2): Vec2 => {
  const l = len(a);
  return l > 1e-8 ? { x: a.x / l, y: a.y / l } : { x: 0, y: 0 };
};

export const clampLen = (a: Vec2, maxL: number): Vec2 => {
  const l = len(a);
  if (l <= maxL) return a;
  const s = maxL / (l || 1);
  return { x: a.x * s, y: a.y * s };
};

export const dot = (a: Vec2, b: Vec2): number => a.x * b.x + a.y * b.y;

export const lerp = (a: Vec2, b: Vec2, t: number): Vec2 => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});
