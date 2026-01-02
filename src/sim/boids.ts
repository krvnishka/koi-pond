import type { Vec2 } from "../vec2";
import { v2, add, sub, mul, len2, norm, clampLen } from "../vec2";
import type { Fish, Params, World } from "./types";

function clamp(x: number, a: number, b: number) {
  return Math.max(a, Math.min(b, x));
}

function rotate(v: Vec2, ang: number): Vec2 {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  return { x: v.x * c - v.y * s, y: v.x * s + v.y * c };
}

function steerTowards(currentVel: Vec2, desiredVel: Vec2, maxForce: number): Vec2 {
  return clampLen(sub(desiredVel, currentVel), maxForce);
}

/*
  Rotate current direction toward desired direction by at most maxAng.
*/
function turnTowardDir(currentVel: Vec2, desiredDir: Vec2, maxAng: number): Vec2 {
  const cv2 = len2(currentVel);
  if (cv2 < 1e-8) return norm(desiredDir);

  const curDir = norm(currentVel);
  const dd = norm(desiredDir);

  const d = clamp(curDir.x * dd.x + curDir.y * dd.y, -1, 1);
  const ang = Math.acos(d);
  if (ang < 1e-6) return dd;

  const cross = curDir.x * dd.y - curDir.y * dd.x;
  const sign = cross < 0 ? -1 : 1;

  const step = Math.min(maxAng, ang);
  return rotate(curDir, sign * step);
}

/*
  Smoothly pushes fish away from edges before they collide
*/
function steerFromEdges(pos: Vec2, w: number, h: number, margin: number): Vec2 {
  let fx = 0;
  let fy = 0;

  if (pos.x < margin) fx += (margin - pos.x) / margin;
  else if (pos.x > w - margin) fx -= (pos.x - (w - margin)) / margin;

  if (pos.y < margin) fy += (margin - pos.y) / margin;
  else if (pos.y > h - margin) fy -= (pos.y - (h - margin)) / margin;

  return { x: fx, y: fy };
}

/*
  Hard bounce as a safety net (should be rare if edge steering is strong enough)
*/
function bounceIfHit(f: Fish, w: number, h: number, pad = 2) {
  if (f.pos.x < pad) {
    f.pos.x = pad;
    f.vel.x = Math.abs(f.vel.x);
  } else if (f.pos.x > w - pad) {
    f.pos.x = w - pad;
    f.vel.x = -Math.abs(f.vel.x);
  }

  if (f.pos.y < pad) {
    f.pos.y = pad;
    f.vel.y = Math.abs(f.vel.y);
  } else if (f.pos.y > h - pad) {
    f.pos.y = h - pad;
    f.vel.y = -Math.abs(f.vel.y);
  }
}

export function step(world: World, dt: number, params: Params, time: number) {
  const { fish } = world;

  // goal (click) decays
  world.goalStrength = Math.max(0, world.goalStrength - dt * 0.8);
  if (world.goalStrength === 0) world.goal = null;

  const rN = params.neighborRadius;
  const rN2 = rN * rN;
  const rS = params.separationRadius;
  const rS2 = rS * rS;

  const cosHalfFov = Math.cos(((params.fovDeg * Math.PI) / 180) * 0.5);
  const maxTurn = params.turnRate * dt;

  // ripples
  for (const rp of world.ripples) rp.age += dt;
  world.ripples = world.ripples.filter((r) => r.age < 1.2);

  for (let i = 0; i < fish.length; i++) {
    const f = fish[i];

    let sumW = 0;
    let center = v2(0, 0);
    let avgVel = v2(0, 0);
    let sep = v2(0, 0);

    const fwd = len2(f.vel) > 1e-6 ? norm(f.vel) : v2(1, 0);

    for (let j = 0; j < fish.length; j++) {
      if (i === j) continue;
      const o = fish[j];

      const dx = o.pos.x - f.pos.x;
      const dy = o.pos.y - f.pos.y;

      const d2 = dx * dx + dy * dy;
      if (d2 > rN2 || d2 < 1e-9) continue;

      const d = Math.sqrt(d2);

      // FOV
      const dirTo = { x: dx / d, y: dy / d };
      const front = fwd.x * dirTo.x + fwd.y * dirTo.y;
      if (front < cosHalfFov) continue;

      // Distance falloff weight
      const w = 1 - d / rN;
      sumW += w;

      center.x += o.pos.x * w;
      center.y += o.pos.y * w;

      avgVel.x += o.vel.x * w;
      avgVel.y += o.vel.y * w;

      // Separation: inverse-square inside separation radius
      if (d2 < rS2) {
        const inv = 1 / (d2 + 8);
        sep.x -= dx * inv;
        sep.y -= dy * inv;
      }
    }

    let acc = v2(0, 0);

    // Cohesion / alignment / separation
    if (sumW > 0) {
      center.x /= sumW;
      center.y /= sumW;
      avgVel.x /= sumW;
      avgVel.y /= sumW;

      const desiredC = mul(norm(sub(center, f.pos)), params.maxSpeed);
      const desiredA = mul(norm(avgVel), params.maxSpeed);
      const desiredS = mul(norm(sep), params.maxSpeed);

      acc = add(acc, mul(steerTowards(f.vel, desiredS, params.maxForce), params.wSep));
      acc = add(acc, mul(steerTowards(f.vel, desiredA, params.maxForce), params.wAli));
      acc = add(acc, mul(steerTowards(f.vel, desiredC, params.maxForce), params.wCoh));
    }

    // Click goal
    if (world.goal) {
      const desiredG = mul(norm(sub(world.goal, f.pos)), params.maxSpeed);
      acc = add(
        acc,
        mul(steerTowards(f.vel, desiredG, params.maxForce), params.wGoal * world.goalStrength)
      );
    }

    // Tiny "life" vector so schools don’t feel robotic
    if (params.wWander > 0) {
      const wv = v2(Math.cos(time * 1.1 + f.phase), Math.sin(time * 1.1 + f.phase));
      acc = add(acc, mul(wv, params.wWander * params.maxForce));
    }

    // Edge avoidance
    {
      const margin = 140;
      const edge = steerFromEdges(f.pos, world.w, world.h, margin);
      if (edge.x !== 0 || edge.y !== 0) {
        const desiredE = mul(norm(edge), params.maxSpeed);
        const edgeSteer = steerTowards(f.vel, desiredE, params.maxForce);
        acc = add(acc, mul(edgeSteer, 1.15));
      }
    }

    // Integrate accel
    const nextVel = add(f.vel, mul(acc, dt));

    // Speed control
    const speedNow = Math.sqrt(len2(nextVel));
    const target = clamp(f.cruise, params.minSpeed, params.maxSpeed);
    const k = 1 - Math.exp(-dt * 1.8);
    const speed = clamp(speedNow + (target - speedNow) * k, params.minSpeed, params.maxSpeed);

    // Turn limiting for nicer arcs
    const desiredDir = len2(nextVel) > 1e-8 ? norm(nextVel) : fwd;
    const limitedDir = turnTowardDir(f.vel, desiredDir, maxTurn);

    f.vel = mul(limitedDir, speed);
    f.pos = add(f.pos, mul(f.vel, dt));

    bounceIfHit(f, world.w, world.h, 2);

    // Update chain (spine)
    f.chain.setParams(params.chainSegLen, params.chainMaxBend);
    const forward = norm(f.vel);
    const headTarget = add(f.pos, mul(forward, params.chainHeadLead));
    f.chain.resolve(headTarget);
  }
}

export function spawnRipple(world: World, p: Vec2) {
  world.ripples.push({ center: { x: p.x, y: p.y }, age: 0 });
}
