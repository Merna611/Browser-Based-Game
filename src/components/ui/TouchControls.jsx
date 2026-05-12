import { InputManager } from '../../engine/InputManager.js'
import './TouchControls.css'

function pad(name, label, className) {
  return (
    <button
      className={`tc-btn ${className}`}
      onPointerDown={e => { e.preventDefault(); InputManager.setButton(name, true) }}
      onPointerUp={e => { e.preventDefault(); InputManager.setButton(name, false) }}
      onPointerLeave={e => { e.preventDefault(); InputManager.setButton(name, false) }}
    >
      {label}
    </button>
  )
}

export function TouchControls() {
  return (
    <div className="tc-overlay">
      <div className="tc-left">
        {pad('left', '◀', 'tc-left-btn')}
        {pad('right', '▶', 'tc-right-btn')}
      </div>
      <div className="tc-right">
        {pad('jump', 'JUMP', 'tc-jump-btn')}
      </div>
    </div>
  )
}
