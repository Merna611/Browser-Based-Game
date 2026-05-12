import { useEffect, useRef } from 'react'

export function useGameLoop(tick, running = true) {
  const rafRef = useRef(null)
  const lastRef = useRef(null)
  const tickRef = useRef(tick)
  tickRef.current = tick

  useEffect(() => {
    if (!running) return
    lastRef.current = null

    function loop(ts) {
      if (lastRef.current === null) lastRef.current = ts
      const raw = ts - lastRef.current
      lastRef.current = ts
      const dt = Math.min(raw / 16.667, 3) // cap at 3x slow-mo
      tickRef.current(dt)
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [running])
}
