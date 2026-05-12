import { useRef, useState, useEffect, useCallback } from 'react'
import { GameEngine } from '../../engine/GameEngine.js'
import { InputManager } from '../../engine/InputManager.js'
import { useGameLoop } from '../../hooks/useGameLoop.js'
import { HUD } from '../ui/HUD.jsx'
import { TouchControls } from '../ui/TouchControls.jsx'
import { GAME_W, GAME_H } from '../../hooks/useResponsive.js'
import './GameScreen.css'

export function GameScreen({ onGameOver, onMenu }) {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const containerRef = useRef(null)
  const [hud, setHud] = useState({ score: 0, lives: 3, level: 1, timer: 120, coins: 0, totalCoins: 10 })
  const [paused, setPaused] = useState(false)
  const [running, setRunning] = useState(false)

  const handleHUD = useCallback(data => setHud({ ...data }), [])
  const handleGameOver = useCallback(score => onGameOver(score), [onGameOver])
  const handleLevelComplete = useCallback(() => {}, [])

  useEffect(() => {
    if (!canvasRef.current) return

    InputManager.init()
    const engine = new GameEngine(
      canvasRef.current,
      handleHUD,
      handleGameOver,
      handleLevelComplete,
    )
    engine.startLevel(0)
    engineRef.current = engine
    setRunning(true)

    return () => {
      engine.destroy()
      InputManager.destroy()
      setRunning(false)
    }
  }, [handleHUD, handleGameOver, handleLevelComplete])

  useGameLoop(dt => {
    if (!paused && engineRef.current) engineRef.current.tick(dt)
  }, running)

  function togglePause() {
    setPaused(p => !p)
  }

  return (
    <div className="game-screen" ref={containerRef}>
      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={GAME_W}
          height={GAME_H}
          className="game-canvas"
        />
        <HUD {...hud} />
        <TouchControls />

        <button className="pause-btn" onClick={togglePause} title="Pause">
          {paused ? '▶' : '⏸'}
        </button>

        {paused && (
          <div className="pause-overlay">
            <div className="pause-box">
              <h2>PAUSED</h2>
              <button className="btn btn-primary" onClick={togglePause}>Resume</button>
              <button className="btn btn-ghost" onClick={onMenu}>Menu</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
