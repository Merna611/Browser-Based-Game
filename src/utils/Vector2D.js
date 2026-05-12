export class Vector2D {
  constructor(x = 0, y = 0) {
    this.x = x
    this.y = y
  }

  add(v) { return new Vector2D(this.x + v.x, this.y + v.y) }
  sub(v) { return new Vector2D(this.x - v.x, this.y - v.y) }
  scale(s) { return new Vector2D(this.x * s, this.y * s) }
  length() { return Math.sqrt(this.x * this.x + this.y * this.y) }
  normalize() {
    const len = this.length()
    return len > 0 ? this.scale(1 / len) : new Vector2D()
  }
  clone() { return new Vector2D(this.x, this.y) }
}
