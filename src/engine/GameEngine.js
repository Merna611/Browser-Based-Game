import { Camera } from './Camera.js'
import { InputManager } from './InputManager.js'
import { render } from './Renderer.js'
import { resolvePlatformCollision, aabbOverlap } from './Physics.js'
import { loadLevel, getTotalLevels } from '../levels/LevelManager.js'
import { spawnDust, spawnCoinCollect, spawnDeathBurst, spawnSpring } from '../entities/Particle.js'
import { GAME_H } from '../hooks/useResponsive.js'

const COIN_SCORE = 100
const ENEMY_STOMP_SCORE = 200
const LEVEL_BONUS = 1000
const TIME_BONUS_PER_FRAME = 0.5

export class GameEngine {
  constructor(canvas, onHUDUpdate, onGameOver, onLevelComplete) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.onHUDUpdate = onHUDUpdate
    this.onGameOver = onGameOver
    this.onLevelComplete = onLevelComplete

    this.camera = new Camera()
    this.state = null
    this.totalScore = 0
    this.currentLevel = 0
    this.respawnTimer = 0
    this.transitionTimer = 0
    this.phase = 'playing' // 'playing' | 'dying' | 'transitioning'
  }

  startLevel(index) {
    this.state = loadLevel(index)
    if (!this.state) return
    this.currentLevel = index
    this.phase = 'playing'
    this.respawnTimer = 0
    this.camera.x = 0; this.camera.y = 0
    this._emitHUD()
  }

  tick(dt) {
    if (!this.state) return
    const { player, platforms, enemies, coins, particles, level } = this.state

    this.state.frame += dt

    if (this.phase === 'dying') {
      this.respawnTimer -= dt
      player.vy += 0.5 * dt
      player.y += player.vy * dt
      // update camera still
      this.camera.update(player, level.worldWidth, level.worldHeight)
      this._renderFrame()
      if (this.respawnTimer <= 0) {
        if (player.lives <= 0) {
          this.onGameOver(this.totalScore)
        } else {
          this.startLevel(this.currentLevel)
        }
      }
      return
    }

    if (this.phase === 'transitioning') {
      this.transitionTimer -= dt
      if (this.transitionTimer <= 0) {
        const next = this.currentLevel + 1
        if (next >= getTotalLevels()) {
          this.onGameOver(this.totalScore)
        } else {
          const lives = player.lives
          const score = this.totalScore
          this.startLevel(next)
          this.state.player.lives = lives
          this.totalScore = score
          this._emitHUD()
        }
      }
      this._renderFrame()
      return
    }

    // timer
    if (this.state.timer > 0) {
      this.state.timer -= dt
      if (this.state.timer <= 0) {
        this.state.timer = 0
        this._killPlayer()
        return
      }
    }

    // input
    player.processInput(InputManager, dt)
    player.applyGravity(dt)
    player.move(dt)

    // update platforms
    const prevPlatformX = platforms.map(p => p.x)
    const prevPlatformY = platforms.map(p => p.y)
    for (const p of platforms) p.update(dt)

    // push player with moving platforms
    for (let i = 0; i < platforms.length; i++) {
      const p = platforms[i]
      if (p.type !== 'moving' || p.gone) continue
      const col = aabbOverlap(player, p)
      if (col && col.overlapY < col.overlapX && col.dy < 0) {
        // player on top — move with platform
        player.x += p.x - prevPlatformX[i]
        player.y += p.y - prevPlatformY[i]
      }
    }

    // collision detection
    player.preCollision()
    for (const p of platforms) {
      if (p.gone) continue
      const wasAbove = player.y + player.h - 2 <= p.y
      resolvePlatformCollision(player, p)
      if (p.type === 'crumbling' && player.onGround) {
        const col = aabbOverlap(player, p)
        if (col && col.dy < 0) p.triggerCrumble()
      }
      if (p.type === 'spring' && player.onGround) {
        const col = aabbOverlap(player, p)
        if (col && col.dy < 0) {
          player.vy = p.springForce
          player.onGround = false
          p.triggerSpring()
          spawnSpring(particles, player.x + player.w / 2, player.y + player.h)
        }
      }
    }

    // spawn dust on land
    if (player.onGround && Math.abs(player.vx) > 1) {
      if (Math.floor(this.state.frame) % 8 === 0) {
        spawnDust(particles, player.x + player.w / 2, player.y + player.h, 2)
      }
    }

    player.postCollision(dt)

    // fell off world
    if (player.y > GAME_H + 100) {
      this._killPlayer()
      return
    }

    // update enemies
    for (const e of enemies) {
      e.update(dt)
      if (e.dead || e.gone) continue
      const col = aabbOverlap(player, e)
      if (col) {
        const stompY = player.y + player.h - e.y
        if (stompY < 16 && player.vy > 0) {
          // stomp
          e.stomp()
          player.vy = -8
          this.totalScore += ENEMY_STOMP_SCORE
          spawnDust(particles, e.x + e.w / 2, e.y, 8)
          this._emitHUD()
        } else {
          player.hurt(e.x)
          if (player.dead) { this._killPlayer(); return }
          this._emitHUD()
        }
      }
    }

    // collect coins
    for (const c of coins) {
      if (c.collected) continue
      c.update(dt)
      const col = aabbOverlap(player, { x: c.x, y: c.y, w: c.w, h: c.h })
      if (col) {
        c.collected = true
        this.totalScore += COIN_SCORE
        spawnCoinCollect(particles, c.x + c.w / 2, c.y + c.h / 2)
        this._emitHUD()
      }
    }

    // update particles
    for (const pt of particles) pt.update(dt)
    this.state.particles = particles.filter(pt => !pt.dead)

    // check goal
    const allCoins = coins.every(c => c.collected)
    const playerReachedGoal = player.x + player.w >= level.goalX
    if (playerReachedGoal) {
      this.totalScore += LEVEL_BONUS + Math.floor(this.state.timer * TIME_BONUS_PER_FRAME)
      this._emitHUD()
      this.phase = 'transitioning'
      this.transitionTimer = 90
    }

    // camera
    this.camera.update(player, level.worldWidth, level.worldHeight)
    this._renderFrame()
    this._emitHUD()
  }

  _renderFrame() {
    render(this.ctx, this.state, this.camera, this.state.frame)
  }

  _killPlayer() {
    const { player, particles } = this.state
    spawnDeathBurst(particles, player.x + player.w / 2, player.y + player.h / 2)
    player.dead = true
    this.phase = 'dying'
    this.respawnTimer = 80
  }

  _emitHUD() {
    const { player, timer, levelIndex } = this.state
    this.onHUDUpdate({
      score: this.totalScore,
      lives: player.lives,
      level: levelIndex + 1,
      timer: Math.ceil(timer / 60),
      coins: this.state.coins.filter(c => c.collected).length,
      totalCoins: this.state.coins.length,
    })
  }

  destroy() {
    // InputManager lifecycle owned by GameScreen
  }
}
