import type { Vec2 } from "./vec2";
import { v2, sub, len } from "./vec2";

function ang(v: Vec2) {
  return Math.atan2(v.y, v.x);
}
function fromAng(a: number) {
  return { x: Math.cos(a), y: Math.sin(a) };
}
function wrapPi(a: number) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}
function clamp(x: number, a: number, b: number) {
  return Math.max(a, Math.min(b, x));
}

/*
    Forward IK chain.
    Used as a "spine": head is positioned, the rest follows with bend limits.
*/ 
export class Chain {
  joints: Vec2[];
  angles: number[];
  segLen: number;
  maxBend: number;

  constructor(origin: Vec2, jointCount: number, segLen: number, maxBend: number) {
    this.segLen = segLen;
    this.maxBend = maxBend;
    this.joints = [];
    this.angles = [];

    for (let i = 0; i < jointCount; i++) this.joints.push({ x: origin.x, y: origin.y });
    for (let i = 0; i < jointCount; i++) this.angles.push(0);
  }

  setParams(segLen: number, maxBend: number) {
    this.segLen = segLen;
    this.maxBend = maxBend;
  }

  resolve(headTarget: Vec2) {
    const j = this.joints;

    // Head
    j[0].x = headTarget.x;
    j[0].y = headTarget.y;

    // Walk down the chain
    let prevDir = sub(j[0], j[1]);
    if (len(prevDir) < 1e-6) prevDir = v2(1, 0);
    let prevAngle = ang(prevDir);

    for (let i = 1; i < j.length; i++) {
      let desiredAngle = prevAngle;

      const curDir = sub(j[i - 1], j[i]);
      if (len(curDir) > 1e-6) desiredAngle = ang(curDir);

      const diff = wrapPi(desiredAngle - prevAngle);
      const clamped = prevAngle + clamp(diff, -this.maxBend, this.maxBend);

      const d = fromAng(clamped);
      j[i].x = j[i - 1].x - d.x * this.segLen;
      j[i].y = j[i - 1].y - d.y * this.segLen;

      prevAngle = clamped;
    }

    // Precompute angles (pointing toward the head)
    for (let i = 1; i < j.length; i++) {
      this.angles[i] = ang(sub(j[i - 1], j[i]));
    }
    this.angles[0] = this.angles[1];
  }
}
