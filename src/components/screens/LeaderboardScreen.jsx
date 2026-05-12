import { getScores, clearScores } from '../../utils/Storage.js'
import { useState } from 'react'
import './LeaderboardScreen.css'

export function LeaderboardScreen({ onBack }) {
  const [scores, setScores] = useState(() => getScores())

  function handleClear() {
    clearScores()
    setScores([])
  }

  return (
    <div className="lb-screen">
      <div className="lb-content">
        <h1 className="lb-title">LEADERBOARD</h1>

        {scores.length === 0 ? (
          <p className="lb-empty">No scores yet. Play a game!</p>
        ) : (
          <ol className="lb-list">
            {scores.map((s, i) => (
              <li key={i} className={`lb-row rank-${i + 1}`}>
                <span className="lb-rank">#{i + 1}</span>
                <span className="lb-name">{s.name}</span>
                <span className="lb-score">{s.score.toLocaleString()}</span>
                <span className="lb-date">{s.date}</span>
              </li>
            ))}
          </ol>
        )}

        <div className="lb-buttons">
          <button className="btn btn-primary" onClick={onBack}>Back</button>
          {scores.length > 0 && (
            <button className="btn btn-ghost" onClick={handleClear}>Clear</button>
          )}
        </div>
      </div>
    </div>
  )
}
