import { Player } from '../entities/Player.js'
import { Platform } from '../entities/Platform.js'
import { Enemy } from '../entities/Enemy.js'
import { Coin } from '../entities/Coin.js'
import level1 from './level1.js'
import level2 from './level2.js'
import level3 from './level3.js'

const LEVELS = [level1, level2, level3]

export function loadLevel(index) {
  const data = LEVELS[index]
  if (!data) return null

  const player = new Player(data.playerStart.x, data.playerStart.y)
  const platforms = data.platforms.map(p => new Platform(p))
  const enemies = data.enemies.map(e => new Enemy(e.x, e.y, e.patrolRange))
  const coins = data.coins.map(c => new Coin(c.x, c.y))

  return {
    player,
    platforms,
    enemies,
    coins,
    particles: [],
    level: data,
    levelIndex: index,
    timer: data.timeLimit * 60, // in frames
    frame: 0,
    complete: false,
    failed: false,
  }
}

export function getTotalLevels() { return LEVELS.length }
