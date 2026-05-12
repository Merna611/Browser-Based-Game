import './HUD.css'

export function HUD({ score, lives, level, timer, coins, totalCoins }) {
  const urgent = timer <= 10

  return (
    <div className="hud">
      <div className="hud-left">
        <div className="hud-item">
          <span className="hud-icon">★</span>
          <span className="hud-val">{score.toLocaleString()}</span>
        </div>
        <div className="hud-item">
          <span className="hud-icon">♥</span>
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`life ${i < lives ? 'life-full' : 'life-empty'}`}>♥</span>
          ))}
        </div>
      </div>

      <div className="hud-center">
        <span className="hud-level">LEVEL {level}</span>
      </div>

      <div className="hud-right">
        <div className="hud-item">
          <span className="hud-icon">🪙</span>
          <span className="hud-val">{coins}/{totalCoins}</span>
        </div>
        <div className={`hud-item hud-timer ${urgent ? 'urgent' : ''}`}>
          <span className="hud-icon">⏱</span>
          <span className="hud-val">{timer}</span>
        </div>
      </div>
    </div>
  )
}
