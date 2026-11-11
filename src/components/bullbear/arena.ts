/**
 * Bulls vs Bears — a 3D arena where every fight prints a candle.
 *
 * A low-poly bull and bear circle each other on a round trading floor.
 * The bull paws the ground and charges, the bear rears up and catches the
 * horns, they lock and shove, and the shove drives a live candlestick on the
 * chart wall behind them. Then one side lands the decisive move:
 *   bull wins → it tosses the bear into a back-flip and the candle closes green
 *   bear wins → it slams down with both paws, the bull is knocked onto its
 *               side and the candle closes red
 * The winner celebrates, the loser gets up, and the next round begins.
 *
 * Purely decorative: the candles are an animation, not market data.
 */
import * as THREE from "three";

export type Side = "bull" | "bear";
export interface RoundInfo { round: number; winner: Side; bulls: number; bears: number }
export interface ArenaHandle { dispose(): void; back(side: Side | null): void; /** debug: freeze at a clock time */ seek(clock: number, side?: Side): void }

const T = 10; // seconds per round
const R = 2.7; // circling radius
const K = 28; // candles on the wall

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (e0: number, e1: number, x: number) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
const easeOut = (e0: number, e1: number, x: number) => { const t = clamp((x - e0) / (e1 - e0)); return 1 - (1 - t) * (1 - t); };

function cssColor(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  try { return new THREE.Color(v || fallback); } catch { return new THREE.Color(fallback); }
}

interface Actor {
  root: THREE.Group; // position + facing
  tumble: THREE.Group; // flips and rolls, pivot at body centre
  torso: THREE.Group; // rears up around the back hips
  head: THREE.Group;
  legs: THREE.Group[]; // FL, FR, BL, BR
  tail?: THREE.Group;
  body: THREE.MeshStandardMaterial;
  light: THREE.MeshStandardMaterial;
}

const mat = (c: THREE.ColorRepresentation, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: 0.55, metalness: 0.12, ...extra });

function mesh(geo: THREE.BufferGeometry, m: THREE.Material, pos: [number, number, number], scale?: [number, number, number]) {
  const o = new THREE.Mesh(geo, m);
  o.position.set(...pos);
  if (scale) o.scale.set(...scale);
  o.castShadow = true;
  return o;
}

function leg(len: number, rTop: number, rBot: number, m: THREE.Material, foot: THREE.Material, footKind: "hoof" | "paw") {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(rTop, rBot, len, 7), m, [0, -len / 2, 0]));
  if (footKind === "hoof") g.add(mesh(new THREE.CylinderGeometry(rBot * 1.05, rBot * 1.2, 0.14, 7), foot, [0, -len - 0.02, 0]));
  else g.add(mesh(new THREE.IcosahedronGeometry(rBot * 1.25, 0), foot, [0, -len, 0.05], [1, 0.75, 1.2]));
  return g;
}

function buildBull(): Actor {
  const body = mat("#22c55e"), light = mat("#86efac"), dark = mat("#1b1f2a"), ivory = mat("#f3ead7", { roughness: 0.35 }), gold = mat("#f2c14e", { metalness: 0.7, roughness: 0.3 });
  const root = new THREE.Group(), tumble = new THREE.Group(), torso = new THREE.Group(), head = new THREE.Group();
  tumble.position.y = 1; root.add(tumble);
  const inner = new THREE.Group(); inner.position.y = -1; tumble.add(inner);
  torso.position.set(0, 0.85, -0.55); inner.add(torso);
  const ico = new THREE.IcosahedronGeometry(1, 1);
  torso.add(mesh(ico, body, [0, 0.25, 0.6], [0.62, 0.55, 1.05]));
  torso.add(mesh(ico, body, [0, 0.42, 1.08], [0.62, 0.62, 0.55])); // shoulder hump
  head.position.set(0, 0.38, 1.6); torso.add(head);
  head.add(mesh(ico, body, [0, 0, 0.2], [0.36, 0.36, 0.46]));
  head.add(mesh(ico, light, [0, -0.14, 0.55], [0.3, 0.24, 0.22]));
  const ring = mesh(new THREE.TorusGeometry(0.1, 0.022, 6, 16), gold, [0, -0.3, 0.72]); ring.rotation.x = 0.3; head.add(ring);
  for (const s of [-1, 1]) {
    head.add(mesh(new THREE.SphereGeometry(0.05, 8, 6), dark, [s * 0.22, 0.1, 0.42]));
    head.add(mesh(ico, body, [s * 0.4, 0.12, 0.05], [0.16, 0.07, 0.1]));
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(s * 0.2, 0.2, 0.15), new THREE.Vector3(s * 0.5, 0.26, 0.2),
      new THREE.Vector3(s * 0.72, 0.5, 0.32), new THREE.Vector3(s * 0.66, 0.78, 0.46),
    ]);
    head.add(mesh(new THREE.TubeGeometry(curve, 16, 0.06, 7), ivory, [0, 0, 0]));
    const tip = mesh(new THREE.ConeGeometry(0.06, 0.2, 7), ivory, [s * 0.64, 0.86, 0.5]);
    tip.rotation.set(0.5, 0, -s * 0.15); head.add(tip);
  }
  const legs: THREE.Group[] = [];
  for (const [x, z, front] of [[-0.32, 1.15, true], [0.32, 1.15, true], [-0.32, -0.45, false], [0.32, -0.45, false]] as const) {
    const l = leg(0.85, front ? 0.12 : 0.15, 0.09, body, dark, "hoof");
    if (front) { l.position.set(x, 0.05, z); torso.add(l); } else { l.position.set(x, 0.9, z); inner.add(l); }
    legs.push(l);
  }
  const tail = new THREE.Group(); tail.position.set(0, 0.42, -0.42); torso.add(tail);
  tail.add(mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.7, 5), body, [0, -0.35, 0]));
  tail.add(mesh(new THREE.IcosahedronGeometry(0.08, 0), dark, [0, -0.72, 0]));
  tail.rotation.x = 0.35;
  return { root, tumble, torso, head, legs, tail, body, light };
}

function buildBear(): Actor {
  const body = mat("#ef4444"), light = mat("#fca5a5"), dark = mat("#1b1f2a"), claw = mat("#f3ead7");
  const root = new THREE.Group(), tumble = new THREE.Group(), torso = new THREE.Group(), head = new THREE.Group();
  tumble.position.y = 1; root.add(tumble);
  const inner = new THREE.Group(); inner.position.y = -1; tumble.add(inner);
  torso.position.set(0, 0.75, -0.5); inner.add(torso);
  const ico = new THREE.IcosahedronGeometry(1, 1);
  torso.add(mesh(ico, body, [0, 0.38, 0.5], [0.82, 0.8, 1.0]));
  head.position.set(0, 0.82, 1.3); torso.add(head);
  head.add(mesh(ico, body, [0, 0, 0], [0.5, 0.48, 0.48]));
  head.add(mesh(ico, light, [0, -0.1, 0.42], [0.25, 0.2, 0.26]));
  head.add(mesh(new THREE.SphereGeometry(0.08, 8, 6), dark, [0, -0.02, 0.66]));
  for (const s of [-1, 1]) {
    head.add(mesh(ico, body, [s * 0.32, 0.38, -0.05], [0.15, 0.15, 0.09]));
    head.add(mesh(ico, light, [s * 0.32, 0.38, 0.0], [0.08, 0.08, 0.05]));
    head.add(mesh(new THREE.SphereGeometry(0.05, 8, 6), dark, [s * 0.18, 0.12, 0.42]));
  }
  const legs: THREE.Group[] = [];
  for (const [x, z, front] of [[-0.52, 1.0, true], [0.52, 1.0, true], [-0.45, -0.45, false], [0.45, -0.45, false]] as const) {
    const l = leg(front ? 0.78 : 0.72, front ? 0.18 : 0.21, 0.15, body, front ? light : body, "paw");
    if (front) {
      for (const c of [-1, 0, 1]) { const cl = mesh(new THREE.ConeGeometry(0.03, 0.14, 4), claw, [c * 0.08, -0.82, 0.2]); cl.rotation.x = 1.3; l.add(cl); }
      l.position.set(x, 0.45, z); torso.add(l);
    } else { l.position.set(x, 0.8, z); inner.add(l); }
    legs.push(l);
  }
  return { root, tumble, torso, head, legs, body, light };
}

/** Tiny particle system for sparks and dust. */
class Particles {
  points: THREE.Points;
  private pos: Float32Array; private vel: Float32Array; private life: Float32Array; private col: Float32Array;
  private n: number; private next = 0; private gravity: number; private drag: number;
  constructor(n: number, size: number, gravity: number, drag: number) {
    this.n = n; this.gravity = gravity; this.drag = drag;
    this.pos = new Float32Array(n * 3).fill(-999); this.vel = new Float32Array(n * 3); this.life = new Float32Array(n); this.col = new Float32Array(n * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(this.col, 3));
    this.points = new THREE.Points(g, new THREE.PointsMaterial({ size, vertexColors: true, transparent: true, depthWrite: false, opacity: 0.95 }));
    this.points.frustumCulled = false;
  }
  emit(at: THREE.Vector3, count: number, speed: number, color: THREE.Color, up = 1) {
    for (let k = 0; k < count; k++) {
      const i = this.next = (this.next + 1) % this.n, j = i * 3;
      this.pos[j] = at.x; this.pos[j + 1] = at.y; this.pos[j + 2] = at.z;
      const th = Math.random() * Math.PI * 2, ph = Math.random() * Math.PI * 0.5, s = speed * (0.4 + Math.random() * 0.8);
      this.vel[j] = Math.cos(th) * Math.cos(ph) * s; this.vel[j + 1] = Math.sin(ph) * s * up; this.vel[j + 2] = Math.sin(th) * Math.cos(ph) * s;
      this.life[i] = 0.5 + Math.random() * 0.6;
      this.col[j] = color.r; this.col[j + 1] = color.g; this.col[j + 2] = color.b;
    }
  }
  update(dt: number) {
    for (let i = 0; i < this.n; i++) {
      if (this.life[i] <= 0) continue;
      const j = i * 3;
      this.life[i] -= dt;
      if (this.life[i] <= 0) { this.pos[j + 1] = -999; continue; }
      this.vel[j + 1] -= this.gravity * dt;
      const d = Math.exp(-this.drag * dt);
      this.vel[j] *= d; this.vel[j + 2] *= d;
      this.pos[j] += this.vel[j] * dt; this.pos[j + 1] += this.vel[j + 1] * dt; this.pos[j + 2] += this.vel[j + 2] * dt;
      if (this.pos[j + 1] < 0.14) { this.pos[j + 1] = 0.14; this.vel[j + 1] *= -0.3; }
      const f = clamp(this.life[i] * 2);
      this.col[j] *= 0.995 + 0.005 * f; this.col[j + 1] *= 0.995 + 0.005 * f; this.col[j + 2] *= 0.995 + 0.005 * f;
    }
    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.geometry.attributes.color.needsUpdate = true;
  }
}

interface Candle { o: number; c: number; h: number; l: number }

export function createArena(container: HTMLElement, onRound: (r: RoundInfo) => void, reducedMotion: boolean): ArenaHandle {
  let reduced = reducedMotion;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 11, 22);
  const camera = new THREE.PerspectiveCamera(34, 2, 0.1, 100);
  const look = new THREE.Vector3(0, 1.2, 0);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x222244, 1.1); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 2.0);
  key.position.set(3, 8, 6); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 25 });
  scene.add(key);
  const rimBull = new THREE.PointLight(0x22c55e, 18, 12); rimBull.position.set(-5, 3, 2); scene.add(rimBull);
  const rimBear = new THREE.PointLight(0xef4444, 18, 12); rimBear.position.set(5, 3, 2); scene.add(rimBear);

  // Trading floor
  const floorMat = mat("#0c1326", { roughness: 0.9, metalness: 0 });
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(4.3, 4.5, 0.26, 56), floorMat);
  floor.position.y = 0.01; floor.receiveShadow = true; scene.add(floor);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x3ee6a0 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(4.32, 0.045, 8, 120), ringMat);
  ring.rotation.x = Math.PI / 2; ring.position.y = 0.15; scene.add(ring);
  const grid = new THREE.PolarGridHelper(4.1, 16, 5, 64, 0x5b6880, 0x5b6880);
  grid.position.y = 0.145; (grid.material as THREE.Material).transparent = true; (grid.material as THREE.Material).opacity = 0.25; scene.add(grid);

  // Shockwave
  const waveMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
  const wave = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 48), waveMat);
  wave.rotation.x = -Math.PI / 2; wave.position.y = 0.16; scene.add(wave);
  let waveT = 99;
  const shock = (at: THREE.Vector3, color: THREE.Color) => { wave.position.x = at.x; wave.position.z = at.z; waveMat.color.copy(color); waveT = 0; };

  // Actors
  const bull = buildBull(), bear = buildBear();
  scene.add(bull.root, bear.root);

  const sparks = new Particles(260, 0.11, 6, 1.2);
  const dust = new Particles(220, 0.16, 1.2, 2.5);
  scene.add(sparks.points, dust.points);

  // Candle wall
  const posMat = mat("#22c55e", { emissiveIntensity: 0.35 }), negMat = mat("#ef4444", { emissiveIntensity: 0.35 });
  const wickGeo = new THREE.BoxGeometry(0.07, 1, 0.07), bodyGeo = new THREE.BoxGeometry(0.55, 1, 0.55);
  const candles: Candle[] = [];
  let p = 100;
  for (let i = 0; i < K; i++) {
    const o = p, c = o * (1 + (Math.random() - 0.42) * 0.03);
    candles.push({ o, c, h: Math.max(o, c) * (1 + Math.random() * 0.008), l: Math.min(o, c) * (1 - Math.random() * 0.008) });
    p = c;
  }
  const slots = Array.from({ length: K }, () => {
    const g = new THREE.Group();
    const b = new THREE.Mesh(bodyGeo, posMat), w = new THREE.Mesh(wickGeo, posMat);
    b.castShadow = true; g.add(b, w); scene.add(g);
    return { g, b, w };
  });
  let lo = 95, hi = 110, shift = 0, grow = 1;
  const TH0 = -1.2, TH1 = 1.2, step = (TH1 - TH0) / (K - 1), WR = 9;

  // Theme
  const theme = { pos: new THREE.Color(), neg: new THREE.Color(), amber: new THREE.Color(), muted: new THREE.Color(), line: new THREE.Color(), light: false };
  const applyTheme = () => {
    theme.pos.copy(cssColor("--pos", "#3ee6a0")); theme.neg.copy(cssColor("--neg", "#ff7f73"));
    theme.amber.copy(cssColor("--amber", "#f0bf5c")); theme.muted.copy(cssColor("--muted", "#92a0bb"));
    theme.line.copy(cssColor("--muted", "#92a0bb"));
    const bg = cssColor("--bg", "#070b17");
    theme.light = bg.r + bg.g + bg.b > 1.5;
    (scene.fog as THREE.Fog).color.copy(bg);
    floorMat.color.copy(cssColor("--surface", "#0c1326"));
    (grid.material as THREE.Material).dispose();
    grid.material = new THREE.LineBasicMaterial({ color: cssColor("--line", "#222e4c"), transparent: true, opacity: theme.light ? 0.9 : 0.6 });
    bull.body.color.copy(theme.pos).multiplyScalar(theme.light ? 1 : 0.8); bull.body.emissive.copy(theme.pos).multiplyScalar(0.12);
    bull.light.color.copy(theme.pos).lerp(new THREE.Color("#ffffff"), 0.5);
    bear.body.color.copy(theme.neg).multiplyScalar(theme.light ? 1 : 0.8); bear.body.emissive.copy(theme.neg).multiplyScalar(0.12);
    bear.light.color.copy(theme.neg).lerp(new THREE.Color("#ffffff"), 0.5);
    posMat.color.copy(theme.pos); posMat.emissive.copy(theme.pos);
    negMat.color.copy(theme.neg); negMat.emissive.copy(theme.neg);
    rimBull.color.copy(theme.pos); rimBear.color.copy(theme.neg);
    hemi.intensity = theme.light ? 1.6 : 1.1;
    const blend = theme.light ? THREE.NormalBlending : THREE.AdditiveBlending;
    (sparks.points.material as THREE.PointsMaterial).blending = blend;
    (sparks.points.material as THREE.Material).needsUpdate = true;
  };
  applyTheme();
  const retheme = () => { applyTheme(); if (reduced) renderer.render(scene, camera); };
  const mo = new MutationObserver(retheme);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-accent", "class"] });
  const mq = window.matchMedia("(prefers-color-scheme: light)");
  mq.addEventListener?.("change", retheme);

  // Round state
  let bias: Side | null = null;
  let round = -1, winner: Side = "bull", score = { bulls: 0, bears: 0 }, decided = false, aStart = 0;
  const flags = { impact: false, land: false, slam: false };
  let momentum = 0, shake = 0;
  let live: Candle = candles[K - 1];

  const pickWinner = (): Side => {
    const pBull = bias === "bull" ? 0.72 : bias === "bear" ? 0.28 : 0.55;
    return Math.random() < pBull ? "bull" : "bear";
  };

  const startRound = (r: number) => {
    round = r; aStart = (r % 2) * Math.PI - 1.2; winner = pickWinner(); decided = false;
    flags.impact = flags.land = flags.slam = false;
    const o = candles[K - 1].c;
    live = { o, c: o, h: o, l: o };
    candles.shift(); candles.push(live);
    // recycle the oldest slot as the newest
    slots.push(slots.shift()!);
    shift = 1; grow = 0;
  };

  const dir = (a: number) => new THREE.Vector3(Math.cos(a), 0, Math.sin(a));

  /** Push offset along the fight axis during the lock (positive = toward the bear). */
  const push = (t: number) => {
    const u = t - 4.3;
    const w = winner === "bull" ? 1 : -1;
    return 0.32 * Math.sin(u * 5.1) * Math.sin(u * 1.7 + 0.4) + w * 0.28 * smooth(4.3, 6.3, t);
  };

  /** Signed positions of each actor along the axis, plus height, before recovery. */
  const axial = (t: number) => {
    let bx: number, rx: number, by = 0, ry = 0;
    if (t < 3.6) { bx = -R; rx = R; }
    else if (t < 4.3) { const k = Math.pow((t - 3.6) / 0.7, 2); bx = lerp(-R, -0.95, k); rx = lerp(R, 0.75, smooth(3.6, 4.3, t)); }
    else if (t < 6.3) { const q = push(t); bx = -0.95 + q; rx = 0.75 + q; }
    else {
      const q = push(6.3);
      bx = -0.95 + q; rx = 0.75 + q;
      if (winner === "bull") {
        const k = easeOut(6.3, 7.3, t);
        rx += 2.3 * k; ry = 1.9 * 4 * k * (1 - k);
        bx += 0.5 * easeOut(6.3, 6.8, t);
      } else {
        const k = easeOut(7.0, 7.8, t);
        bx -= 2.1 * k;
        rx -= 0.25 * smooth(6.8, 7.0, t);
      }
    }
    return { bx, rx, by, ry };
  };

  const gait = (a: Actor, phase: number, amp: number) => {
    const s = Math.sin(phase) * amp;
    a.legs[0].rotation.x = s; a.legs[3].rotation.x = s;
    a.legs[1].rotation.x = -s; a.legs[2].rotation.x = -s;
  };

  const tmp = new THREE.Vector3();

  const pose = (t: number, now: number) => {
    const aFight = aStart + 1.2, aNext = aFight + Math.PI - 1.2;
    let a = t < 2.6 ? aStart + smooth(0, 2.6, t) * 1.2 : aFight;
    let { bx, rx, by, ry } = axial(Math.min(t, 8.6));
    let bullPos: THREE.Vector3, bearPos: THREE.Vector3;
    if (t >= 8.6) {
      const k = smooth(8.6, 10, t);
      a = lerp(aFight, aNext, k);
      const fromB = dir(aFight).multiplyScalar(bx), fromR = dir(aFight).multiplyScalar(rx);
      bullPos = fromB.lerp(dir(aNext).multiplyScalar(-R), k);
      bearPos = fromR.lerp(dir(aNext).multiplyScalar(R), k);
      by = 0; ry = 0;
    } else {
      const d = dir(t < 2.6 ? a : aFight);
      bullPos = d.clone().multiplyScalar(t < 2.6 ? -R : bx);
      bearPos = d.clone().multiplyScalar(t < 2.6 ? R : rx);
    }

    // reset joints
    for (const act of [bull, bear]) {
      act.torso.rotation.set(0, 0, 0); act.head.rotation.set(0, 0, 0); act.tumble.rotation.set(0, 0, 0);
      act.legs.forEach((l) => l.rotation.set(0, 0, 0));
    }

    // ── Bull ──
    let bullBob = 0;
    if (t < 2.6) { gait(bull, now * 8, 0.35); bullBob = Math.abs(Math.sin(now * 8)) * 0.04; }
    else if (t < 3.6) {
      bull.legs[1].rotation.x = -0.25 + Math.sin(t * 16) * 0.55; // paw the ground
      bull.head.rotation.x = 0.4 * smooth(2.6, 3.4, t);
      bull.torso.rotation.x = 0.06 * smooth(2.6, 3.4, t);
      if (Math.sin(t * 16) > 0.95) { bull.legs[1].getWorldPosition(tmp); tmp.y = 0.2; dust.emit(tmp, 3, 1.4, theme.muted); }
    } else if (t < 4.3) {
      gait(bull, now * 20, 0.8); bull.head.rotation.x = 0.55; bullBob = Math.abs(Math.sin(now * 20)) * 0.08;
      if (Math.random() < 0.5) { tmp.copy(bullPos); tmp.y = 0.2; dust.emit(tmp, 2, 1.2, theme.muted); }
    } else if (t < 6.3) {
      gait(bull, now * 26, 0.25); bull.head.rotation.x = 0.5 + Math.sin(now * 9) * 0.08; bull.torso.rotation.x = 0.08;
    } else if (winner === "bull") {
      const toss = smooth(6.3, 6.6, t) - smooth(7.4, 8.6, t);
      bull.head.rotation.x = lerp(0.5, -0.6, toss);
      if (t > 7.4 && t < 8.6) { // victory rear
        const r = Math.sin(((t - 7.4) / 1.2) * Math.PI);
        bull.torso.rotation.x = -0.55 * r;
        bull.legs[0].rotation.x = -0.9 * r + Math.sin(now * 14) * 0.3 * r;
        bull.legs[1].rotation.x = -0.9 * r - Math.sin(now * 14) * 0.3 * r;
        bull.legs[2].rotation.x = 0.35 * r; bull.legs[3].rotation.x = 0.35 * r;
      }
    } else {
      // knocked onto its side, then back up
      const down = smooth(7.0, 7.6, t) - smooth(8.7, 9.5, t);
      bull.tumble.rotation.z = 1.45 * down;
      bull.head.rotation.x = 0.5 * (1 - smooth(7.0, 7.4, t));
      by = -0.28 * down;
      bull.legs.forEach((l, i) => (l.rotation.x = Math.sin(now * 12 + i) * 0.25 * down));
    }
    if (t >= 8.6) gait(bull, now * 8, 0.35 * (winner === "bear" ? smooth(9.3, 9.6, t) : 1));
    if (bull.tail) bull.tail.rotation.set(0.35 + Math.sin(now * 3) * 0.1, Math.sin(now * 4.3) * 0.5, 0);

    // ── Bear ──
    let bearBob = 0;
    if (t < 2.6) { gait(bear, now * 7, 0.3); bearBob = Math.abs(Math.sin(now * 7)) * 0.05; }
    else if (t < 4.3) {
      const rear = smooth(2.6, 3.4, t);
      bear.torso.rotation.x = -0.6 * rear;
      const wave = Math.sin(now * 6) * 0.3 * rear;
      bear.legs[0].rotation.x = -1.4 * rear + wave; bear.legs[1].rotation.x = -1.4 * rear - wave;
      bear.legs[0].rotation.z = -0.2 * rear; bear.legs[1].rotation.z = 0.2 * rear;
      bear.head.rotation.x = 0.25 * rear;
    } else if (t < 6.3) {
      bear.torso.rotation.x = -0.32 + Math.sin(now * 9) * 0.04;
      bear.legs[0].rotation.set(-1.25, 0, 0.35); bear.legs[1].rotation.set(-1.25, 0, -0.35); // grip the horns
      bear.head.rotation.x = 0.3;
      bear.legs[2].rotation.x = Math.sin(now * 24) * 0.2; bear.legs[3].rotation.x = -Math.sin(now * 24) * 0.2;
    } else if (winner === "bull") {
      // flung into a back-flip, lands on its back, rolls up
      const flip = easeOut(6.3, 7.3, t);
      const roll = smooth(8.4, 9.6, t);
      bear.tumble.rotation.x = -Math.PI * flip - Math.PI * roll;
      const onBack = smooth(7.2, 7.4, t) * (1 - roll);
      ry = Math.max(ry, 0) - 0.15 * onBack;
      bear.legs.forEach((l, i) => (l.rotation.x = -0.6 * flip * (1 - roll) + Math.sin(now * 10 + i) * 0.3 * onBack));
    } else {
      // the slam, then chest-beating
      const lift = smooth(6.3, 6.8, t), slam = smooth(6.8, 7.0, t), cheer = smooth(7.4, 7.7, t) * (1 - smooth(8.4, 8.9, t));
      bear.torso.rotation.x = lerp(lerp(-0.32, -0.95, lift), 0.18, slam) * (1 - cheer) + -0.7 * cheer;
      const arms = lerp(lerp(-1.25, -2.7, lift), -0.4, slam);
      const beat = Math.sin(now * 16) * 0.5 * cheer;
      bear.legs[0].rotation.x = arms * (1 - cheer) + (-1.6 + beat) * cheer;
      bear.legs[1].rotation.x = arms * (1 - cheer) + (-1.6 - beat) * cheer;
      bear.legs[0].rotation.z = 0.5 * cheer; bear.legs[1].rotation.z = -0.5 * cheer;
      bear.head.rotation.x = -0.3 * cheer + Math.sin(now * 8) * 0.1 * cheer;
    }
    if (t >= 8.6 && winner === "bear") gait(bear, now * 7, 0.3 * smooth(8.8, 9.2, t));
    if (t >= 9.6 && winner === "bull") gait(bear, now * 7, 0.3);

    bull.root.position.set(bullPos.x, by + bullBob, bullPos.z);
    bear.root.position.set(bearPos.x, ry + bearBob, bearPos.z);
    bull.root.rotation.y = Math.PI / 2 - a;
    bear.root.rotation.y = Math.PI / 2 - a + Math.PI;
    return { a: t < 2.6 ? a : aFight, bx, rx };
  };

  const contact = new THREE.Vector3();
  const events = (t: number, a: number, bx: number, rx: number) => {
    const d = dir(a);
    contact.copy(d).multiplyScalar((bx + rx) / 2 + 0.05); contact.y = 1.45;
    if (t >= 4.3 && !flags.impact) {
      flags.impact = true; shake = 0.35;
      sparks.emit(contact, 70, 5.5, theme.amber); sparks.emit(contact, 20, 4, new THREE.Color("#ffffff"));
      shock(contact, theme.amber);
    }
    if (t > 4.3 && t < 6.3 && Math.random() < 0.18) sparks.emit(contact, 4, 3, theme.amber);
    if (t >= 6.3 && !decided) {
      decided = true;
      if (winner === "bull") score.bulls++; else score.bears++;
      onRound({ round: round + 1, winner, ...score });
    }
    if (winner === "bull" && t >= 7.3 && !flags.land) {
      flags.land = true; shake = 0.3;
      tmp.copy(d).multiplyScalar(rx); tmp.y = 0.2;
      dust.emit(tmp, 50, 3, theme.muted); shock(tmp, theme.pos);
    }
    if (winner === "bear" && t >= 7.0 && !flags.slam) {
      flags.slam = true; shake = 0.5;
      tmp.copy(d).multiplyScalar(bx + 0.4); tmp.y = 0.2;
      dust.emit(tmp, 60, 3.4, theme.muted); sparks.emit(contact.setY(0.8), 40, 4.5, theme.neg); shock(tmp, theme.neg);
    }
    if (winner === "bear" && t > 7.0 && t < 7.8 && Math.random() < 0.6) { bull.root.getWorldPosition(tmp); tmp.y = 0.2; dust.emit(tmp, 2, 1.5, theme.muted); }
  };

  const updateCandles = (t: number, dt: number) => {
    // the live candle follows the fight
    const sign = winner === "bull" ? 1 : -1;
    let ratio = 0;
    if (t >= 4.3 && t < 6.3) ratio = (push(t) / 0.6) * 0.012;
    else if (t >= 6.3) ratio = lerp(push(6.3) / 0.6 * 0.012, sign * (0.012 + ((round * 7919) % 10) / 1000), easeOut(6.3, 7.4, t));
    live.c = live.o * (1 + ratio);
    live.h = Math.max(live.h, live.c * 1.002); live.l = Math.min(live.l, live.c * 0.998);

    shift = Math.max(0, shift - dt * 1.4);
    grow = Math.min(1, grow + dt * 1.2);
    let mn = Infinity, mx = -Infinity;
    for (const c of candles) { mn = Math.min(mn, c.l); mx = Math.max(mx, c.h); }
    lo = lerp(lo, mn, clamp(dt * 2)); hi = lerp(hi, mx, clamp(dt * 2));
    const span = Math.max(hi - lo, 1e-6);
    const y = (v: number) => 0.4 + ((v - lo) / span) * 3.6;
    for (let i = 0; i < K; i++) {
      const c = candles[i], s = slots[i];
      const th = TH0 + (i + shift) * step;
      s.g.position.set(Math.sin(th) * WR, 0, -Math.cos(th) * WR + 1.2);
      s.g.rotation.y = -th;
      const up = c.c >= c.o, m = up ? posMat : negMat;
      s.b.material = m; s.w.material = m;
      const g = i === K - 1 ? grow : 1;
      const bh = Math.max(Math.abs(y(c.c) - y(c.o)), 0.06) * g;
      s.b.scale.set(1, bh, 1); s.b.position.y = (y(c.c) + y(c.o)) / 2;
      s.w.scale.set(1, Math.max(y(c.h) - y(c.l), 0.06) * g, 1); s.w.position.y = (y(c.h) + y(c.l)) / 2;
      s.g.visible = th < TH1 + step * 0.5;
    }
  };

  // Camera + pointer parallax
  let px = 0, py = 0, tpx = 0, tpy = 0, dist = 11;
  const onMove = (e: PointerEvent) => {
    const r = container.getBoundingClientRect();
    tpx = ((e.clientX - r.left) / r.width - 0.5) * 2; tpy = ((e.clientY - r.top) / r.height - 0.5) * 2;
  };
  const onLeave = () => { tpx = 0; tpy = 0; };
  container.addEventListener("pointermove", onMove);
  container.addEventListener("pointerleave", onLeave);

  const resize = () => {
    const w = container.clientWidth, h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    dist = camera.aspect < 1.6 ? 11 * Math.pow(1.6 / camera.aspect, 0.85) : 11;
    const fog = scene.fog as THREE.Fog; fog.near = dist; fog.far = dist + 12;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize); ro.observe(container); resize();

  let clock = 0, last = performance.now(), raf = 0, running = false, visible = true, inView = false;

  let forced: Side | null = null;
  const frame = (nowMs: number) => {
    const dt = clamp((nowMs - last) / 1000, 0, 0.05); last = nowMs;
    clock += dt;
    tick(dt);
    if (running) raf = requestAnimationFrame(frame);
  };
  const tick = (dt: number, draw = true) => {
    const r = Math.floor(clock / T), t = clock - r * T;
    if (r !== round) { startRound(r); if (forced) winner = forced; }
    const { a, bx, rx } = pose(t, clock);
    events(t, a, bx, rx);
    updateCandles(t, dt);
    sparks.update(dt); dust.update(dt);

    // momentum ring
    const target = t >= 4.3 && t < 6.3 ? clamp(push(t) / 0.5, -1, 1) : t >= 6.3 && t < 9 ? (winner === "bull" ? 1 : -1) : 0;
    momentum = lerp(momentum, target, clamp(dt * 3));
    ringMat.color.copy(theme.line).lerp(momentum >= 0 ? theme.pos : theme.neg, Math.min(1, Math.abs(momentum) * 1.3));

    if (waveT < 0.8) { waveT += dt; const k = waveT / 0.8; wave.scale.setScalar(0.3 + k * 4); waveMat.opacity = 0.8 * (1 - k); }
    else waveMat.opacity = 0;

    shake = Math.max(0, shake - dt * 1.2);
    px = lerp(px, tpx, clamp(dt * 3)); py = lerp(py, tpy, clamp(dt * 3));
    const lockZoom = smooth(4.0, 4.4, t) * (1 - smooth(6.2, 7.0, t));
    const orbit = Math.sin(clock * 0.12) * 0.35 + px * 0.35;
    const dd = dist - lockZoom * 1.4;
    camera.position.set(Math.sin(orbit) * dd + (Math.random() - 0.5) * shake, 3.4 - py * 0.8 + (Math.random() - 0.5) * shake, Math.cos(orbit) * dd);
    camera.lookAt(look);
    if (draw) renderer.render(scene, camera);
  };

  const sync = () => {
    const should = visible && inView && !reduced;
    if (should && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
    if (!should && running) { running = false; cancelAnimationFrame(raf); }
  };
  const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }, { threshold: 0.05 });
  io.observe(container);
  const onVis = () => { visible = document.visibilityState === "visible"; sync(); };
  document.addEventListener("visibilitychange", onVis);

  if (reduced) {
    // one still frame: locked horns mid-fight
    clock = 5.0; startRound(0);
    winner = "bull";
    const { a, bx, rx } = pose(5.0, 5.0);
    void a; void bx; void rx;
    updateCandles(5.0, 1);
    camera.position.set(0, 3.4, dist); camera.lookAt(look);
    renderer.render(scene, camera);
  }

  return {
    back(side) { bias = side; },
    seek(c, side) {
      running = false; cancelAnimationFrame(raf); reduced = true;
      forced = side ?? null; round = -1; clock = Math.floor(c / T) * T;
      const n = Math.round((c - clock) / 0.02);
      for (let x = 0; x <= n; x++) { tick(0.02, x === n); if (x < n) clock += 0.02; }
    },
    dispose() {
      running = false; cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect(); mo.disconnect();
      mq.removeEventListener?.("change", retheme);
      document.removeEventListener("visibilitychange", onVis);
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mm = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mm)) mm.forEach((x) => x.dispose()); else mm?.dispose?.();
      });
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
