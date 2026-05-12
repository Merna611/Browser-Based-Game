export class Enemy {
  constructor(x, y, patrolRange = 200) {
    this.x = x; this.y = y
    this.w = 32; this.h = 32
    this.vx = 1.5; this.vy = 0
    this.onGround = false
    this.patrolStart = x
    this.patrolRange = patrolRange
    this.facing = 1
    this.dead = false
    this.deathTimer = 0
    this.frame = 0
  }

  update(dt) {
    if (this.dead) {
      this.deathTimer -= dt
      this.vy += 0.5 * dt
      this.y += this.vy * dt
      if (this.deathTimer <= 0) this.gone = true
      return
    }

    this.frame += dt * 0.12

    // patrol back and forth
    this.x += this.vx * dt
    if (this.x < this.patrolStart) {
      this.x = this.patrolStart
      this.vx = Math.abs(this.vx)
      this.facing = 1
    } else if (this.x + this.w > this.patrolStart + this.patrolRange) {
      this.x = this.patrolStart + this.patrolRange - this.w
      this.vx = -Math.abs(this.vx)
      this.facing = -1
    }
  }

  stomp() {
    this.dead = true
    this.deathTimer = 30
    this.vy = -5
    this.gone = false
  }
}
