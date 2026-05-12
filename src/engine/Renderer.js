import { GAME_W, GAME_H } from '../hooks/useResponsive.js'
import { STATE } from '../entities/Player.js'

// ─── background layers ───────────────────────────────────────────────────────

function drawParallaxLayer(ctx, camX, worldWidth, layer) {
  const { color, shapes, scrollFactor, offsetY } = layer
  const parallaxX = camX * scrollFactor

  ctx.save()
  ctx.fillStyle = color

  for (const s of shapes) {
    const sx = s.x - parallaxX
    // tile infinitely
    const wrapped = ((sx % worldWidth) + worldWidth) % worldWidth

    ctx.beginPath()
    for (let rep = -1; rep <= 1; rep++) {
      const ox = wrapped + rep * worldWidth
      if (ox > GAME_W + 200 || ox < -200) continue
      ctx.moveTo(ox + s.points[0][0], offsetY + s.points[0][1])
      for (let i = 1; i < s.points.length; i++) {
        ctx.lineTo(ox + s.points[i][0], offsetY + s.points[i][1])
      }
      ctx.closePath()
    }
    ctx.fill()
  }

  ctx.restore()
}

function buildBgLayers(bgColor) {
  // darker sky gradient replacement — just solid + shapes
  const layers = [
    {
      color: 'rgba(255,255,255,0.06)',
      scrollFactor: 0.15,
      offsetY: GAME_H * 0.35,
      shapes: Array.from({ length: 8 }, (_, i) => ({
        x: i * 500 + 50,
        points: [
          [0, 0], [80, -180], [160, -220], [240, -160], [320, 0],
        ],
      })),
    },
    {
      color: 'rgba(255,255,255,0.09)',
      scrollFactor: 0.4,
      offsetY: GAME_H * 0.55,
      shapes: Array.from({ length: 10 }, (_, i) => ({
        x: i * 400 + 100,
        points: [
          [0, 0], [60, -120], [120, -150], [180, -100], [240, 0],
        ],
      })),
    },
    {
      color: 'rgba(255,255,255,0.13)',
      scrollFactor: 0.7,
      offsetY: GAME_H * 0.7,
      shapes: Array.from({ length: 12 }, (_, i) => ({
        x: i * 340 + 60,
        points: [
          [0, 0], [30, -70], [70, -90], [100, -60], [140, 0],
        ],
      })),
    },
  ]
  return layers
}

const bgLayerCache = {}
function getBgLayers(bgColor) {
  if (!bgLayerCache[bgColor]) bgLayerCache[bgColor] = buildBgLayers(bgColor)
  return bgLayerCache[bgColor]
}

// ─── platform drawing ────────────────────────────────────────────────────────

function drawPlatform(ctx, p, cam) {
  if (p.gone) return
  const { x, y } = cam.toScreen(p.x, p.y)
  if (x > GAME_W + p.w || x + p.w < 0) return

  let alpha = 1
  if (p.crumbling) alpha = Math.max(0.3, p.crumbleTimer / 80)

  ctx.globalAlpha = alpha

  if (p.type === 'spring') {
    // green base with coil detail
    ctx.fillStyle = '#2a8a4a'
    ctx.fillRect(x, y, p.w, p.h)
    // spring coil highlight
    ctx.fillStyle = '#3dbe73'
    const bounce = p.springBounce
    const topY = y + (bounce * 8)
    ctx.fillRect(x + 4, topY, p.w - 8, 6)
    ctx.fillRect(x + 8, topY + 6, p.w - 16, 6)
  } else if (p.type === 'crumbling') {
    // cracked orange brown
    ctx.fillStyle = p.color
    ctx.fillRect(x, y, p.w, p.h)
    // crack lines
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(x + p.w * 0.3, y); ctx.lineTo(x + p.w * 0.2, y + p.h)
    ctx.moveTo(x + p.w * 0.7, y); ctx.lineTo(x + p.w * 0.6, y + p.h)
    ctx.stroke()
  } else {
    ctx.fillStyle = p.color
    ctx.fillRect(x, y, p.w, p.h)
  }

  // top highlight
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.fillRect(x, y, p.w, 4)

  ctx.globalAlpha = 1
}

// ─── enemy drawing ───────────────────────────────────────────────────────────

function drawEnemy(ctx, e, cam) {
  if (e.gone) return
  const { x, y } = cam.toScreen(e.x, e.y)
  if (x > GAME_W + 40 || x + e.w < -40) return

  ctx.save()
  if (e.dead) {
    ctx.globalAlpha = Math.max(0, e.deathTimer / 30)
    ctx.translate(x + e.w / 2, y + e.h / 2)
    ctx.rotate(e.deathTimer * 0.1)
    ctx.translate(-e.w / 2, -e.h / 2)
  }

  // body
  ctx.fillStyle = '#e05050'
  ctx.beginPath()
  ctx.ellipse(e.w / 2, e.h * 0.6, e.w / 2, e.h * 0.45, 0, 0, Math.PI * 2)
  ctx.fill()

  // head
  ctx.fillStyle = '#e87070'
  ctx.beginPath()
  ctx.arc(e.w / 2, e.h * 0.28, e.w * 0.38, 0, Math.PI * 2)
  ctx.fill()

  // eyes
  const eyeOffset = e.facing * 4
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(e.w / 2 + eyeOffset, e.h * 0.25, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#222'
  ctx.beginPath()
  ctx.arc(e.w / 2 + eyeOffset + e.facing, e.h * 0.25, 2, 0, Math.PI * 2)
  ctx.fill()

  // legs
  const legSwing = Math.sin(e.frame) * 6
  ctx.strokeStyle = '#c03030'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(e.w * 0.35, e.h * 0.85)
  ctx.lineTo(e.w * 0.35 + legSwing, e.h)
  ctx.moveTo(e.w * 0.65, e.h * 0.85)
  ctx.lineTo(e.w * 0.65 - legSwing, e.h)
  ctx.stroke()

  ctx.restore()
}

// ─── coin drawing ────────────────────────────────────────────────────────────

function drawCoin(ctx, c, cam) {
  if (c.collected) return
  const { x, y } = cam.toScreen(c.x, c.y)
  if (x > GAME_W + 20 || x + c.w < -20) return

  const cx = x + c.w / 2
  const cy = y + c.h / 2 + Math.sin(c.bobOffset) * 3
  const rx = (c.w / 2) * c.scaleX

  // outer glow
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12)
  grd.addColorStop(0, 'rgba(255,220,50,0.6)')
  grd.addColorStop(1, 'rgba(255,220,50,0)')
  ctx.fillStyle = grd
  ctx.beginPath()
  ctx.ellipse(cx, cy, 14 * c.scaleX, 14, 0, 0, Math.PI * 2)
  ctx.fill()

  // coin body
  ctx.fillStyle = '#f5c800'
  ctx.beginPath()
  ctx.ellipse(cx, cy, rx, c.h / 2, 0, 0, Math.PI * 2)
  ctx.fill()

  // shine
  ctx.fillStyle = 'rgba(255,255,200,0.7)'
  ctx.beginPath()
  ctx.ellipse(cx - rx * 0.2, cy - 3, rx * 0.35, 3, -0.3, 0, Math.PI * 2)
  ctx.fill()
}

// ─── player drawing ──────────────────────────────────────────────────────────

function drawPlayer(ctx, p, cam) {
  const { x, y } = cam.toScreen(p.x, p.y)

  ctx.save()
  if (p.invincible > 0 && Math.floor(p.invincible / 4) % 2 === 0) {
    ctx.globalAlpha = 0.4
  }

  const cx = x + p.w / 2
  const cy = y + p.h / 2

  ctx.translate(cx, cy)
  ctx.scale(p.facing * p.stretch, p.squash)
  ctx.translate(-p.w / 2, -p.h / 2)

  const run = Math.sin(p.frame * 2.5)
  const isAir = p.state === STATE.JUMP || p.state === STATE.FALL

  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)'
  ctx.beginPath()
  ctx.ellipse(p.w / 2, p.h + 3, 12, 4, 0, 0, Math.PI * 2)
  ctx.fill()

  // legs
  ctx.strokeStyle = '#3a7ae8'
  ctx.lineWidth = 7
  ctx.lineCap = 'round'
  ctx.beginPath()
  if (isAir) {
    ctx.moveTo(p.w * 0.35, p.h * 0.72)
    ctx.lineTo(p.w * 0.28, p.h * 0.9)
    ctx.moveTo(p.w * 0.65, p.h * 0.72)
    ctx.lineTo(p.w * 0.72, p.h * 0.9)
  } else {
    ctx.moveTo(p.w * 0.35, p.h * 0.72)
    ctx.lineTo(p.w * 0.35 + run * 5, p.h)
    ctx.moveTo(p.w * 0.65, p.h * 0.72)
    ctx.lineTo(p.w * 0.65 - run * 5, p.h)
  }
  ctx.stroke()

  // body
  ctx.fillStyle = p.state === STATE.HURT ? '#ff6060' : '#4a8fff'
  roundRect(ctx, 4, p.h * 0.38, p.w - 8, p.h * 0.45, 6)
  ctx.fill()

  // arms
  ctx.strokeStyle = '#4a8fff'
  ctx.lineWidth = 6
  ctx.lineCap = 'round'
  ctx.beginPath()
  if (isAir) {
    ctx.moveTo(4, p.h * 0.45); ctx.lineTo(-6, p.h * 0.35)
    ctx.moveTo(p.w - 4, p.h * 0.45); ctx.lineTo(p.w + 6, p.h * 0.35)
  } else {
    ctx.moveTo(4, p.h * 0.5); ctx.lineTo(-4, p.h * 0.5 + run * 4)
    ctx.moveTo(p.w - 4, p.h * 0.5); ctx.lineTo(p.w + 4, p.h * 0.5 - run * 4)
  }
  ctx.stroke()

  // head
  ctx.fillStyle = '#ffe0b0'
  ctx.beginPath()
  ctx.arc(p.w / 2, p.h * 0.24, p.w * 0.42, 0, Math.PI * 2)
  ctx.fill()

  // hair
  ctx.fillStyle = '#6a3500'
  ctx.beginPath()
  ctx.arc(p.w / 2, p.h * 0.1, p.w * 0.38, Math.PI, Math.PI * 2)
  ctx.fill()

  // eyes
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.ellipse(p.w * 0.38, p.h * 0.22, 4, 5, 0, 0, Math.PI * 2)
  ctx.ellipse(p.w * 0.62, p.h * 0.22, 4, 5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#222'
  const eyeY = p.state === STATE.FALL ? p.h * 0.24 : p.h * 0.22
  ctx.beginPath()
  ctx.arc(p.w * 0.38, eyeY, 2.5, 0, Math.PI * 2)
  ctx.arc(p.w * 0.62, eyeY, 2.5, 0, Math.PI * 2)
  ctx.fill()

  // mouth
  ctx.strokeStyle = '#b06040'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  if (p.state === STATE.JUMP) {
    ctx.arc(p.w / 2, p.h * 0.32, 4, 0, Math.PI)
  } else {
    ctx.arc(p.w / 2, p.h * 0.3, 3, 0.2, Math.PI - 0.2)
  }
  ctx.stroke()

  ctx.restore()
}

// ─── particle drawing ────────────────────────────────────────────────────────

function drawParticles(ctx, particles, cam) {
  for (const pt of particles) {
    const { x, y } = cam.toScreen(pt.x, pt.y)
    ctx.globalAlpha = pt.alpha
    ctx.fillStyle = pt.color
    ctx.beginPath()
    ctx.arc(x, y, pt.size * pt.alpha, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

// ─── goal flag ───────────────────────────────────────────────────────────────

function drawGoal(ctx, goalX, groundY, cam, frame) {
  const { x, y } = cam.toScreen(goalX, groundY - 80)
  ctx.save()

  // pole
  ctx.strokeStyle = '#aaa'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(x, y + 80); ctx.lineTo(x, y)
  ctx.stroke()

  // waving flag
  ctx.fillStyle = '#ff5a5a'
  ctx.beginPath()
  const wave = Math.sin(frame * 0.05) * 4
  ctx.moveTo(x, y)
  ctx.quadraticCurveTo(x + 20, y + 10 + wave, x + 40, y + 5)
  ctx.quadraticCurveTo(x + 20, y + 20 + wave, x, y + 20)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// ─── main render ─────────────────────────────────────────────────────────────

export function render(ctx, state, cam, frame) {
  const { player, platforms, enemies, coins, particles, level } = state

  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, GAME_H)
  sky.addColorStop(0, level.bgColor)
  sky.addColorStop(1, shiftColor(level.bgColor, 20))
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, GAME_W, GAME_H)

  // parallax layers
  const bgLayers = getBgLayers(level.bgColor)
  for (const layer of bgLayers) drawParallaxLayer(ctx, cam.x, level.worldWidth, layer)

  // goal flag
  drawGoal(ctx, level.goalX, level.groundY, cam, frame)

  // platforms
  for (const p of platforms) drawPlatform(ctx, p, cam)

  // coins
  for (const c of coins) drawCoin(ctx, c, cam)

  // enemies
  for (const e of enemies) drawEnemy(ctx, e, cam)

  // particles
  drawParticles(ctx, particles, cam)

  // player
  drawPlayer(ctx, player, cam)
}

function shiftColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, ((num >> 16) & 0xff) + amount)
  const g = Math.min(255, ((num >> 8) & 0xff) + amount)
  const b = Math.min(255, (num & 0xff) + amount)
  return `rgb(${r},${g},${b})`
}
