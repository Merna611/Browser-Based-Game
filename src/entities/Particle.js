export class Particle {
  constructor(x, y, vx, vy, color, size = 4, life = 30) {
    this.x = x; this.y = y
    this.vx = vx; this.vy = vy
    this.color = color
    this.size = size
    this.maxLife = life
    this.life = life
    this.dead = false
  }

  update(dt) {
    this.x += this.vx * dt
    this.y += this.vy * dt
    this.vy += 0.2 * dt
    this.life -= dt
    if (this.life <= 0) this.dead = true
  }

  get alpha() { return Math.max(0, this.life / this.maxLife) }
}

export function spawnDust(particles, x, y, count = 6) {
  for (let i = 0; i < count; i++) {
    const angle = Math.PI + (Math.random() - 0.5) * Math.PI
    const speed = 1 + Math.random() * 2
    particles.push(new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed - 1,
      `hsl(${30 + Math.random() * 20}, 60%, 70%)`, 2 + Math.random() * 3, 20 + Math.random() * 15))
  }
}

export function spawnCoinCollect(particles, x, y) {
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2
    const speed = 2 + Math.random() * 3
    particles.push(new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed,
      `hsl(${45 + Math.random() * 20}, 100%, 65%)`, 3 + Math.random() * 2, 25 + Math.random() * 10))
  }
}

export function spawnDeathBurst(particles, x, y) {
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 2 + Math.random() * 5
    particles.push(new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed - 2,
      `hsl(${i % 2 === 0 ? 0 : 30}, 90%, 60%)`, 3 + Math.random() * 4, 40 + Math.random() * 20))
  }
}

export function spawnSpring(particles, x, y) {
  for (let i = 0; i < 8; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.6
    const speed = 3 + Math.random() * 4
    particles.push(new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed,
      `hsl(120, 80%, 60%)`, 3, 20))
  }
}
