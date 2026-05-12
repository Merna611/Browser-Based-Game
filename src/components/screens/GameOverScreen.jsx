import { useState } from 'react'
import { saveScore } from '../../utils/Storage.js'
import './GameOverScreen.css'

export function GameOverScreen({ score, onRestart, onLeaderboard, onMenu }) {
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (submitted) return
    saveScore(name || 'Anonymous', score)
    setSubmitted(true)
  }

  return (
    <div className="gameover-screen">
      <div className="gameover-content">
        <h1 className="gameover-title">GAME OVER</h1>
        <div className="gameover-score">
          <span className="score-label">Final Score</span>
          <span className="score-value">{score.toLocaleString()}</span>
        </div>

        {!submitted ? (
          <form className="name-form" onSubmit={handleSubmit}>
            <label className="name-label">Enter your name</label>
            <input
              className="name-input"
              type="text"
              maxLength={16}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Player"
              autoFocus
            />
            <button className="btn btn-primary" type="submit">Save Score</button>
          </form>
        ) : (
          <p className="saved-msg">Score saved!</p>
        )}

        <div className="gameover-buttons">
          <button className="btn btn-primary" onClick={onRestart}>Play Again</button>
          <button className="btn btn-secondary" onClick={onLeaderboard}>Leaderboard</button>
          <button className="btn btn-ghost" onClick={onMenu}>Menu</button>
        </div>
      </div>
    </div>
  )
}
