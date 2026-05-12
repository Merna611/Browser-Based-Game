export const GRAVITY = 0.55
export const MAX_FALL = 16
export const JUMP_FORCE = -13
export const WALL_JUMP_VX = 9
export const WALL_JUMP_VY = -10
export const GROUND_FRICTION = 0.82
export const AIR_DAMPING = 0.92
export const MOVE_SPEED = 5
export const COYOTE_FRAMES = 6
export const JUMP_BUFFER_FRAMES = 8

export function applyGravity(entity, dt) {
  entity.vy += GRAVITY * dt
  if (entity.vy > MAX_FALL) entity.vy = MAX_FALL
}

// AABB overlap test — returns {dx, dy, overlapX, overlapY} or null
export function aabbOverlap(a, b) {
  const ax = a.x, ay = a.y, aw = a.w, ah = a.h
  const bx = b.x, by = b.y, bw = b.w, bh = b.h

  const overlapX = (ax + aw / 2) - (bx + bw / 2)
  const overlapY = (ay + ah / 2) - (by + bh / 2)
  const halfW = (aw + bw) / 2
  const halfH = (ah + bh) / 2

  if (Math.abs(overlapX) >= halfW || Math.abs(overlapY) >= halfH) return null
  return {
    overlapX: halfW - Math.abs(overlapX),
    overlapY: halfH - Math.abs(overlapY),
    dx: overlapX < 0 ? -1 : 1,
    dy: overlapY < 0 ? -1 : 1,
  }
}

// Returns true if entity's bottom edge collides with platform's top
export function resolvePlatformCollision(entity, platform) {
  const col = aabbOverlap(entity, platform)
  if (!col) return false

  if (col.overlapY < col.overlapX) {
    // vertical resolution
    entity.y += col.dy * col.overlapY
    if (col.dy < 0) {
      // landed on top
      entity.vy = 0
      entity.onGround = true
    } else {
      // hit ceiling
      entity.vy = Math.max(entity.vy, 0)
    }
  } else {
    // horizontal resolution — wall contact
    entity.x += col.dx * col.overlapX
    entity.vx = 0
    if (col.dx < 0) entity.touchingWallRight = true
    else entity.touchingWallLeft = true
  }
  return true
}
