import { GAME_W, GAME_H } from '../hooks/useResponsive.js'

export class Camera {
  constructor() {
    this.x = 0
    this.y = 0
  }

  update(target, worldWidth, worldHeight) {
    const targetX = target.x + target.w / 2 - GAME_W / 2
    const targetY = target.y + target.h / 2 - GAME_H / 2

    this.x += (targetX - this.x) * 0.1
    this.y += (targetY - this.y) * 0.08

    // clamp to world bounds
    this.x = Math.max(0, Math.min(this.x, worldWidth - GAME_W))
    this.y = Math.max(0, Math.min(this.y, worldHeight - GAME_H))
  }

  toScreen(worldX, worldY) {
    return { x: worldX - this.x, y: worldY - this.y }
  }
}
