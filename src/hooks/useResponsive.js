import { useEffect, useState, useRef } from 'react'

const GAME_W = 1280
const GAME_H = 720

export function useResponsive(containerRef) {
  const [dims, setDims] = useState({ width: GAME_W, height: GAME_H, scale: 1 })

  useEffect(() => {
    if (!containerRef.current) return

    function update() {
      const { clientWidth: cw, clientHeight: ch } = containerRef.current
      const scale = Math.min(cw / GAME_W, ch / GAME_H)
      setDims({ width: Math.round(GAME_W * scale), height: Math.round(GAME_H * scale), scale })
    }

    const ro = new ResizeObserver(update)
    ro.observe(containerRef.current)
    update()
    return () => ro.disconnect()
  }, [containerRef])

  return dims
}

export { GAME_W, GAME_H }
