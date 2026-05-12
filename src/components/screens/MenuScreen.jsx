import './MenuScreen.css'

export function MenuScreen({ onPlay, onLeaderboard }) {
  return (
    <div className="menu-screen">
      <div className="menu-content">
        <div className="menu-logo">
          <span className="logo-nebula">NEBULA</span>
          <span className="logo-jump">JUMP</span>
        </div>
        <p className="menu-tagline">A physics platformer adventure</p>

        <div className="menu-controls">
          <div className="control-row"><kbd>← →</kbd> / <kbd>A D</kbd> Move</div>
          <div className="control-row"><kbd>↑</kbd> / <kbd>W</kbd> / <kbd>Space</kbd> Jump</div>
          <div className="control-row"><span className="tip">Wall-jump off walls!</span></div>
        </div>

        <div className="menu-buttons">
          <button className="btn btn-primary" onClick={onPlay}>Play Game</button>
          <button className="btn btn-secondary" onClick={onLeaderboard}>Leaderboard</button>
        </div>

        <p className="menu-objectives">
          Collect coins · Stomp enemies · Reach the flag
        </p>
      </div>
    </div>
  )
}
