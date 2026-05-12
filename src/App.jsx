import { useState } from 'react'
import { MenuScreen } from './components/screens/MenuScreen.jsx'
import { GameScreen } from './components/screens/GameScreen.jsx'
import { GameOverScreen } from './components/screens/GameOverScreen.jsx'
import { LeaderboardScreen } from './components/screens/LeaderboardScreen.jsx'

export default function App() {
  const [screen, setScreen] = useState('menu') // 'menu' | 'game' | 'gameover' | 'leaderboard'
  const [finalScore, setFinalScore] = useState(0)

  function handleGameOver(score) {
    setFinalScore(score)
    setScreen('gameover')
  }

  return (
    <div className="app">
      {screen === 'menu' && (
        <MenuScreen
          onPlay={() => setScreen('game')}
          onLeaderboard={() => setScreen('leaderboard')}
        />
      )}
      {screen === 'game' && (
        <GameScreen
          key={Date.now()} // remount on each new game
          onGameOver={handleGameOver}
          onMenu={() => setScreen('menu')}
        />
      )}
      {screen === 'gameover' && (
        <GameOverScreen
          score={finalScore}
          onRestart={() => setScreen('game')}
          onLeaderboard={() => setScreen('leaderboard')}
          onMenu={() => setScreen('menu')}
        />
      )}
      {screen === 'leaderboard' && (
        <LeaderboardScreen onBack={() => setScreen('menu')} />
      )}
    </div>
  )
}
