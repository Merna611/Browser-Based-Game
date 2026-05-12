export class Platform {
  constructor({ x, y, w, h, type = 'static', moveRange = 0, moveSpeed = 1, moveAxis = 'x', color }) {
    this.x = x; this.y = y; this.w = w; this.h = h
    this.type = type
    this.originX = x; this.originY = y
    this.moveRange = moveRange
    this.moveSpeed = moveSpeed
    this.moveAxis = moveAxis
    this.color = color || this._defaultColor()
    this.moveT = Math.random() * Math.PI * 2
    this.crumbleTimer = 0
    this.crumbling = false
    this.gone = false
    this.springBounce = 0 // 0..1 animation
  }

  _defaultColor() {
    switch (this.type) {
      case 'moving': return '#4a9eff'
      case 'crumbling': return '#c8703a'
      case 'spring': return '#3dbe73'
      default: return '#5a7fa8'
    }
  }

  update(dt) {
    if (this.type === 'moving') {
      this.moveT += this.moveSpeed * 0.03 * dt
      if (this.moveAxis === 'x') {
        this.x = this.originX + Math.sin(this.moveT) * this.moveRange
      } else {
        this.y = this.originY + Math.sin(this.moveT) * this.moveRange
      }
    }

    if (this.type === 'crumbling' && this.crumbling) {
      this.crumbleTimer -= dt
      if (this.crumbleTimer <= 0) this.gone = true
    }

    if (this.springBounce > 0) {
      this.springBounce -= dt * 0.08
      if (this.springBounce < 0) this.springBounce = 0
    }
  }

  triggerCrumble() {
    if (!this.crumbling) {
      this.crumbling = true
      this.crumbleTimer = 80
    }
  }

  triggerSpring() {
    this.springBounce = 1
  }

  // Used for spring platforms — returns a boosted jump force
  get springForce() { return this.type === 'spring' ? -22 : 0 }
}
