export class Coin {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.w = 20
    this.h = 20
    this.collected = false
    this.frame = 0
    this.bobOffset = Math.random() * Math.PI * 2
  }

  update(dt) {
    this.frame += dt * 0.08
    this.bobOffset += dt * 0.05
  }

  get centerX() { return this.x + this.w / 2 }
  get centerY() { return this.y + this.h / 2 + Math.sin(this.bobOffset) * 3 }
  // squish effect: wide when facing, thin when side-on
  get scaleX() { return Math.abs(Math.cos(this.frame)) * 0.8 + 0.2 }
}
