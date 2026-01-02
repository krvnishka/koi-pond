import "./style.css";
import { makeWorld, setCount, spawnRipple, step } from "./sim";
import type { Params } from "./sim";
import { render } from "./render";
import { v2 } from "./vec2";

const canvas = document.getElementById("c") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const params: Params = {
  count: 20,
  neighborRadius: 70,
  separationRadius: 35,

  minSpeed: 55,
  maxSpeed: 140,
  maxForce: 220,

  wSep: 1.6,
  wAli: 0.7,
  wCoh: 0.6,
  wGoal: 0.9,

  wWander: 0.15,

  chainSegLen: 16,
  chainMaxBend: Math.PI / 8,
  chainHeadLead: 16,

  turnRate: Math.PI * 1.4,
  fovDeg: 270,
};

let world = makeWorld(800, 600, params.count, params);

function resize() {
  const oldW = world.w;
  const oldH = world.h;

  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  world.w = window.innerWidth;
  world.h = window.innerHeight;

  // scale pads + fish positions to new size
  if (oldW > 0 && oldH > 0) {
    const sx = world.w / oldW;
    const sy = world.h / oldH;

    for (const p of world.pads) {
      p.pos.x *= sx;
      p.pos.y *= sy;
    }

    for (const f of world.fish) {
      f.pos.x *= sx;
      f.pos.y *= sy;
      for (const j of f.chain.joints) {
        j.x *= sx;
        j.y *= sy;
      }
    }
  }
}

window.addEventListener("resize", resize);
resize();

function canvasPos(ev: MouseEvent | Touch) {
  const rect = canvas.getBoundingClientRect();
  return v2(ev.clientX - rect.left, ev.clientY - rect.top);
}

canvas.addEventListener("mousedown", (e) => {
  const p = canvasPos(e);
  world.goal = p;
  world.goalStrength = 1;
  spawnRipple(world, p);
});

canvas.addEventListener(
  "touchstart",
  (e) => {
    const t = e.touches[0];
    if (!t) return;
    const p = canvasPos(t);
    world.goal = p;
    world.goalStrength = 1;
    spawnRipple(world, p);
  },
  { passive: true }
);

function bindRange(id: string, onValue: (v: number) => void) {
  const el = document.getElementById(id) as HTMLInputElement;
  const out = document.getElementById(id + "Val") as HTMLSpanElement;

  const set = () => {
    const v = Number(el.value);
    out.textContent = String(v);
    onValue(v);
  };

  el.addEventListener("input", set);
  set();
}

bindRange("count", (v) => {
  params.count = v;
  setCount(world, v, params);
});

bindRange("speed", (v) => {
  params.maxSpeed = v;
  for (const f of world.fish) {
    f.cruise = Math.max(params.minSpeed, Math.min(params.maxSpeed, f.cruise));
  }
});

bindRange("goal", (v) => (params.wGoal = v / 100));
bindRange("sep", (v) => (params.wSep = v / 100));
bindRange("ali", (v) => (params.wAli = v / 100));
bindRange("coh", (v) => (params.wCoh = v / 100));

let last = performance.now();
function loop(now: number) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;

  step(world, dt, params, now / 1000);
  render(ctx, world, { time: now / 1000 });

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
