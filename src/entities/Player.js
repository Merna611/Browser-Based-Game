import {
  GRAVITY, MAX_FALL, JUMP_FORCE, WALL_JUMP_VX, WALL_JUMP_VY,
  GROUND_FRICTION, AIR_DAMPING, MOVE_SPEED, COYOTE_FRAMES, JUMP_BUFFER_FRAMES,
} from '../engine/Physics.js'

export const STATE = { IDLE: 'idle', RUN: 'run', JUMP: 'jump', FALL: 'fall', HURT: 'hurt', DEAD: 'dead' }

export class Player {
  constructor(x, y) {
    this.x = x; this.y = y
    this.w = 28; this.h = 36
    this.vx = 0; this.vy = 0
    this.onGround = false
    this.touchingWallLeft = false
    this.touchingWallRight = false
    this.coyoteTimer = 0
    this.jumpBuffer = 0
    this.state = STATE.IDLE
    this.facing = 1
    this.frame = 0
    this.hurtTimer = 0
    this.dead = false
    this.invincible = 0 // frames
    this.lives = 3
    this.score = 0
    this.jumpHeld = false
    this.squash = 1 // y scale for squash-stretch
    this.stretch = 1 // x scale
  }

  processInput(input, dt) {
    if (this.dead || this.hurtTimer > 0) return

    // horizontal
    if (input.left) {
      this.vx -= MOVE_SPEED * 0.3 * dt
      if (this.vx < -MOVE_SPEED) this.vx = -MOVE_SPEED
      this.facing = -1
    } else if (input.right) {
      this.vx += MOVE_SPEED * 0.3 * dt
      if (this.vx > MOVE_SPEED) this.vx = MOVE_SPEED
      this.facing = 1
    } else {
      if (this.onGround) this.vx *= GROUND_FRICTION
    }
    if (!this.onGround) this.vx *= Math.pow(AIR_DAMPING, dt)

    // jump buffer
    if (input.consumeJumpPress()) this.jumpBuffer = JUMP_BUFFER_FRAMES

    // jump held — variable height
    if (!input.jump && this.jumpHeld && this.vy < -4) {
      this.vy *= 0.85
    }
    this.jumpHeld = input.jump

    const canJump = this.onGround || this.coyoteTimer > 0
    if (this.jumpBuffer > 0 && canJump) {
      this.vy = JUMP_FORCE
      this.jumpBuffer = 0
      this.coyoteTimer = 0
      this.squash = 0.6; this.stretch = 1.3
    }

    // wall jump
    if (this.jumpBuffer > 0 && !canJump) {
      if (this.touchingWallLeft) {
        this.vx = WALL_JUMP_VX; this.vy = WALL_JUMP_VY
        this.jumpBuffer = 0
      } else if (this.touchingWallRight) {
        this.vx = -WALL_JUMP_VX; this.vy = WALL_JUMP_VY
        this.jumpBuffer = 0
      }
    }

    if (this.jumpBuffer > 0) this.jumpBuffer--
  }

  applyGravity(dt) {
    this.vy += GRAVITY * dt
    if (this.vy > MAX_FALL) this.vy = MAX_FALL
  }

  move(dt) {
    this.x += this.vx * dt
    this.y += this.vy * dt
  }

  preCollision() {
    this.onGround = false
    this.touchingWallLeft = false
    this.touchingWallRight = false
  }

  postCollision(dt) {
    if (this.onGround) {
      this.coyoteTimer = COYOTE_FRAMES
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt)
    }

    // squash-stretch recovery
    this.squash += (1 - this.squash) * 0.2
    this.stretch += (1 - this.stretch) * 0.2

    // land squash
    if (this.onGround && this.vy === 0 && this.state === STATE.FALL) {
      this.squash = 1.4; this.stretch = 0.7
    }

    this.updateState()
    this.frame += dt * (this.state === STATE.RUN ? 0.25 : 0.08)
    if (this.invincible > 0) this.invincible -= dt
    if (this.hurtTimer > 0) {
      this.hurtTimer -= dt
      this.vx = this.hurtDir * 3
      this.vy = Math.min(this.vy, -2)
    }
  }

  updateState() {
    if (this.dead) { this.state = STATE.DEAD; return }
    if (this.hurtTimer > 0) { this.state = STATE.HURT; return }
    if (!this.onGround) {
      this.state = this.vy < 0 ? STATE.JUMP : STATE.FALL
    } else {
      this.state = Math.abs(this.vx) > 0.3 ? STATE.RUN : STATE.IDLE
    }
  }

  hurt(fromX) {
    if (this.invincible > 0 || this.dead) return
    this.lives--
    this.hurtTimer = 40
    this.invincible = 80
    this.hurtDir = this.x > fromX ? 1 : -1
    if (this.lives <= 0) this.dead = true
  }
}
