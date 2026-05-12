const KEY = 'nebula_jump_scores'

export function getScores() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

export function saveScore(name, score) {
  const scores = getScores()
  scores.push({ name: name.trim() || 'Anonymous', score, date: new Date().toLocaleDateString() })
  scores.sort((a, b) => b.score - a.score)
  const top10 = scores.slice(0, 10)
  localStorage.setItem(KEY, JSON.stringify(top10))
  return top10
}

export function clearScores() {
  localStorage.removeItem(KEY)
}
