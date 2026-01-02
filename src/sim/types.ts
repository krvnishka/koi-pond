import type { Vec2 } from "../vec2";
import type { Chain } from "../chain";

export type Fish = {
  pos: Vec2;
  vel: Vec2;
  phase: number;
  chain: Chain;
  koi: KoiPattern;
  cruise: number;
};

export type KoiSpot = {
  u: number;
  v: number;
  rx: number;
  ry: number;
  rot: number;
  color: "red" | "black";
};

export type KoiPattern = {
  base: "white";
  fin: "white" | "red" | "black";
  spots: KoiSpot[];
};

export type LilyPad = {
  pos: Vec2;
  r: number;
  rot: number;
  notch: number;
  hue: number;
  phase: number;
};

export type Ripple = {
  center: Vec2;
  age: number;
};

export type Params = {
  count: number;

  neighborRadius: number;
  separationRadius: number;

  maxSpeed: number;
  maxForce: number;

  minSpeed: number;
  turnRate: number;
  fovDeg: number;

  wSep: number;
  wAli: number;
  wCoh: number;
  wGoal: number;

  wWander: number;

  chainSegLen: number;
  chainMaxBend: number;
  chainHeadLead: number;
};

export type World = {
  w: number;
  h: number;
  fish: Fish[];
  pads: LilyPad[];
  ripples: Ripple[];
  goal: Vec2 | null;
  goalStrength: number;
};
