// physics.jsx — verlet-style AABB physics + dependency tracking
// Custom engine because:
// - We need axis-aligned rigid rects with stable resting stacks (Matter's circular contacts add rotation we don't want)
// - We need to know which blocks rest ON which other blocks each frame for dependency math
// - Wobble/squash on impact is simulated via a separate visual "deform" channel, not real soft-body

const PHYS = {
  GRAVITY: 1800,        // px/s^2
  DAMPING: 0.985,       // velocity multiplier per second of "air"
  REST_EPS: 4,          // velocity below this counts as "at rest"
  MAX_DT: 1 / 30,
  SUB_STEPS: 4,         // collision iterations per frame
  WALL_BOUNCE: 0.18,
  FLOOR_BOUNCE: 0.22,
  BLOCK_BOUNCE: 0.08,
  FRICTION: 0.82,       // tangential velocity multiplier on contact
};

class PhysicsWorld {
  constructor(width, height) {
    this.w = width;
    this.h = height;
    this.bodies = new Map(); // id -> body
    this.gravityOn = true;
    this.snapEnabled = false;
    this.gridSize = 20;
    this.onSettle = null;
  }

  setBounds(w, h) { this.w = w; this.h = h; }

  add(body) {
    // body: { id, x, y, w, h, vx, vy, mass, fixed, ax, ay (angle for visual wobble) }
    const b = {
      vx: 0, vy: 0, ax: 0, av: 0, mass: 1, fixed: false,
      restingOn: new Set(), supports: new Set(),
      sleepFrames: 0, justImpacted: 0, deform: 0, deformV: 0,
      ...body,
    };
    this.bodies.set(b.id, b);
    return b;
  }

  remove(id) {
    const b = this.bodies.get(id);
    if (!b) return;
    // Anything resting on this body needs to unstick
    for (const sup of b.supports) {
      const s = this.bodies.get(sup);
      if (s) s.restingOn.delete(id);
    }
    for (const r of b.restingOn) {
      const o = this.bodies.get(r);
      if (o) o.supports.delete(id);
    }
    this.bodies.delete(id);
  }

  get(id) { return this.bodies.get(id); }

  // AABB overlap (returns penetration + axis)
  _overlap(a, b) {
    const ax1 = a.x, ay1 = a.y, ax2 = a.x + a.w, ay2 = a.y + a.h;
    const bx1 = b.x, by1 = b.y, bx2 = b.x + b.w, by2 = b.y + b.h;
    const ox = Math.min(ax2, bx2) - Math.max(ax1, bx1);
    const oy = Math.min(ay2, by2) - Math.max(ay1, by1);
    if (ox <= 0 || oy <= 0) return null;
    return { ox, oy };
  }

  step(dt) {
    dt = Math.min(dt, PHYS.MAX_DT);
    const bodies = [...this.bodies.values()];

    // 1. Integrate
    for (const b of bodies) {
      // Visual deform spring (not part of collision)
      b.deformV += (-b.deform * 60 - b.deformV * 8) * dt;
      b.deform += b.deformV * dt;

      if (b.fixed || b.dragging) continue;
      if (this.gravityOn) b.vy += PHYS.GRAVITY * dt;
      // Air damping
      const damp = Math.pow(PHYS.DAMPING, dt * 60);
      b.vx *= damp;
      b.vy *= damp;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
    }

    // 2. Collide (multiple iterations for stable stacking)
    for (let iter = 0; iter < PHYS.SUB_STEPS; iter++) {
      // Walls + floor
      for (const b of bodies) {
        if (b.fixed) continue;
        if (b.x < 0) { b.x = 0; if (b.vx < 0) b.vx = -b.vx * PHYS.WALL_BOUNCE; }
        if (b.x + b.w > this.w) { b.x = this.w - b.w; if (b.vx > 0) b.vx = -b.vx * PHYS.WALL_BOUNCE; }
        if (b.y + b.h > this.h) {
          const impactV = b.vy;
          b.y = this.h - b.h;
          if (b.vy > 0) {
            if (impactV > 200) {
              b.deformV -= Math.min(impactV * 0.002, 0.5);
              b.justImpacted = 1;
            }
            b.vy = -b.vy * PHYS.FLOOR_BOUNCE;
            b.vx *= PHYS.FRICTION;
          }
        }
        if (b.y < 0) { b.y = 0; if (b.vy < 0) b.vy = -b.vy * PHYS.WALL_BOUNCE; }
      }

      // Body-body
      for (let i = 0; i < bodies.length; i++) {
        const a = bodies[i];
        for (let j = i + 1; j < bodies.length; j++) {
          const c = bodies[j];
          if (a.fixed && c.fixed) continue;
          if (a.dragging && c.dragging) continue;
          const ov = this._overlap(a, c);
          if (!ov) continue;

          // Resolve along the smallest axis
          if (ov.ox < ov.oy) {
            // Horizontal separation
            const dir = (a.x + a.w / 2) < (c.x + c.w / 2) ? -1 : 1;
            const totalMass = (a.fixed || a.dragging ? 0 : 1) + (c.fixed || c.dragging ? 0 : 1);
            if (totalMass === 0) continue;
            if (a.fixed || a.dragging) {
              c.x -= dir * ov.ox;
              c.vx = -c.vx * PHYS.BLOCK_BOUNCE;
            } else if (c.fixed || c.dragging) {
              a.x += dir * ov.ox;
              a.vx = -a.vx * PHYS.BLOCK_BOUNCE;
            } else {
              a.x += dir * ov.ox / 2;
              c.x -= dir * ov.ox / 2;
              const rel = a.vx - c.vx;
              if ((dir < 0 && rel > 0) || (dir > 0 && rel < 0)) {
                const e = PHYS.BLOCK_BOUNCE;
                const newRel = -rel * e;
                a.vx = (a.vx + c.vx) / 2 + newRel / 2 * (dir < 0 ? 1 : -1);
                c.vx = (a.vx + c.vx) / 2 - newRel / 2 * (dir < 0 ? 1 : -1);
              }
            }
          } else {
            // Vertical separation
            const aBottom = a.y + a.h, cTop = c.y;
            const aOnTop = (a.y + a.h / 2) < (c.y + c.h / 2);
            if (aOnTop) {
              // a sits on c
              if (!a.fixed && !a.dragging) {
                a.y -= ov.oy;
                if (a.vy > 0) {
                  if (a.vy > 200) { a.deformV -= Math.min(a.vy * 0.0015, 0.4); }
                  a.vy = -a.vy * PHYS.BLOCK_BOUNCE;
                }
                a.vx *= PHYS.FRICTION;
              } else if (!c.fixed && !c.dragging) {
                c.y += ov.oy;
                if (c.vy < 0) c.vy = -c.vy * PHYS.BLOCK_BOUNCE;
              }
            } else {
              // c sits on a
              if (!c.fixed && !c.dragging) {
                c.y -= ov.oy;
                if (c.vy > 0) {
                  if (c.vy > 200) { c.deformV -= Math.min(c.vy * 0.0015, 0.4); }
                  c.vy = -c.vy * PHYS.BLOCK_BOUNCE;
                }
                c.vx *= PHYS.FRICTION;
              } else if (!a.fixed && !a.dragging) {
                a.y += ov.oy;
                if (a.vy < 0) a.vy = -a.vy * PHYS.BLOCK_BOUNCE;
              }
            }
          }
        }
      }
    }

    // 3. Recompute resting relationships
    for (const b of bodies) {
      b.restingOn.clear();
      b.supports.clear();
    }
    const TOL = 2;
    for (let i = 0; i < bodies.length; i++) {
      const a = bodies[i];
      // resting on floor
      if (Math.abs((a.y + a.h) - this.h) < TOL && Math.abs(a.vy) < 30) {
        // a is on the floor
      }
      for (let j = 0; j < bodies.length; j++) {
        if (i === j) continue;
        const c = bodies[j];
        // a resting on c if a's bottom ≈ c's top AND they overlap horizontally
        if (Math.abs((a.y + a.h) - c.y) < TOL) {
          const ox = Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x);
          if (ox > 2) {
            a.restingOn.add(c.id);
            c.supports.add(a.id);
          }
        }
      }
    }

    // 4. Visual: decay justImpacted flag
    for (const b of bodies) {
      if (b.justImpacted > 0) b.justImpacted = Math.max(0, b.justImpacted - dt * 4);
    }

    // 5. Snap settled bodies to grid (hard snap once at rest, with one-frame
    // animation flag so the visual jump is eased by CSS). After snapping, hold
    // the body in place so gravity-induced micro-bounces don't drift it off-grid.
    if (this.snapEnabled) {
      const g = this.gridSize;
      for (const b of bodies) {
        if (b.fixed || b.dragging) continue;
        // Clear stale snap-anim flag so it only fires the frame we snap.
        if (b._snapAnimAt && performance.now() - b._snapAnimAt > 240) {
          b.snapAnim = false;
          b._snapAnimAt = 0;
        }
        const speed = Math.abs(b.vx) + Math.abs(b.vy);
        const onSomething = (b.restingOn && b.restingOn.size > 0)
          || Math.abs((b.y + b.h) - this.h) < 2;
        // Wake the body if it's been disturbed (pushed, dragged, or thrown).
        if (b._snapped && (!onSomething || speed > 120)) {
          b._snapped = false;
          b.restFrames = 0;
        }
        if (speed < 60 && onSomething) {
          b.restFrames = (b.restFrames || 0) + 1;
        } else {
          b.restFrames = 0;
        }
        if (b.restFrames >= 3) {
          const tx = Math.round(b.x / g) * g;
          // For y, align block bottom to a grid offset measured from the floor.
          const bottomGap = this.h - (b.y + b.h);
          const targetGap = Math.round(bottomGap / g) * g;
          const ty = this.h - targetGap - b.h;
          if (!b._snapped) {
            if (Math.abs(tx - b.x) > 0.5 || Math.abs(ty - b.y) > 0.5) {
              b.snapAnim = true;
              b._snapAnimAt = performance.now();
            }
            b._snapped = true;
          }
          // Hold the snapped body exactly on grid each frame.
          b.x = tx; b.y = ty;
          b.vx = 0; b.vy = 0;
        }
      }
    }
  }

  // Is this block in the "actionable zone" — touching the floor or only resting on floor-touching blocks?
  // (Equivalent: nothing it depends on is below it that isn't also on the floor.)
  // For our purposes, "actionable" = block's bottom is on the floor, OR all blocks beneath it are completed/gone.
  // Since blocks above auto-fall when below is removed, simpler: actionable = touching the floor.
  isActionable(id) {
    const b = this.bodies.get(id);
    if (!b) return false;
    return Math.abs((b.y + b.h) - this.h) < 3;
  }
}

window.PhysicsWorld = PhysicsWorld;
window.PHYS = PHYS;
